import { Response } from './interfaces/response.js';
import { RequestOptions } from './interfaces/request-options.js';
import { Config } from './interfaces/config.js';
import { AuthData } from './interfaces/auth-data.js';

import { DateTime } from 'luxon';
import { Readable } from 'stream';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { skip } from 'rxjs/operators';
import { existsSync, mkdirSync, unlinkSync, rename, createReadStream, createWriteStream } from 'fs';

import FormData from 'form-data';

let got: any = null;
let Options: any = null;
let RequestError: any = null;
let uuid: any = null;

export class Data {
	private tokenRefresh: () => Promise<void>;
	private updateAuthDataItem: (obj: AuthData | Record<string, string>) => void;
	private config: BehaviorSubject<Config>;
	private auth: BehaviorSubject<AuthData> = new BehaviorSubject<AuthData>({
		code: null,
		accessToken: null,
		refreshToken: null,
		tokenExpiration: null,
	});
	private _client: any = null;

	constructor(
		config: BehaviorSubject<Config>,
		auth: BehaviorSubject<AuthData>,
		refresh: () => Promise<void>,
		update: (obj: AuthData | Record<string, string>) => void
	) {
		this.tokenRefresh = refresh;
		this.updateAuthDataItem = update;
		this.config = config;
		this.auth = auth;
		this.initUuid();
	}

	private async initUuid() {
		const uuidModule = await import('uuid');
		uuid = uuidModule;
	}

	public get(path: string, params: Record<string, string | number> | null): Promise<Response> {
		return new Promise(async (resolve, reject) => {
			const client = await this.getClient();
			let body: any, headers: any;
			try {
				const url = this.getURL(path, params);
				({ body, headers } = await client.get(url));
				resolve({
					type: 'success',
					data: { headers: headers, response: body },
				});
			} catch (e) {
				reject({ type: 'error', data: e });
			}
		});
	}

	public post(path: string, params: Record<string, string | number> | null, json: any): Promise<Response> {
		return new Promise(async (resolve, reject) => {
			const client = await this.getClient();
			let body: any, headers: any;
			try {
				const url = this.getURL(path, params);
				({ body, headers } = await client.post(url, { json: json }));
				resolve({
					type: 'success',
					data: { headers: headers, response: body },
				});
			} catch (e) {
				reject({ type: 'error', data: e });
			}
		});
	}

	public put(path: string, params: Record<string, string | number> | null, json: any): Promise<Response> {
		return new Promise(async (resolve, reject) => {
			const client = await this.getClient();
			let body: any, headers: any;
			try {
				const url = this.getURL(path, params);
				({ body, headers } = await client.put(url, { json: json }));
				resolve({
					type: 'success',
					data: { headers: headers, response: body },
				});
			} catch (e) {
				reject({ type: 'error', data: e });
			}
		});
	}

	public delete(path: string, params: Record<string, string | number> | null, json: any): Promise<Response> {
		return new Promise(async (resolve, reject) => {
			const client = await this.getClient();
			let body: any, headers: any;
			try {
				const url = this.getURL(path, params);
				({ body, headers } = await client.delete(url, { json: json }));
				resolve({
					type: 'success',
					data: { headers: headers, response: body },
				});
			} catch (e) {
				reject({ type: 'error', data: e });
			}
		});
	}

	public upload(path: string, image: string | Readable): Promise<Response> {
		return new Promise(async (resolve, reject) => {
			try {
				const client = await this.getClient();
				const url = this.getURL(path, null);
				const form = new FormData();

				if (image instanceof Readable) {
					form.append('photo', image);
				} else if (typeof image === 'string') {
					if (/(http(s?)):\/\//i.test(image)) {
						try {
							// Download the file and create a Readable stream
							const response = await got(image, {
								responseType: 'buffer',
								timeout: {
									request: 30000,
								},
							});

							// Get the filename from URL or default
							const filename = new URL(image).pathname.split('/').pop() || 'photo.jpg';

							// Instead of creating a new stream, use the buffer directly
							form.append('photo', response.body, {
								filename: filename,
								contentType: response.headers['content-type'] || 'image/jpeg',
							});
						} catch (downloadError: any) {
							reject({
								type: 'error',
								msg: `Failed to download image from URL: ${downloadError.message}`,
							});
							return;
						}
					} else {
						const read = createReadStream(image);
						form.append('photo', read);
					}
				}

				form.once('error', (err) => {
					reject({ type: 'error', msg: `Form stream error: ${err.message}` });
				});

				const formHeaders = form.getHeaders();

				const { body, headers } = await client.post(url, {
					headers: formHeaders,
					body: form,
					timeout: {
						request: 30000,
					},
				});

				resolve({
					type: 'success',
					data: { headers: headers, response: body },
				});
			} catch (e) {
				console.log('Upload error:', e);
				if (e instanceof Error) {
					reject({ type: 'error', msg: `Error uploading photo: ${e.message}` });
				} else {
					reject({ type: 'error', msg: `An unknown error occurred.` });
				}
			}
		});
	}

	private async getClient() {
		if (this._client) return this._client;
		else {
			const gotModule = await import('got');
			got = gotModule.default;
			this._client = got.extend({
				retry: {
					limit: 2,
					methods: ['GET', 'POST', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE'],
					statusCodes: [429],
					maxRetryAfter: undefined,
					backoffLimit: Number.POSITIVE_INFINITY,
					noise: 100,
				},
				hooks: {
					beforeRequest: [
						async (options: any) => {
							if (DateTime.now() >= DateTime.fromISO(this.auth.getValue().tokenExpiration || '1970-01-01')) await this.tokenRefresh();
							const token = this.auth.getValue().accessToken || '';
							options.responseType = 'json';
							options.headers = options.headers || {};
							options.headers['accept'] = 'application/vnd.ccbchurch.v2+json';
							options.headers['authorization'] = `Bearer ${token}`;
						},
					],
					beforeError: [
						(error: any) => {
							let request: any, response: any;
							({ request, response } = error);
							if (response && response.body) {
								let message = '';
								if (response.body.error) message = response.body.error + ' ';
								if (response.body.errors) {
									response.body.errors.forEach((item: any, key: any) => {
										message += `(${key + 1}) ${item.message} `;
									});
								}
								if (response.body.messages) {
									response.body.messages.forEach((item: any, key: any) => {
										message += `(${key + 1}) ${item.message} `;
									});
								}
								if (response.body.errors?.messages) {
									if (Array.isArray(response.body.errors.messages)) {
										response.body.errors.messages.forEach((item: any, key: any) => {
											message += `(${key + 1}) ${item.message} `;
										});
									} else {
										message += response.body.errors.messages.message;
									}
								}
								if (message === '') {
									if (response.statusCode === 401) message = 'Access denied.';
									if (response.statusCode === 404) message = 'Not found.';
								}

								error.name = 'CCBError';
								error.message = `${message}`;
							}
							return error;
						},
					],
				},
				mutableDefaults: true,
			});

			return this._client;
		}
	}

	private getURL(path: string, params: Record<string, string | number> | null): string {
		const base = `https://api.ccbchurch.com`;
		let url = /(http(s?)):\/\//i.test(path) ? path : base + path;
		if (params) {
			const newParams = this.toString(params);
			url += '?';
			url += new URLSearchParams(newParams).toString();
		}
		return url;
	}

	private toString(o: Record<string, string | number>): Record<string, string> {
		const n: Record<string, string> = {};
		Object.keys(o).forEach((k) => {
			n[k] = '' + o[k];
		});

		return n;
	}
}
