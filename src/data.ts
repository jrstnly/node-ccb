import { Response } from './interfaces/response.js';
import { RequestOptions } from './interfaces/request-options';
import { Config } from './interfaces/config.js';
import { AuthData } from './interfaces/auth-data.js';

import { DateTime } from 'luxon';
import { Readable } from 'stream';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { skip } from 'rxjs/operators';
import { existsSync, mkdirSync, unlinkSync, rename, createReadStream, createWriteStream } from 'fs';

import got from 'got';
import * as mime from 'mime-types';
import * as uuid from 'uuid';
import FormData from 'form-data';

import mmm from 'mmmagic';
const { Magic, MAGIC_MIME_TYPE } = mmm;

export class Data {
	private tokenRefresh: () => Promise<void>;
	private config: BehaviorSubject<Config>;
	private auth: BehaviorSubject<AuthData> = new BehaviorSubject<AuthData>({ code: null, accessToken: null, refreshToken: null, tokenExpiration: null });
	private client: any;

	constructor(config: BehaviorSubject<Config>, auth: BehaviorSubject<AuthData>, refresh: () => Promise<void>) {
		this.tokenRefresh = refresh;
		this.config = config;
		this.auth = auth;
		this.client = got.extend({
			hooks: {
				beforeRequest: [
					async (options) => {
						if (DateTime.now() >= DateTime.fromISO(this.auth.getValue().tokenExpiration || '1970-01-01')) await this.tokenRefresh();
						const token = auth.getValue().accessToken || '';
						options.responseType = 'json';
						options.headers['accept'] = 'application/vnd.ccbchurch.v2+json';
						options.headers['authorization'] = `Bearer ${token}`;
					}
				],
				beforeError: [
					(error) => {
						let request: any, response: any;
						({ request, response } = error);
						if (response && response.body) {
							let message = "";
							if (response.body.error) message = response.body.error+' ';
							if (response.body.messages) {
								response.body.messages.forEach((item: any, key: any) => {
									message += `(${key+1}) ${item.message} `;
								});
							}
							if (message === "") {
								if (response.statusCode === 401) message = "Access denied.";

								message += " ";
							}

							error.name = 'CCBError';
							error.message = `${message}{${response.statusCode}}`;
						}
						return error;
					}
				]
			},
			mutableDefaults: true
		});
	}


	public get(path: string, params: Record<string, string | number> | null): Promise<Response> {
		return new Promise(async (resolve, reject) => {
			let body: any, headers: any;
			try {
				const url = this.getURL(path, params);
				({ body, headers } = await this.client.get(url));
				resolve({ type: 'success', data: { headers: headers, response: body } });
			} catch (e) {
				reject({ type: 'error', data: e });
			}
		});
	}

	public post(path: string, params: Record<string, string | number> | null, json: any): Promise<Response> {
		return new Promise(async (resolve, reject) => {
			let body: any, headers: any;
			try {
				const url = this.getURL(path, params);
				({ body, headers } = await this.client.post(url, { json: json }));
				resolve({ type: 'success', data: { headers: headers, response: body } });
			} catch (e) {
				reject({ type: 'error', data: e });
			}
		});
	}

	public put(path: string, params: Record<string, string | number> | null, json: any): Promise<Response> {
		return new Promise(async (resolve, reject) => {
			let body: any, headers: any;
			try {
				const url = this.getURL(path, params);
				({ body, headers } = await this.client.put(url, { json: json }));
				resolve({ type: 'success', data: { headers: headers, response: body } });
			} catch (e) {
				reject({ type: 'error', data: e });
			}
		});
	}

	public upload(path: string, image: string | Readable): Promise<Response> {
		return new Promise(async (resolve, reject) => {
			let localPath: string = '';
			try {
				let body: any, headers: any;
				const url = this.getURL(path, null);

				const form = new FormData();
				if (image instanceof Readable) {
					form.append('photo', image);
				} else if (typeof image === 'string') {
					if (/(http(s?)):\/\//i.test(image)) { // File is remote. Fetch it then convert to stream.
						const file = await this.downloadRemoteFile(image);
						localPath = file.data.path;
						form.append('photo', createReadStream(localPath));
					} else { // File is local. Just convert to stream.
						const read = createReadStream(image);
						form.append('photo', read);
					}
				}

				const formHeaders = form.getHeaders();
				({ body, headers } = await this.client.post(url, {
					headers: formHeaders,
					body: form,
				}));
				resolve({ type: 'success', data: { headers: headers, response: body } });
			} catch (e) {
				reject({ type: 'error', msg: `Error uploading photo: ${e.message}` });
			}
			if (localPath !== '') unlinkSync(localPath);
		});
	}



	private getURL(path: string, params: Record<string, string | number> | null): string {
		const base = `https://api.ccbchurch.com`;
		let url = (/(http(s?)):\/\//i.test(path)) ? path : base + path
		if (params) {
			const newParams = this.toString(params);
			url += '?'
			url += new URLSearchParams(newParams).toString();
		}
		return url;
	}

	private toString(o: Record<string, string | number>): Record<string, string> {
		const n: Record<string, string> = {}
		Object.keys(o).forEach(k => {
			n[k] = '' + o[k];
		});

		return n;
	}

	// TODO: Figure out how to stream directly from source to eliminate the need for downloading the file.
	private downloadRemoteFile(url: string): Promise<Response> {
		return new Promise((resolve, reject) => {
			if (!existsSync('uploads/')) {
				mkdirSync('uploads/');
			}
			const filename = uuid.v4();
			const downloadStream = got.stream(url);
			const fileWriterStream = createWriteStream(`uploads/${filename}`);

			downloadStream.on("error", (error) => {
				reject({ type: 'error', data: `Download failed: ${error.message}` });
			});
			fileWriterStream.on("error", (error) => {
				reject({ type: 'error', data: `Could not write file to system: ${error.message}` });
			}).on("finish", async () => {
				try {
					const type = await this.detectMimetype(`uploads/${filename}`);
					const extension = mime.extension(type.data);
					rename(`uploads/${filename}`, `uploads/${filename}.${extension}`, () => {
						resolve({
							type: 'success', data: {
								type: type.data,
								path: `uploads/${filename}.${extension}`,
							}
						});
					});
				} catch (e) {
					reject({ type: 'error', data: `Error detecting mime type: ${e.message}` });
				}
			});

			downloadStream.pipe(fileWriterStream);
		});
	}

	private detectMimetype(file: string): Promise<Response> {
		return new Promise((resolve, reject) => {
			const magic = new Magic(MAGIC_MIME_TYPE);
			magic.detectFile(file, function(err, result) {
				if (err) reject({ type: 'error', data: err });
				resolve({ type: 'success', data: result });
			});
		});
	}

}
