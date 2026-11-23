// Read-only smoke test against the real API. Makes GET requests only.
//
//   1. Copy .env-sample to .env and fill it in.
//   2. npm run test:live
//
// If the church has not authorized the application yet, the script prints the URL to visit.
// After authorizing, put the `code` query parameter from the redirect into CCB_CODE and run again.
// Tokens are kept in db.json (gitignored) so later runs reuse them.
//
// Output is limited to counts and field names so that no personal data ends up in the terminal.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CCB } from '../dist/esm/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = join(root, '.env');
const store = join(root, 'db.json');

if (!existsSync(envFile)) {
	console.error('No .env file found. Copy .env-sample to .env and fill it in.');
	process.exit(2);
}
process.loadEnvFile(envFile);

const env = (name) => (process.env[name] || '').trim();
for (const name of ['CCB_CHURCH', 'CCB_CLIENT', 'CCB_SECRET']) {
	if (!env(name) || env(name).startsWith('**')) {
		console.error(`${name} is not set in .env`);
		process.exit(2);
	}
}

const ccb = new CCB();
let connection;
try {
	connection = await ccb.connect({
		church: env('CCB_CHURCH'),
		client: env('CCB_CLIENT'),
		secret: env('CCB_SECRET'),
		code: env('CCB_CODE'),
		redirectUri: env('CCB_REDIRECT_URI'),
		sandbox: env('CCB_SANDBOX') === 'true',
		grantType: env('CCB_GRANT_TYPE') || undefined,
		dataGetter: () => (existsSync(store) ? JSON.parse(readFileSync(store, 'utf8')) : {}),
		dataSetter: (data) => writeFileSync(store, JSON.stringify(data, null, '\t')),
	});
} catch (e) {
	console.error(`Connect failed: ${e?.msg || e?.message || e}`);
	if (e?.data?.body) console.error('Token endpoint said:', JSON.stringify(e.data.body));
	process.exit(1);
}

if (connection.type === 'redirect') {
	console.log('Authorization is required. Open this URL as a Master Administrator:\n');
	console.log(connection.data);
	console.log('\nThen put the `code` query parameter from the redirect into CCB_CODE in .env and run again.');
	process.exit(3);
}
console.log('✔ connected');

const shape = (value) => {
	if (Array.isArray(value)) return `array of ${value.length}${value.length ? ` — item fields: ${Object.keys(value[0] ?? {}).slice(0, 12).join(', ')}` : ''}`;
	if (value && typeof value === 'object') return `object — fields: ${Object.keys(value).slice(0, 12).join(', ')}`;
	return typeof value;
};

const checks = [
	['api.church.getChurch', () => ccb.api.church.getChurch()],
	['api.session.getMe', () => ccb.api.session.getMe()],
	['api.campuses.getCampuses', () => ccb.api.campuses.getCampuses()],
	['api.church.getMembershipTypes', () => ccb.api.church.getMembershipTypes()],
	['api.individuals.getIndividuals', () => ccb.api.individuals.getIndividuals({ per_page: 25 })],
	['api.groups.getGroups', () => ccb.api.groups.getGroups({ per_page: 25 })],
	['api.events.getEvents', () => ccb.api.events.getEvents({ per_page: 25 })],
	['api.forms.getForms', () => ccb.api.forms.getForms({ per_page: 25 })],
	['api.processQueues.getProcesses', () => ccb.api.processQueues.getProcesses()],
	['church.get (convenience helper)', () => ccb.church.get()],
	['individuals.get (convenience helper)', () => ccb.individuals.get({ per_page: 25 })],
	[
		'request: pagination and rate limit headers',
		async () => {
			const { pagination, rateLimit } = await ccb.request({ path: '/individuals', query: { per_page: 25 } });
			return { pagination, rateLimit };
		},
	],
	[
		'paginate: first 60 groups',
		async () => {
			const items = [];
			for await (const group of ccb.paginate((q) => ccb.api.groups.getGroups(q), { per_page: 25 })) {
				items.push(group);
				if (items.length >= 60) break;
			}
			return items;
		},
	],
];

let failed = 0;
for (const [name, run] of checks) {
	try {
		const result = await run();
		const detail = name.startsWith('request:') ? JSON.stringify(result) : shape(result);
		console.log(`✔ ${name}: ${detail}`);
	} catch (e) {
		const error = e?.data ?? e;
		// A church-level (system) token has no signed-in individual, so /me is refused.
		if (name === 'api.session.getMe' && error?.status === 401) {
			console.log(`– ${name}: skipped (401: this token is not tied to a signed-in individual)`);
			continue;
		}
		failed++;
		console.log(`✖ ${name}: ${error?.status ?? ''} ${error?.message || JSON.stringify(e)}`);
	}
}

console.log(`\n${checks.length - failed} of ${checks.length} checks passed.`);
process.exit(failed ? 1 : 0);
