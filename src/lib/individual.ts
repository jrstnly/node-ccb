import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate } from '../common.js';
import { defaultNote, defaultQueue } from '../defaults.js';
import { Data } from '../data.js';

export class Individual {
	private data: Data;
	private id: string | number;

	constructor(id: string | number, data: Data) {
		this.data = data;
		this.id = (typeof id === "string") ? parseInt(id) : id;
	}

	public async get() {
		const response: any = await this.data.get(`/individuals/${this.id}`, null);
		return response.data.response;
	}
	public updatePhoto(photo: string | Readable) {
		return new Promise(async (resolve, reject) => {
			const response: any = await this.data.upload(`/individuals/${this.id}/photo`, photo);
			if (response.type === "success") resolve(response.data.response);
			else reject(response);
		});
	}
	public addNote(note: string, options: any = {}) {
		return new Promise(async (resolve, reject) => {
			try {
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

				const response: any = await this.data.post(`/individuals/${this.id}/notes`, null, options);
				resolve(response.data.response);

			} catch (e) {
				reject(e);
			}
		});
	}

	public addToQueue(queue: string | number, options: any = {}) {
		return new Promise(async (resolve, reject) => {
			try {
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

				const response: any = await this.data.post(`/queues/${queue}/individuals`, null, options);
				resolve(response.data.response);
			} catch (e) {
				reject(e);
			}
		});
	}

}
