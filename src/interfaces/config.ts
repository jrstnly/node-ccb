import { AuthData } from './auth-data.js';

export interface Config {
	/** Church subdomain (the `mychurch` in `mychurch.ccbchurch.com`). */
	church: string;
	/** OAuth client id. */
	client: string;
	/** OAuth client secret. */
	secret: string;
	/** Authorization code returned to your redirect URI. Single-use; exchanged for tokens on connect. */
	code?: string;
	/** Redirect URI registered for the OAuth application. Must match exactly in both OAuth steps. */
	redirectUri?: string;
	/** Scopes to request during authorization. Defaults to every scope granted to the application. */
	scope?: string | string[];
	/** Opaque value echoed back to the redirect URI, used for CSRF protection. */
	state?: string;
	/** Use Identity Auth (`resource_owner_auth=true`) so that calls act as the signed-in individual. */
	identityAuth?: boolean;
	/** Use the sandbox servers instead of production. Sandbox credentials only work against sandbox. */
	sandbox?: boolean;
	/**
	 * OAuth grant used to obtain tokens. `authorization_code` (default) is the documented flow with
	 * rotating refresh tokens. `client_credentials` keeps the behaviour of versions before 0.13, where
	 * the stored code is re-sent every time a token is needed.
	 */
	grantType?: 'authorization_code' | 'client_credentials';
	/** How many times a rate-limited (429) request is retried. Defaults to 3. */
	maxRetries?: number;
	/** Per-request timeout in milliseconds. Defaults to 60000. */
	timeout?: number;
	tmpFilePath?: string;
	dataGetter: () => Promise<AuthData> | AuthData;
	dataSetter: (data: AuthData) => Promise<void> | void;
}
