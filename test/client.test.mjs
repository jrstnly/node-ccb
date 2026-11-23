// Exercises the client against a local stand-in for the API (no network access needed).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

import { CCB, CCBError, Search } from '../dist/esm/index.js';
import { Auth } from '../dist/esm/auth.js';
import { Data } from '../dist/esm/data.js';

let server;
let base;
let requests = [];
let handler = () => ({ status: 404 });

before(async () => {
	server = createServer((req, res) => {
		const chunks = [];
		req.on('data', (c) => chunks.push(c));
		req.on('end', () => {
			const raw = Buffer.concat(chunks).toString();
			let body = raw;
			try {
				body = JSON.parse(raw);
			} catch {}
			const url = new URL(req.url, 'http://localhost');
			const record = { method: req.method, path: url.pathname, search: url.search, headers: req.headers, body };
			requests.push(record);
			const out = handler(record) || {};
			res.writeHead(out.status || 200, { 'content-type': 'application/json', ...(out.headers || {}) });
			res.end(out.body === undefined ? '' : JSON.stringify(out.body));
		});
	});
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

// Build a client whose API and token hosts point at the local server.
function client(stored = {}, config = {}) {
	const saved = [];
	const auth = new Auth();
	Object.defineProperty(auth, 'hosts', { get: () => ({ authorize: 'https://oauth.example', api: base }) });
	auth.configure({
		church: 'demo',
		client: 'id',
		secret: 'secret',
		redirectUri: 'https://app.example/callback',
		grantType: 'authorization_code',
		dataGetter: () => stored,
		dataSetter: (data) => {
			saved.push(data);
		},
		...config,
	});
	const ccb = new CCB();
	ccb.auth = auth;
	ccb.data = new Data(auth);
	requests = [];
	return { ccb, auth, saved };
}

const future = () => new Date(Date.now() + 3600e3).toISOString();
const tokenResponse = (n) => ({ body: { access_token: `access-${n}`, token_type: 'bearer', expires_in: 7200, refresh_token: `refresh-${n}` } });

test('builds the authorization URL', async () => {
	const { ccb } = client({}, { scope: ['read:individuals', 'read:groups'], state: 'xyz' });
	const url = new URL(ccb.authorizationUrl);
	assert.equal(url.pathname, '/oauth/authorize');
	assert.equal(url.searchParams.get('client_id'), 'id');
	assert.equal(url.searchParams.get('response_type'), 'code');
	assert.equal(url.searchParams.get('redirect_uri'), 'https://app.example/callback');
	assert.equal(url.searchParams.get('subdomain'), 'demo');
	assert.equal(url.searchParams.get('scope'), 'read:individuals read:groups');
	assert.equal(url.searchParams.get('state'), 'xyz');
});

test('exchanges an authorization code, stores the rotating refresh token, and drops the code', async () => {
	const { auth, saved } = client({ code: 'the-code' });
	handler = () => tokenResponse(1);
	await auth.load();
	assert.equal(await auth.token(), 'access-1');
	assert.deepEqual(requests[0].body, {
		grant_type: 'authorization_code',
		subdomain: 'demo',
		client_id: 'id',
		client_secret: 'secret',
		code: 'the-code',
		redirect_uri: 'https://app.example/callback',
	});
	assert.equal(requests[0].headers.accept, 'application/vnd.ccbchurch.v2+json');
	const last = saved.at(-1);
	assert.equal(last.accessToken, 'access-1');
	assert.equal(last.refreshToken, 'refresh-1');
	assert.equal(last.code, null);
});

test('refreshes an expired token once for concurrent calls', async () => {
	const { ccb, saved } = client({ accessToken: 'old', refreshToken: 'refresh-0', tokenExpiration: '2000-01-01T00:00:00Z' });
	await ccb.auth.load();
	handler = (r) => (r.path === '/oauth/token' ? tokenResponse(2) : { body: { ok: true } });
	await Promise.all([ccb.api.church.getChurch(), ccb.api.church.getChurch(), ccb.api.church.getChurch()]);
	const tokenCalls = requests.filter((r) => r.path === '/oauth/token');
	assert.equal(tokenCalls.length, 1);
	assert.equal(tokenCalls[0].body.grant_type, 'refresh_token');
	assert.equal(tokenCalls[0].body.refresh_token, 'refresh-0');
	assert.equal(saved.at(-1).refreshToken, 'refresh-2');
	assert.ok(requests.filter((r) => r.path === '/church').every((r) => r.headers.authorization === 'Bearer access-2'));
});

test('refreshes and retries once after a 401', async () => {
	const { ccb } = client({ accessToken: 'revoked', refreshToken: 'refresh-0', tokenExpiration: future() });
	await ccb.auth.load();
	handler = (r) => {
		if (r.path === '/oauth/token') return tokenResponse(3);
		return r.headers.authorization === 'Bearer access-3' ? { body: { id: 1 } } : { status: 401 };
	};
	assert.deepEqual(await ccb.api.session.getMe(), { id: 1 });
	assert.deepEqual(requests.map((r) => r.path), ['/me', '/oauth/token', '/me']);
});

test('connect returns a redirect when the stored grant is no longer valid', async () => {
	const { ccb, saved } = client({ refreshToken: 'spent' });
	const stored = { refreshToken: 'spent' };
	handler = () => ({ status: 401, body: { error: 'invalid_grant', error_description: 'revoked' } });
	const result = await ccb.connect({ church: 'demo', client: 'id', secret: 'secret', redirectUri: 'https://app.example/callback', grantType: 'authorization_code', dataGetter: () => stored, dataSetter: (d) => saved.push(d) });
	assert.equal(result.type, 'redirect');
	assert.match(result.data, /\/oauth\/authorize\?/);
	assert.equal(saved.at(-1).refreshToken, null);
});

test('default client_credentials grant re-sends the stored code and keeps it', async () => {
	const { auth, saved } = client({ code: 'legacy' }, { grantType: undefined });
	handler = () => ({ body: { access_token: 'a', expires_in: 7200 } });
	await auth.load();
	await auth.token();
	assert.equal(requests[0].body.grant_type, 'client_credentials');
	assert.equal(requests[0].body.code, 'legacy');
	assert.equal(saved.at(-1).code, 'legacy');
});

test('sends path, query and JSON body, and returns the parsed body', async () => {
	const { ccb } = client({ accessToken: 't', tokenExpiration: future() });
	await ccb.auth.load();
	handler = (r) => ({ body: { echoed: r.body } });
	const result = await ccb.api.individuals.updateIndividual(42, { first_name: 'Ada' });
	assert.deepEqual(result, { echoed: { first_name: 'Ada' } });
	assert.equal(requests[0].method, 'PUT');
	assert.equal(requests[0].path, '/individuals/42');
	assert.equal(requests[0].headers.authorization, 'Bearer t');
	assert.equal(requests[0].headers.accept, 'application/vnd.ccbchurch.v2+json');

	await ccb.api.groups.addGroupMembers(7, { individual_ids: [1, 2], status: 'member' });
	assert.equal(requests[1].method, 'POST');
	assert.equal(requests[1].path, '/groups/7/members');
	assert.equal(requests[1].search, '?individual_ids%5B%5D=1&individual_ids%5B%5D=2&status=member');
});

test('uploads multipart form fields', async () => {
	const { ccb } = client({ accessToken: 't', tokenExpiration: future() });
	await ccb.auth.load();
	handler = () => ({ body: { id: 9 } });
	await ccb.api.files.uploadFile({ file: { data: Buffer.from('hello'), filename: 'a.txt', contentType: 'text/plain' }, label: 'Greeting' });
	assert.match(requests[0].headers['content-type'], /^multipart\/form-data; boundary=/);
	assert.match(requests[0].body, /name="file"; filename="a.txt"/);
	assert.match(requests[0].body, /name="label"\r\n\r\nGreeting/);
});

test('exposes pagination and rate limit headers, and paginates', async () => {
	const { ccb } = client({ accessToken: 't', tokenExpiration: future() });
	await ccb.auth.load();
	handler = (r) => {
		const page = Number(new URLSearchParams(r.search).get('page'));
		const items = page === 1 ? Array.from({ length: 25 }, (_, i) => ({ id: i })) : [{ id: 25 }];
		return { body: items, headers: { 'x-page': String(page), 'x-per-page': '25', 'x-total-pages': '2', 'x-total': '26', 'x-ratelimit-limit': '60', 'x-ratelimit-remaining': '59', 'x-ratelimit-reset': '1700000000' } };
	};
	const response = await ccb.request({ path: '/individuals', query: { page: 1 } });
	assert.deepEqual(response.pagination, { page: 1, perPage: 25, totalPages: 2, total: 26, offset: undefined, nextPage: undefined });
	assert.equal(response.rateLimit.remaining, 59);

	const all = [];
	for await (const item of ccb.paginate((q) => ccb.api.individuals.getIndividuals(q))) all.push(item);
	assert.equal(all.length, 26);
});

test('retries a rate-limited request after retry-after', async () => {
	const { ccb } = client({ accessToken: 't', tokenExpiration: future() });
	await ccb.auth.load();
	let calls = 0;
	handler = () => (++calls === 1 ? { status: 429, headers: { 'retry-after': '1' }, body: { error: 'Rate limit exceeded', retry_after: 1 } } : { body: [] });
	const started = Date.now();
	assert.deepEqual(await ccb.api.campuses.getCampuses(), []);
	assert.equal(calls, 2);
	assert.ok(Date.now() - started >= 900);
});

test('throws CCBError with status and body', async () => {
	const { ccb } = client({ accessToken: 't', tokenExpiration: future() }, { maxRetries: 0 });
	await ccb.auth.load();
	handler = () => ({ status: 412, body: { errors: [{ message: 'First name is required' }] } });
	await assert.rejects(ccb.api.individuals.createIndividual({}), (e) => {
		assert.ok(e instanceof CCBError);
		assert.equal(e.status, 412);
		assert.equal(e.message, 'First name is required');
		return true;
	});
	handler = () => ({ status: 429, headers: { 'retry-after': '5' }, body: { error: 'Rate limit exceeded', retry_after: 5 } });
	await assert.rejects(ccb.api.church.getChurch(), (e) => e.status === 429 && e.retryAfter === 5);
});

test('hand-written resources keep working', async () => {
	const { ccb } = client({ accessToken: 't', tokenExpiration: future() });
	await ccb.auth.load();
	handler = (r) => ({ body: { path: r.path, body: r.body } });
	assert.deepEqual(await ccb.individual('5').get(), { path: '/individuals/5', body: '' });
	assert.deepEqual(await ccb.individual(5).addToGroup(8), { path: '/groups/8/members', body: { ids: [5] } });
	assert.equal((await ccb.groups.get({ per_page: 100 })).path, '/groups');
});

test('search honours the inverted flag and lets config override the defaults', async () => {
	assert.equal(Search.filter('equal', 'first_name', 'Ada').inverted, false);
	assert.equal(Search.filter('equal', 'first_name', 'Ada', true).inverted, true);

	const { ccb } = client({ accessToken: 't', tokenExpiration: future() });
	await ccb.auth.load();
	handler = (r) => ({ body: r.body });
	const filters = Search.filter('equal', 'first_name', 'Ada', true);

	const defaults = await ccb.search('individuals').run(filters);
	assert.equal(requests[0].path, '/search/individuals/results');
	assert.deepEqual(defaults.configuration.filter_profile_type, ['active']);
	assert.equal(defaults.configuration.include_unlisted, true);
	assert.equal(defaults.filters.inverted, true);

	const custom = await ccb.search('individuals', { filter_profile_type: ['active', 'inactive'], include_unlisted: false }).run(filters);
	assert.deepEqual(custom.configuration.filter_profile_type, ['active', 'inactive']);
	assert.equal(custom.configuration.include_unlisted, false);
	assert.equal(custom.configuration.include_lau, true);
});
