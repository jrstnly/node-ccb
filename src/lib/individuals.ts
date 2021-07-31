import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate, getJSON, postJSON, putJSON, uploadPhoto } from '../common.js';
import { defaultIndividual } from '../defaults.js';
import { Config } from '../interfaces/config.js';
import { AuthData } from '../interfaces/auth-data.js';

export class Individuals {
	private tokenRefresh: () => Promise<void>;
	private config: Config;
	private auth: BehaviorSubject<AuthData> = new BehaviorSubject<AuthData>({ code: null, accessToken: null, refreshToken: null, tokenExpiration: null });
	constructor(config: Config, auth: BehaviorSubject<AuthData>, refresh:() => Promise<void>) {
		this.tokenRefresh = refresh;
		this.config = config;
		this.auth = auth;
	}

	public async get(params:Record<string, string> | null = null): Promise<any> {
		await this.tokenRefresh();
		const response: any = await getJSON(`/individual`, params, this.config, this.auth);
		return response.data;
	}

	public async add(individual: any): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				await this.tokenRefresh();

				individual = { ...defaultIndividual, ...individual };
				individual.phone = { ...defaultIndividual.phone, ...individual.phone };
				individual.addresses = { ...defaultIndividual.addresses, ...individual.addresses };

				const schema: any = {
					first_name: (value: string) => value !== "",
					last_name: (value: string) => value !== ""
				};
				const validationErrors = validate(individual, schema);
				if (validationErrors.length > 0) {
					for (const { message } of validationErrors) {
						console.log(message);
					}
					reject({ type: 'error', msg: 'Missing required parameters.' });
				}

				const family = { members: [individual], last_name: individual.last_name, campus_id: individual.campus_id };

				const response: any = await postJSON(`/families`, null, family, this.config, this.auth);
				resolve(response.data);
			} catch (e) {
				reject(e);
			}
		});
	}

}
