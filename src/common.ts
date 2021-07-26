import fetch from 'node-fetch';
import { BehaviorSubject } from 'rxjs';

import { RequestOptions } from './interfaces/request-options';
import { Config } from './interfaces/config.js';
import { AuthData } from './interfaces/auth-data.js';


export function validate(object: any, schema: any) {
	return Object.keys(schema).filter(key => !schema[key](object[key])).map(key =>
		new Error(`Required parameter "${key}" is empty.`)
	);
}

// helper for getting from ccb api
export function getJSON(path: string, config: Config, auth: BehaviorSubject<AuthData>) {
	const base = `https://${config.church}.ccbchurch.com/api`;
	const url = (/(http(s?)):\/\//i.test(path)) ? path : base+path
	const token = auth.getValue().accessToken || '';
	return makeCall(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/vnd.ccbchurch.v2+json',
			'Authorization': `Bearer ${token}`
		},
	})
}
// helper for posting to ccb api
export function postJSON(path: string, data: any, config: Config, auth: BehaviorSubject<AuthData>) {
	const base = `https://${config.church}.ccbchurch.com/api`;
	const url = (/(http(s?)):\/\//i.test(path)) ? path : base+path
	const token = auth.getValue().accessToken || '';
	return makeCall(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/vnd.ccbchurch.v2+json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data),
	})
}


// helper for api calls
async function makeCall(url: string, args: RequestOptions) {
	//console.log('API CALL', url, { ...args, body: args.body ? JSON.parse(args.body) : undefined });
	const response = await fetch(url, args);

	const data = await response.json()

	if (!response.ok) {
		//console.log('API RESPONSE ERROR', url, data);
		throw data;
	}

	///console.log('API RESPONSE OK', url, data);

	return data;
}
