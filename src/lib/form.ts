import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate } from '../common.js';
import { Data } from '../data.js';

export class Form {
	private data: Data;
	private id: string | number;

	constructor(id: string | number, data: Data) {
		this.data = data;
		this.id = (typeof id === "string") ? parseInt(id) : id;
	}

	public async get() {
		const response: any = await this.data.get(`/forms/${this.id}`, null);
		return response.data.response;
	}

	public async questions(params:Record<string, string> | null = null) {
		const response: any = await this.data.get(`/forms/${this.id}/questions`, params);
		return response.data.response;
	}

	public async responses(params:Record<string, string> | null = null) {
		const response: any = await this.data.get(`/forms/${this.id}/responses`, params);
		return response.data.response;
	}

}
