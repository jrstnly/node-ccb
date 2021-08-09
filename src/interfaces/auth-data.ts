export interface AuthData {
	code?: string | null;
	accessToken?: string | null;
	refreshToken?: string | null;
	tokenExpiration?: string | null;
}
