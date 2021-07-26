import { DateTime } from 'luxon';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { skip } from 'rxjs/operators';

import { validate, getJSON, postJSON } from './common.js';
import { Config } from './interfaces/config.js';
import { AuthData } from './interfaces/auth-data.js';
import { Response } from './interfaces/response.js';

import { Individuals } from './individuals.js';

export class CCB {
	private auth: BehaviorSubject<AuthData> = new BehaviorSubject<AuthData>({
		code: null,
		accessToken: null,
		refreshToken: null,
		tokenExpiration: null,
	});
	private config: Config = {
		church: '',
		client: '',
		secret: '',
		code: '',
		redirectUri: '',
		dataGetter: () => { return this.auth.getValue() },
		dataSetter: () => { },
	}

	constructor() {
		this.auth.pipe(skip(1)).subscribe((data) => {
			this.config.dataSetter(data);
			console.log(data);
		})
	}

	public connect(config: Config): Promise<Response> {
		return new Promise(async (resolve, reject) => {
			// Validate and set config parameters
			const schema: any = {
				church: (value: string) => value !== '',
				client: (value: string) => value !== '',
				secret: (value: string) => value !== ''
			};
			this.config = { ...this.config, ...config };
			const configErrors = validate(this.config, schema);
			if (configErrors.length > 0) {
				for (const { message } of configErrors) {
					console.log(message);
				}
				reject({ type: 'error', msg: 'Missing required parameters.' });
			}

			// Get auth settings from storage and set code if defined in config parameters
			const auth = await this.config.dataGetter();
			if (this.config.code !== '') auth.code = this.config.code;
			this.auth.next(auth);

			// Check to see if we have either a redirect URI to complete step 1 of OAuth flow or code to complete step 2
			if (!this.auth.getValue().code && this.config.redirectUri === '') {
				reject({ type: 'error', msg: 'No client code or redirect URI defined. One of these two parameters are required to complete authentication.' });
			} else if (!this.auth.getValue().code && this.config.redirectUri !== '') {
				const redirect = await this.buildAuthRedirectUri();
				resolve({ type: 'redirect', msg: 'Redirect to get client code.', data: redirect.data });
			}

			// Check to see if we have a token and confirm it's not expired. If not, get a new one.
			if (!this.auth.getValue().accessToken || DateTime.now() >= DateTime.fromISO(this.auth.getValue().tokenExpiration || '1970-01-01')) {
				await this.getTokenFromAuthCode();
				resolve({ type: 'success' });
			} else {
				resolve({ type: 'success' });
			}

			reject({ type: 'error', msg: 'An unknown error occurred.' });
		})
	}

	public async tokenRefresh(): Promise<void> {
		if (DateTime.now() >= DateTime.fromISO(this.auth.getValue().tokenExpiration || '1970-01-01')) {
			await this.getTokenFromAuthCode();
		}
	}
	public updateAuthorizationCode(code: string): Response {
		if (code !== '') {
			this.updateAuthDataItem({code: code});
			return {type: 'success'};
		} else {
			return {type: 'error', msg: 'Please specify a valid code.'};
		}
	}

	public get individuals() {
		return new Individuals(this.config, this.auth, this.tokenRefresh);
	}

	private async getTokenFromAuthCode() {
		const data = await postJSON('https://api.ccbchurch.com/oauth/token', {
			grant_type: 'client_credentials',
			subdomain: this.config.church,
			client_id: this.config.client,
			client_secret: this.config.secret,
			code: this.auth.getValue().code,
		}, this.config, this.auth);
		const expires = data.expires_in - (60 * 5); // Take 5 minutes off expiration time so that we never try to use an expired token
		const now = DateTime.now();
		const expiration = now.plus({ seconds: expires }).toISO();

		const auth: AuthData = {
			accessToken: data.access_token,
			tokenExpiration: expiration
		}
		this.updateAuthDataItem(auth);
	}
	private updateAuthDataItem(obj: AuthData | Record<string, string>): void {
		const auth = { ...this.auth.getValue(), ...obj };
		this.auth.next(auth);
	}
	private buildAuthRedirectUri(): Promise<Response> {
		return new Promise((resolve, reject) => {
			const params: Record<string, string> = {
				client_id: this.config.client,
				response_type: 'code',
				redirect_uri: this.config.redirectUri || '',
				subdomain: this.config.church,
			};
			const query = new URLSearchParams(params).toString();
			resolve({ type: 'success', data: `https://oauth.ccbchurch.com/oauth/authorize?${query}` });
		})
	}
}
