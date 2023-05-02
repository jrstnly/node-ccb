import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate } from '../common.js';
import { Data } from '../data.js';

export class Group {
	private data: Data;
	private id: string | number;

	constructor(id: string | number, data: Data) {
		this.data = data;
		this.id = (typeof id === "string") ? parseInt(id) : id;
	}

	public async get() {
		const response: any = await this.data.get(`/groups/${this.id}`, null);
		return response.data.response;
	}

	public async participants(params:Record<string, string> | null = null) {
		const response: any = await this.data.get(`/groups/${this.id}/members`, params);
		return response.data.response;
	}

}
