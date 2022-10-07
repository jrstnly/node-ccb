import { AuthData } from './auth-data.js';

export interface Config {
	church: string;
	client: string;
	secret: string;
	code?: string;
	redirectUri?: string;
	tmpFilePath?: string;
	dataGetter: () => Promise<AuthData> | AuthData;
	dataSetter: (data: AuthData) => Promise<void> | void;
}
