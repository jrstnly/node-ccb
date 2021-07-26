import { AuthData } from './auth-data';

export interface Config {
	church: string;
	client: string;
	secret: string;
	code?: string;
	redirectUri?: string;
	dataGetter: () => Promise<AuthData> | AuthData;
	dataSetter: (data: AuthData) => Promise<void> | void;
}
