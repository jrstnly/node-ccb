import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate } from '../common';
import { defaultIndividual } from '../defaults';
import { Data } from '../data';

export class Forms {
	private data: Data;
	constructor(data: Data) {
		this.data = data;
	}

	public async get(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/forms`, params);
		return response.data.response;
	}

}
