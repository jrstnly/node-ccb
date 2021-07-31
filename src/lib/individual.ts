import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate, getJSON, postJSON, uploadPhoto } from '../common.js';
import { defaultNote, defaultQueue } from '../defaults.js';
import { Config } from '../interfaces/config.js';
import { AuthData } from '../interfaces/auth-data.js';

export class Individual {
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
		const response: any = await getJSON(`/individuals/${this.id}`, null, this.config, this.auth);
		return response.data;
	}
	public async updatePhoto(photo: string | Readable) {
		await this.tokenRefresh();
		const data: any = await uploadPhoto(`/individuals/${this.id}/photo`, photo, this.config, this.auth);
		return data;
	}
	public addNote(note: string, options: any = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				await this.tokenRefresh();
				if (typeof note !== "string") reject({ type: 'error', msg: 'First parameter must be a string.' });
				if (note === "") reject({ type: 'error', msg: 'Note text is required.' });

				const schema: any = {
					context: (value: string) => (value === 'GENERAL' || value === 'GROUP' || value === 'DEPARTMENT' || value === 'PROCESS_QUEUE'),
					context_id: (value: string | number, object: any) => {
						if (object.context === 'GENERAL') {
							return true;
						} else {
							return (value !== "");
						}
					},
					sharing_level: (value: string) => (value === 'PRIVATE' || value === 'CONTEXT_LEADERS' || value === 'ALL_LEADERS'),
				};

				options = { ...defaultNote, ...options };
				options.note = note;

				const validationErrors = validate(options, schema);
				if (validationErrors.length > 0) {
					for (const { message } of validationErrors) {
						console.log(message);
					}
					reject({ type: 'error', msg: 'Required parameters either missing or invalid.' });
				}

				const response: any = await postJSON(`/individuals/${this.id}/notes`, null, options, this.config, this.auth);
				resolve(response.data);

			} catch (e) {
				reject(e);
			}
		});
	}

	public addToQueue(queue: string | number, options: any = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				await this.tokenRefresh();

				const schema: any = {
					status: (value: string) => (value === 'NOT_STARTED' || value === 'WAITING' || value === 'IN_PROCESS'),
				};

				options = { ...defaultQueue, ...options };
				options.individual_id = this.id


				const validationErrors = validate(options, schema);
				if (validationErrors.length > 0) {
					for (const { message } of validationErrors) {
						console.log(message);
					}
					reject({ type: 'error', msg: 'Required parameters either missing or invalid.' });
				}

				const response: any = await postJSON(`/queues/${queue}/individuals`, null, options, this.config, this.auth);
				resolve(response.data);
			} catch (e) {
				reject(e);
			}
		});
	}

}
