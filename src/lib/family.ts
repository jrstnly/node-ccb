import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate, getJSON, postJSON, uploadPhoto } from '../common.js';
import { defaultIndividual } from '../defaults.js';
import { Config } from '../interfaces/config.js';
import { AuthData } from '../interfaces/auth-data.js';

export class Family {
	private tokenRefresh: () => Promise<void>;
	private config: Config;
	private auth: BehaviorSubject<AuthData> = new BehaviorSubject<AuthData>({ code: null, accessToken: null, refreshToken: null, tokenExpiration: null });
	private id: string | number;

	constructor(id: string | number, config: Config, auth: BehaviorSubject<AuthData>, refresh:() => Promise<void>) {
		this.id = (typeof id === "string") ? parseInt(id) : id;
		this.tokenRefresh = refresh;
		this.config = config;
		this.auth = auth;
	}

	public async get() {
		await this.tokenRefresh();
		const response: any = await getJSON(`/families/${this.id}`, null, this.config, this.auth);
		return response.data;
	}
	public async updatePhoto(photo: string | Readable) {
		await this.tokenRefresh();
		const data: any = await uploadPhoto(`/families/${this.id}/photo`, photo, this.config, this.auth);
		return data;
	}
	public async addMember(individual: any): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				await this.tokenRefresh();

				const schema: any = {
					first_name: (value: string) => value !== "",
					last_name: (value: string) => value !== ""
				};

				const familyData: any = {...defaultIndividual};
				familyData.family_id = this.id;
				if (individual.family_position && individual.family_position !== "OTHER") {
					const family = await this.get();
					familyData.phone.home = family.members[0].phone.home;
					familyData.addresses.mailing = family.address;
				}

				individual = { ...familyData, ...individual };
				individual.phone = { ...familyData.phone, ...individual.phone };
				individual.addresses = { ...familyData.addresses, ...individual.addresses };

				const validationErrors = validate(individual, schema);
				if (validationErrors.length > 0) {
					for (const { message } of validationErrors) {
						console.log(message);
					}
					reject({ type: 'error', msg: 'Missing required parameters.' });
				}

				const response: any = await postJSON(`/individuals`, null, individual, this.config, this.auth);
				resolve(response.data);
			} catch (e) {
				reject(e);
			}
		});
	}

}
