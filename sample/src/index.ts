import { CCB, AuthData } from '@jrstnly/ccb';
import { Low, JSONFile } from 'lowdb';

import * as dotenv from "dotenv";
dotenv.config({ path: '.env' });

const file = 'db.json';
const adapter = new JSONFile<AuthData>(file);
const db = new Low<AuthData>(adapter);

const defaultAuthData: AuthData = {
	code: null,
	accessToken: null,
	refreshToken: null,
	tokenExpiration: null,
}
const dataGetter = (): AuthData => {
	return db.data || defaultAuthData;
}
const dataSetter = async (data: AuthData) => {
	db.data = data;
	await db.write();
}

try {
	await db.read()
	db.data ||= defaultAuthData;

	const ccb = new CCB();
	const connection = await ccb.connect({
		church:process.env.CCB_CHURCH || '',
		client:process.env.CCB_CLIENT || '',
		secret:process.env.CCB_SECRET || '',
		redirectUri: process.env.CCB_REDIRECT_URI || '',
		dataGetter:dataGetter,
		dataSetter:dataSetter
	});
	if (connection.type === 'success') {
		const individual = await ccb.individuals.get('3151');
		console.log(individual);
	} else {
		console.log(connection);
	}

	//ccb.updateAuthorizationCode(process.env.CCB_CODE || '');
} catch(e) {
	console.log(e);
}
