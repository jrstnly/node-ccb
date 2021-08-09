import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate } from '../common.js';
import { defaultIndividual } from '../defaults.js';
import { Data } from '../data.js';

export class Events {
	private data: Data;
	constructor(data: Data) {
		this.data = data;
	}

	public async get(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/events`, params);
		return response.data.response;
	}

}
