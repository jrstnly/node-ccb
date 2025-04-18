import { DateTime } from 'luxon';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { skip } from 'rxjs/operators';

import { validate } from './common.js';
import { Data } from './data.js';
import { Config } from './interfaces/config.js';
import { AuthData } from './interfaces/auth-data.js';
import { Response } from './interfaces/response.js';

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
	private data: Data;
	private auth: BehaviorSubject<AuthData> = new BehaviorSubject<AuthData>({
		code: null,
		accessToken: null,
		refreshToken: null,
		tokenExpiration: null,
	});
	private config: BehaviorSubject<Config> = new BehaviorSubject<Config>({
		church: '',
		client: '',
		secret: '',
		code: '',
		redirectUri: '',
		dataGetter: () => { return this.auth.getValue() },
		dataSetter: () => { },
	});

	constructor() {
		this.data = new Data(this.config, this.auth, this.getTokenFromAuthCode, this.updateAuthDataItem);
		this.auth.pipe(skip(1)).subscribe((data) => {
			this.config.getValue().dataSetter(data);
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
			this.config.next({ ...this.config.getValue(), ...config });
			const configErrors = validate(this.config.getValue(), schema);
			if (configErrors.length > 0) {
				for (const { message } of configErrors) {
					console.log(message);
				}
				reject({ type: 'error', msg: 'Missing required parameters.' });
			}

			// Get auth settings from storage and set code if defined in config parameters
			const auth = await this.config.getValue().dataGetter();
			if (this.config.getValue().code !== '') auth.code = this.config.getValue().code;
			this.auth.next(auth);

			// Check to see if we have either a redirect URI to complete step 1 of OAuth flow or code to complete step 2
			if (!this.auth.getValue().code && this.config.getValue().redirectUri === '') {
				reject({ type: 'error', msg: 'No client code or redirect URI defined. One of these two parameters are required to complete authentication.' });
			} else if (!this.auth.getValue().code && this.config.getValue().redirectUri !== '') {
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

	public updateAuthorizationCode(code: string): Response {
		if (code !== '') {
			this.updateAuthDataItem({code: code});
			return {type: 'success'};
		} else {
			return {type: 'error', msg: 'Please specify a valid code.'};
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

	private async getTokenFromAuthCode() {
		try {
			const gotModule = await import("got");
			const got = gotModule.default;
			let body: any, headers: any;
			const send = {
				grant_type: 'client_credentials',
				subdomain: this.config.getValue().church,
				client_id: this.config.getValue().client,
				client_secret: this.config.getValue().secret,
				code: this.auth.getValue().code,
			};
			({ body, headers } = await got.post('https://api.ccbchurch.com/oauth/token', {
				body: JSON.stringify(send),
				headers: {
					'Accept': 'application/vnd.ccbchurch.v2+json',
					'Content-Type': 'application/json'
				}
			}));

			const data = JSON.parse(body);
			
			// Ensure expires_in is a valid number
			const expiresIn = data.expires_in ? parseInt(data.expires_in, 10) : 3600; // Default to 1 hour if not provided
			const expires = expiresIn - (60 * 5); // Take 5 minutes off expiration time so that we never try to use an expired token
			
			// Ensure expires is a valid number
			if (isNaN(expires) || expires <= 0) {
				throw new Error(`Invalid expiration time: ${body.expires_in}`);
			}
			
			const now = DateTime.now();
			const expiration = now.plus({ seconds: expires }).toISO();

			const auth: AuthData = {
				accessToken: data.access_token,
				tokenExpiration: expiration
			}
			this.updateAuthDataItem(auth);
		} catch (e) {
			console.log(e);
		}
	}
	private updateAuthDataItem(obj: AuthData | Record<string, string>): void {
		const auth = { ...this.auth.getValue(), ...obj };
		this.auth.next(auth);
	}
	private buildAuthRedirectUri(): Promise<Response> {
		return new Promise((resolve, reject) => {
			const params: Record<string, string> = {
				client_id: this.config.getValue().client,
				response_type: 'code',
				redirect_uri: this.config.getValue().redirectUri || '',
				subdomain: this.config.getValue().church,
			};
			const query = new URLSearchParams(params).toString();
			resolve({ type: 'success', data: `https://oauth.ccbchurch.com/oauth/authorize?${query}` });
		})
	}
}
