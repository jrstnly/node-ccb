import { DateTime } from 'luxon';

import { Config } from './interfaces/config.js';
import { AuthData } from './interfaces/auth-data.js';
import { CCBAuthError } from './errors.js';

const HOSTS = {
	production: { authorize: 'https://oauth.ccbchurch.com', api: 'https://api.ccbchurch.com' },
	sandbox: { authorize: 'https://beta-oauth.ccbchurch.com', api: 'https://api-beta.ccbchurch.com' },
};

/** Seconds shaved off a token's lifetime so that an about-to-expire token is never sent. */
const EXPIRY_MARGIN = 60 * 5;

export const ACCEPT = 'application/vnd.ccbchurch.v2+json';

const emptyAuth = (): AuthData => ({ code: null, accessToken: null, refreshToken: null, tokenExpiration: null });

/**
 * Owns the OAuth state: builds the authorization URL, exchanges codes, and refreshes tokens.
 *
 * Refresh tokens are single-use and every refresh revokes the previous access token, so refreshes
 * are single-flighted and the new pair is persisted through `dataSetter` before it is used.
 */
export class Auth {
	public config: Config = {
		church: '',
		client: '',
		secret: '',
		code: '',
		redirectUri: '',
		dataGetter: () => this.data,
		dataSetter: () => {},
	};
	private data: AuthData = emptyAuth();
	private pending: Promise<string> | null = null;

	public configure(config: Config) {
		this.config = { ...this.config, ...config };
	}

	/** Load stored auth data, letting a code passed in the config take precedence. */
	public async load() {
		this.data = { ...emptyAuth(), ...((await this.config.dataGetter()) || {}) };
		if (this.config.code) await this.setCode(this.config.code);
	}

	public get state(): AuthData {
		return { ...this.data };
	}

	public get apiBase(): string {
		return this.hosts.api;
	}

	private get hosts() {
		return this.config.sandbox ? HOSTS.sandbox : HOSTS.production;
	}

	/**
	 * The default grant re-sends the stored code for every token (`client_credentials`), which is what
	 * existing integrations rely on. The documented single-use code plus rotating refresh token flow is
	 * opt-in through `grantType: 'authorization_code'`.
	 */
	private get legacyGrant(): boolean {
		return this.config.grantType !== 'authorization_code';
	}

	/** Whether there is anything to obtain a token with. */
	public get hasCredentials(): boolean {
		return !!(this.data.code || this.data.refreshToken);
	}

	public get hasValidToken(): boolean {
		return !!this.data.accessToken && DateTime.now() < DateTime.fromISO(this.data.tokenExpiration || '1970-01-01');
	}

	public authorizeUrl(): string {
		const params: Record<string, string> = {
			client_id: this.config.client,
			response_type: 'code',
			redirect_uri: this.config.redirectUri || '',
			subdomain: this.config.church,
		};
		const scope = Array.isArray(this.config.scope) ? this.config.scope.join(' ') : this.config.scope;
		if (scope) params.scope = scope;
		if (this.config.state) params.state = this.config.state;
		if (this.config.identityAuth) params.resource_owner_auth = 'true';
		return `${this.hosts.authorize}/oauth/authorize?${new URLSearchParams(params).toString()}`;
	}

	/** Store a fresh authorization code. Any existing tokens are dropped so that the code is used. */
	public async setCode(code: string) {
		if (code === this.data.code) return;
		await this.update({ code, accessToken: null, refreshToken: null, tokenExpiration: null });
	}

	/** Return a usable access token, fetching or refreshing one if needed. */
	public async token(): Promise<string> {
		if (this.hasValidToken) return this.data.accessToken as string;
		return this.refresh();
	}

	/** Force a new access token. Concurrent callers share a single request. */
	public refresh(): Promise<string> {
		if (!this.pending) {
			this.pending = this.fetchToken().finally(() => {
				this.pending = null;
			});
		}
		return this.pending;
	}

	private async fetchToken(): Promise<string> {
		const base = {
			subdomain: this.config.church,
			client_id: this.config.client,
			client_secret: this.config.secret,
		};
		let send: Record<string, string>;
		let used: 'code' | 'refreshToken';

		if (this.legacyGrant) {
			if (!this.data.code) throw new CCBAuthError('No authorization code available.');
			send = { grant_type: 'client_credentials', ...base, code: this.data.code };
			used = 'code';
		} else if (this.data.refreshToken) {
			send = { grant_type: 'refresh_token', ...base, refresh_token: this.data.refreshToken };
			used = 'refreshToken';
		} else if (this.data.code) {
			send = { grant_type: 'authorization_code', ...base, code: this.data.code };
			if (this.config.redirectUri) send.redirect_uri = this.config.redirectUri;
			used = 'code';
		} else {
			throw new CCBAuthError('No authorization code or refresh token available. Authorization is required.');
		}

		const got: any = (await import('got')).default;
		let response: any;
		try {
			response = await got.post(`${this.hosts.api}/oauth/token`, {
				json: send,
				headers: { accept: ACCEPT },
				responseType: 'text',
				throwHttpErrors: false,
				timeout: { request: this.config.timeout || 60000 },
			});
		} catch (e: any) {
			throw new CCBAuthError(`Token request failed: ${e?.message || e}`, { cause: e });
		}

		let body: any = null;
		try {
			body = JSON.parse(response.body);
		} catch {
			body = response.body;
		}

		if (response.statusCode < 200 || response.statusCode >= 300 || !body || !body.access_token) {
			const code = body && typeof body === 'object' ? body.error : undefined;
			const description = (body && typeof body === 'object' && (body.error_description || body.error)) || `HTTP ${response.statusCode}`;
			// The code or refresh token is spent or revoked; drop it so that we do not keep retrying it.
			if (code === 'invalid_grant' && !this.legacyGrant) {
				await this.update({ [used]: null, accessToken: null, tokenExpiration: null });
			}
			throw new CCBAuthError(`Unable to obtain access token: ${description}`, { code, status: response.statusCode, body });
		}

		const parsed = parseInt(body.expires_in, 10);
		const expiresIn = isNaN(parsed) || parsed <= 0 ? 7200 : parsed;
		const lifetime = Math.max(expiresIn - EXPIRY_MARGIN, Math.floor(expiresIn / 2));

		const next: AuthData = {
			accessToken: body.access_token,
			tokenExpiration: DateTime.now().plus({ seconds: lifetime }).toISO(),
		};
		if (body.refresh_token) {
			next.refreshToken = body.refresh_token;
			// Authorization codes are single-use; once we hold a refresh token the code is dead weight.
			if (!this.legacyGrant) next.code = null;
		}
		await this.update(next);
		return body.access_token;
	}

	private async update(obj: AuthData) {
		this.data = { ...this.data, ...obj };
		await this.config.dataSetter({ ...this.data });
	}
}
