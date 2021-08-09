import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate } from '../common.js';
import { defaultIndividual } from '../defaults.js';
import { Data } from '../data.js';

export class Family {
	private data: Data;
	private id: string | number;

	constructor(id: string | number, data: Data) {
		this.data = data;
		this.id = (typeof id === "string") ? parseInt(id) : id;
	}

	public async get() {
		const response: any = await this.data.get(`/families/${this.id}`, null);
		return response.data.response;
	}
	public async updatePhoto(photo: string | Readable) {
		const response: any = await this.data.upload(`/families/${this.id}/photo`, photo);
		return response.data.response;
	}
	public async addMember(individual: any): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
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

				const response: any = await this.data.post(`/individuals`, null, individual);
				resolve(response.data);
			} catch (e) {
				reject(e);
			}
		});
	}

}
