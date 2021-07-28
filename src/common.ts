import got from 'got';
import { BehaviorSubject } from 'rxjs';

import { Response } from './interfaces/response.js';
import { RequestOptions } from './interfaces/request-options';
import { Config } from './interfaces/config.js';
import { AuthData } from './interfaces/auth-data.js';


export function validate(object: any, schema: any) {
	return Object.keys(schema).filter(key => !schema[key](object[key])).map(key =>
		new Error(`Required parameter "${key}" is empty.`)
	);
}

// helper for getting from ccb api
export function getJSON(path: string, config: Config, auth: BehaviorSubject<AuthData>): Promise<Response> {
	return new Promise(async (resolve, reject) => {
		try {
			const base = `https://api.ccbchurch.com`;
			const url = (/(http(s?)):\/\//i.test(path)) ? path : base+path
			const token = auth.getValue().accessToken || '';
			const data = await got(url, {
				headers: {
					'accept': 'application/vnd.ccbchurch.v2+json',
					'authorization': `Bearer ${token}`
				}
			}).json();
			resolve({type: 'success', data: data});
		} catch(e) {
			reject({type: 'error', data: e});
		}
	});
}
// helper for posting to ccb api
export function postJSON(path: string, body: any, config: Config, auth: BehaviorSubject<AuthData>): Promise<Response> {
	return new Promise(async (resolve, reject) => {
		try {
			const base = `https://${config.church}.ccbchurch.com/api`;
			const url = (/(http(s?)):\/\//i.test(path)) ? path : base+path
			const token = auth.getValue().accessToken || '';
			const data = await got.post(url, {
				headers: {
					'accept': 'application/vnd.ccbchurch.v2+json',
					'authorization': `Bearer ${token}`
				},
				json: body,
			}).json();
			resolve({type: 'success', data: data});
		} catch(e) {
			reject({type: 'error', data: e});
		}
	});
}
