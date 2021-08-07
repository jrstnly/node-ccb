import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate } from '../common.js';
import { defaultIndividual } from '../defaults.js';
import { Data } from '../data.js';
import { Config } from '../interfaces/config.js';
import { AuthData } from '../interfaces/auth-data.js';

export class Individuals {
	private data: Data;

	constructor(data: Data) {
		this.data = data;
	}

	public async get(params:Record<string, string> | null = null): Promise<any> {
		const response: any = await this.data.get(`/individuals`, params);
		return response.data.response;
	}

	public async add(individual: any): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
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

				const response: any = await this.data.post(`/families`, null, family);
				resolve(response.data.response);
			} catch (e) {
				reject(e);
			}
		});
	}

}
