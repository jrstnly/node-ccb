import { validate } from './common.js';
import { Auth } from './auth.js';
import { Data } from './data.js';
import { CCBAuthError } from './errors.js';
import { Config } from './interfaces/config.js';
import { Response } from './interfaces/response.js';
import { ApiResponse, RequestConfig } from './interfaces/request.js';

import { Api } from './generated/index.js';

import { Church } from './lib/church.js';

import { Individual } from './lib/individual.js';
import { Individuals } from './lib/individuals.js';
import { Family } from './lib/family.js';

import { Groups } from './lib/groups.js';
import { Group } from './lib/group.js';
import { Events } from './lib/events.js';
import { Forms } from './lib/forms.js';
import { Form } from './lib/form.js';

import { Search } from './lib/search.js';

export class CCB {
	private auth: Auth;
	private data: Data;
	private _api: Api | null = null;

	constructor() {
		this.auth = new Auth();
		this.data = new Data(this.auth);
	}

	/**
	 * Connect to the API. Resolves with `{type:'success'}` once a valid access token is held, or
	 * `{type:'redirect', data: url}` when the church still has to authorize the application.
	 */
	public async connect(config: Config): Promise<Response> {
		this.auth.configure(config);

		const schema: any = {
			church: (value: string) => value !== '',
			client: (value: string) => value !== '',
			secret: (value: string) => value !== '',
		};
		const configErrors = validate(this.auth.config, schema);
		if (configErrors.length > 0) {
			throw { type: 'error', msg: `Missing required parameters. ${configErrors.map((e) => e.message).join(' ')}` };
		}

		await this.auth.load();

		if (this.auth.hasValidToken) return { type: 'success' };

		const redirect = (): Response => ({ type: 'redirect', msg: 'Redirect to get client code.', data: this.auth.authorizeUrl() });

		if (!this.auth.hasCredentials) {
			if (!this.auth.config.redirectUri) {
				throw { type: 'error', msg: 'No client code or redirect URI defined. One of these two parameters are required to complete authentication.' };
			}
			return redirect();
		}

		try {
			await this.auth.token();
			return { type: 'success' };
		} catch (e: any) {
			// A spent or revoked code/refresh token means the church has to authorize again.
			if (e instanceof CCBAuthError && e.code === 'invalid_grant' && this.auth.config.redirectUri) return redirect();
			throw { type: 'error', msg: e?.message || 'An unknown error occurred.', data: e };
		}
	}

	/**
	 * Store the authorization code received on the redirect URI. It is exchanged for tokens on the
	 * next API call (or the next call to `connect`).
	 */
	public updateAuthorizationCode(code: string): Response {
		if (code !== '') {
			this.auth.setCode(code).catch((e) => console.log(e));
			return { type: 'success' };
		} else {
			return { type: 'error', msg: 'Please specify a valid code.' };
		}
	}

	/** URL to send a church administrator to in order to authorize the application. */
	public get authorizationUrl(): string {
		return this.auth.authorizeUrl();
	}

	/**
	 * Every endpoint of the ChMS v2 API, grouped as in the API reference and named after the
	 * operation ids in the OpenAPI specification, e.g. `ccb.api.individuals.getIndividual(1)`.
	 */
	public get api(): Api {
		if (!this._api) this._api = new Api(this.data);
		return this._api;
	}

	/**
	 * Low-level authenticated request. Returns the parsed body together with the pagination and
	 * rate limit details from the response headers.
	 */
	public request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
		return this.data.request<T>(config);
	}

	/**
	 * Iterate over every item of a paginated list endpoint, fetching pages as needed.
	 *
	 * ```typescript
	 * for await (const group of ccb.paginate((query) => ccb.api.groups.getGroups(query), { per_page: 100 })) { ... }
	 * ```
	 */
	public async *paginate<T, Q extends { page?: number; per_page?: number } = { page?: number; per_page?: number }>(
		fetch: (query: Q) => Promise<T[]>,
		query?: Q,
	): AsyncGenerator<T, void, undefined> {
		const perPage = query?.per_page ?? 25;
		let page = query?.page ?? 1;
		while (true) {
			const items = await fetch({ ...(query as Q), page, per_page: perPage });
			if (!Array.isArray(items) || items.length === 0) return;
			yield* items;
			if (items.length < perPage) return;
			page++;
		}
	}

	public get church() {
		return new Church(this.data);
	}

	public individual(id: string | number) {
		return new Individual(id, this.data);
	}
	public get individuals() {
		return new Individuals(this.data);
	}
	public family(id: string | number) {
		return new Family(id, this.data);
	}
	public get groups() {
		return new Groups(this.data);
	}
	public group(id: string | number) {
		return new Group(id, this.data);
	}
	public get events() {
		return new Events(this.data);
	}

	public get forms() {
		return new Forms(this.data);
	}
	public form(id: string | number) {
		return new Form(id, this.data);
	}

	public search(type: string, config: any = {}) {
		return new Search(type, config, this.data);
	}
}
