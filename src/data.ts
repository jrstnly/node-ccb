import { Readable } from 'stream';
import { createReadStream } from 'fs';

import FormData from 'form-data';

import { Auth, ACCEPT } from './auth.js';
import { CCBError } from './errors.js';
import { Response } from './interfaces/response.js';
import { ApiResponse, FileInput, Pagination, QueryParams, RateLimit, RequestConfig } from './interfaces/request.js';

export class Data {
	private auth: Auth;
	private _got: any = null;

	constructor(auth: Auth) {
		this.auth = auth;
	}

	/**
	 * Perform an authenticated API call and return the parsed body along with pagination and
	 * rate limit information from the response headers.
	 */
	public async request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
		const got = await this.getGot();
		const url = this.getURL(config.path, config.query);
		const method = (config.method || 'GET').toUpperCase();

		const send = async (token: string) => {
			const options: any = {
				method,
				headers: { accept: ACCEPT, authorization: `Bearer ${token}`, ...(config.headers || {}) },
				responseType: 'text',
				throwHttpErrors: false,
				timeout: { request: config.timeout || this.auth.config.timeout || 60000 },
				retry: {
					// A 429 means the request was not processed, so it is safe to retry for every method.
					limit: this.auth.config.maxRetries ?? 3,
					methods: ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE'],
					statusCodes: [429],
				},
			};
			if (config.form) {
				const form = this.buildForm(config.form);
				options.body = form;
				options.headers = { ...options.headers, ...form.getHeaders() };
				// A consumed stream cannot be replayed.
				options.retry = { limit: 0 };
			} else if (config.body !== undefined && method !== 'GET' && method !== 'HEAD') {
				options.json = config.body;
			}
			return got(url, options);
		};

		let response: any;
		try {
			response = await send(await this.auth.token());
			// The token may have been revoked by a refresh elsewhere; get a new one and try once more.
			if (response.statusCode === 401 && !config.form) {
				response = await send(await this.auth.refresh());
			}
		} catch (e: any) {
			if (e instanceof CCBError) throw e;
			throw new CCBError(e?.message || 'Request failed.', { cause: e });
		}

		const headers = response.headers || {};
		const data = this.parseBody(response.body, headers['content-type']);

		if (response.statusCode < 200 || response.statusCode >= 300) {
			const retryAfter = parseInt(headers['retry-after'], 10);
			throw new CCBError(this.errorMessage(response.statusCode, data), {
				status: response.statusCode,
				body: data,
				retryAfter: isNaN(retryAfter) ? undefined : retryAfter,
			});
		}

		return {
			data: data as T,
			status: response.statusCode,
			headers,
			pagination: this.parsePagination(headers),
			rateLimit: this.parseRateLimit(headers),
		};
	}

	/** Perform an API call and return only the parsed body. Used by the generated endpoint classes. */
	public async call<T = any>(config: RequestConfig): Promise<T> {
		return (await this.request<T>(config)).data;
	}

	public get(path: string, params: QueryParams | null): Promise<Response> {
		return this.legacy({ method: 'GET', path, query: params });
	}

	public post(path: string, params: QueryParams | null, json: any): Promise<Response> {
		return this.legacy({ method: 'POST', path, query: params, body: json });
	}

	public put(path: string, params: QueryParams | null, json: any): Promise<Response> {
		return this.legacy({ method: 'PUT', path, query: params, body: json });
	}

	public delete(path: string, params: QueryParams | null, json: any): Promise<Response> {
		return this.legacy({ method: 'DELETE', path, query: params, body: json });
	}

	/** Upload a photo from a URL, a local file path, or a stream. */
	public async upload(path: string, image: string | Readable | Buffer, field = 'photo'): Promise<Response> {
		let file: FileInput;
		if (typeof image === 'string') {
			if (/^https?:\/\//i.test(image)) {
				try {
					const got = await this.getGot();
					const download = await got(image, { responseType: 'buffer', timeout: { request: 30000 } });
					file = {
						data: download.body,
						filename: new URL(image).pathname.split('/').pop() || 'photo.jpg',
						contentType: download.headers['content-type'] || 'image/jpeg',
					};
				} catch (e: any) {
					throw { type: 'error', msg: `Failed to download image from URL: ${e?.message}` };
				}
			} else {
				file = createReadStream(image);
			}
		} else {
			file = image;
		}

		try {
			const response = await this.request({ method: 'POST', path, form: { [field]: file } });
			return { type: 'success', data: { headers: response.headers, response: response.data } };
		} catch (e: any) {
			throw { type: 'error', msg: `Error uploading photo: ${e?.message || 'An unknown error occurred.'}`, data: e };
		}
	}

	// Response envelope used by the hand-written resource classes.
	private async legacy(config: RequestConfig): Promise<Response> {
		try {
			const response = await this.request(config);
			return { type: 'success', data: { headers: response.headers, response: response.data } };
		} catch (e) {
			throw { type: 'error', data: e };
		}
	}

	private async getGot() {
		if (!this._got) this._got = (await import('got')).default;
		return this._got;
	}

	private buildForm(fields: Record<string, any>): FormData {
		const form = new FormData();
		const append = (key: string, value: any) => {
			if (value === undefined || value === null) return;
			if (Buffer.isBuffer(value)) {
				form.append(key, value, { filename: key });
			} else if (value instanceof Readable) {
				form.append(key, value);
			} else if (typeof value === 'object' && 'data' in value) {
				const options: Record<string, string> = {};
				if (value.filename) options.filename = value.filename;
				else if (Buffer.isBuffer(value.data)) options.filename = key;
				if (value.contentType) options.contentType = value.contentType;
				form.append(key, value.data, options);
			} else if (typeof value === 'object') {
				form.append(key, JSON.stringify(value));
			} else {
				form.append(key, String(value));
			}
		};
		for (const key of Object.keys(fields)) {
			const value = fields[key];
			if (Array.isArray(value)) value.forEach((item) => append(key, item));
			else append(key, value);
		}
		return form;
	}

	private parseBody(body: string | undefined, contentType: string | undefined): unknown {
		if (body === undefined || body === null || body === '') return undefined;
		try {
			return JSON.parse(body);
		} catch {
			return body;
		}
	}

	private errorMessage(status: number, body: any): string {
		const parts: string[] = [];
		const collect = (items: any) => {
			if (Array.isArray(items)) {
				items.forEach((item: any) => parts.push(typeof item === 'string' ? item : item?.message ?? JSON.stringify(item)));
			} else if (items && typeof items === 'object' && items.message) {
				parts.push(items.message);
			} else if (typeof items === 'string') {
				parts.push(items);
			}
		};
		if (body && typeof body === 'object') {
			if (typeof body.error === 'string') parts.push(body.error);
			if (typeof body.error_description === 'string') parts.push(body.error_description);
			if (typeof body.message === 'string') parts.push(body.message);
			if (body.errors?.messages) collect(body.errors.messages);
			else collect(body.errors);
			collect(body.messages);
		} else if (typeof body === 'string' && body.length < 500) {
			parts.push(body);
		}
		if (parts.length === 0) {
			const defaults: Record<number, string> = {
				400: 'Bad request.',
				401: 'Access denied.',
				403: 'Not authorized.',
				404: 'Not found.',
				412: 'The request failed validation.',
				429: 'Rate limit exceeded.',
			};
			parts.push(defaults[status] || `Request failed with status ${status}.`);
		}
		return parts.join(' ');
	}

	private parsePagination(headers: Record<string, any>): Pagination | null {
		const number = (name: string) => {
			const value = parseInt(headers[name], 10);
			return isNaN(value) ? undefined : value;
		};
		const page = number('x-page');
		const perPage = number('x-per-page');
		if (page === undefined && perPage === undefined) return null;
		return {
			page,
			perPage,
			totalPages: number('x-total-pages'),
			total: number('x-total'),
			offset: number('x-offset'),
			nextPage: number('x-next-page'),
		};
	}

	private parseRateLimit(headers: Record<string, any>): RateLimit | null {
		const limit = parseInt(headers['x-ratelimit-limit'], 10);
		if (isNaN(limit)) return null;
		const remaining = parseInt(headers['x-ratelimit-remaining'], 10);
		const reset = parseInt(headers['x-ratelimit-reset'], 10);
		return {
			limit,
			remaining: isNaN(remaining) ? undefined : remaining,
			reset: isNaN(reset) ? undefined : new Date(reset * 1000),
		};
	}

	private getURL(path: string, params?: QueryParams | null): string {
		let url = /^https?:\/\//i.test(path) ? path : this.auth.apiBase + path;
		if (params) {
			const search = new URLSearchParams();
			for (const key of Object.keys(params)) {
				const value = (params as Record<string, unknown>)[key];
				if (value === undefined || value === null) continue;
				if (Array.isArray(value)) value.forEach((item) => search.append(key, String(item)));
				else if (typeof value === 'object') search.append(key, JSON.stringify(value));
				else search.append(key, String(value));
			}
			const query = search.toString();
			if (query) url += (url.includes('?') ? '&' : '?') + query;
		}
		return url;
	}
}
