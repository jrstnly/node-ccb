import { Readable } from 'stream';

/** A file to upload: raw bytes, a stream, or either with an explicit filename and content type. */
export type FileInput = Buffer | Readable | { data: Buffer | Readable; filename?: string; contentType?: string };

/** Query string parameters. Arrays are sent as repeated keys; `undefined` and `null` are omitted. */
export type QueryParams = object;

export interface RequestConfig {
	method?: string;
	/** Path relative to the API base (e.g. `/individuals/1`), or an absolute URL. */
	path: string;
	query?: QueryParams | null;
	/** JSON request body. */
	body?: unknown;
	/** Multipart form fields. Takes precedence over `body`. */
	form?: Record<string, any>;
	headers?: Record<string, string>;
	/** Timeout in milliseconds. */
	timeout?: number;
}

/** Pagination details from the `x-*` response headers of list endpoints. */
export interface Pagination {
	page?: number;
	perPage?: number;
	totalPages?: number;
	total?: number;
	offset?: number;
	nextPage?: number;
}

/** Rate limit details from the `x-ratelimit-*` response headers. */
export interface RateLimit {
	limit: number;
	remaining?: number;
	reset?: Date;
}

export interface ApiResponse<T = any> {
	data: T;
	status: number;
	headers: Record<string, string | string[] | undefined>;
	pagination: Pagination | null;
	rateLimit: RateLimit | null;
}
