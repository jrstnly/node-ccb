import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { getJSON, postJSON, uploadPhoto } from '../common.js';
import { Config } from '../interfaces/config.js';
import { AuthData } from '../interfaces/auth-data.js';

export class Individual {
	private tokenRefresh: () => Promise<void>;
	private config: Config;
	private auth: BehaviorSubject<AuthData> = new BehaviorSubject<AuthData>({ code: null, accessToken: null, refreshToken: null, tokenExpiration: null });
	private id: string | number;

	constructor(id: string | number, config: Config, auth: BehaviorSubject<AuthData>, refresh:() => Promise<void>) {
		this.id = id;
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

}
