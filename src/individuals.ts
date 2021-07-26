import { BehaviorSubject, Observable } from 'rxjs';

import { getJSON, postJSON } from './common.js';
import { Config } from './interfaces/config.js';
import { AuthData } from './interfaces/auth-data.js';

export class Individuals {
	private tokenRefresh: () => Promise<void>;
	private config: Config;
	private auth: BehaviorSubject<AuthData> = new BehaviorSubject<AuthData>({
		code: null,
		accessToken: null,
		refreshToken: null,
		tokenExpiration: null,
	});
	constructor(config: Config, auth: BehaviorSubject<AuthData>, refresh:() => Promise<void>) {
		this.tokenRefresh = refresh;
		this.config = config;
		this.auth = auth;
	}

	public async get(id: string | number) {
		await this.tokenRefresh();
		const data: any = await getJSON(`/individuals/${id}`, this.config, this.auth);
		console.log(data);
	}
}
