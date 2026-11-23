/**
 * Error thrown for any failed API call.
 */
export class CCBError extends Error {
	/** HTTP status code, when the server responded. */
	public status?: number;
	/** Parsed response body, when the server responded. */
	public body?: unknown;
	/** Seconds to wait before retrying, from the `retry-after` header of a 429 response. */
	public retryAfter?: number;
	/** The underlying error, if any. */
	public cause?: unknown;

	constructor(message: string, details: { status?: number; body?: unknown; retryAfter?: number; cause?: unknown } = {}) {
		super(message);
		this.name = 'CCBError';
		this.status = details.status;
		this.body = details.body;
		this.retryAfter = details.retryAfter;
		this.cause = details.cause;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Error thrown when a token could not be obtained or refreshed.
 * `code` holds the OAuth error code (e.g. `invalid_grant`) when the token endpoint returned one.
 */
export class CCBAuthError extends CCBError {
	public code?: string;

	constructor(message: string, details: { code?: string; status?: number; body?: unknown; cause?: unknown } = {}) {
		super(message, details);
		this.name = 'CCBAuthError';
		this.code = details.code;
	}
}
