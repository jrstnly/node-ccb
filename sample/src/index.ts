import { CCB, Config, AuthData, Search } from '@jrstnly/ccb';
import { createReadStream } from 'fs';

import * as dotenv from "dotenv";
dotenv.config({ path: '.env' });

(async () => {

try {
	const low = await import('lowdb');
	const Low = low.Low;
	const JSONFile = low.JSONFile;

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


	await db.read()
	db.data ||= defaultAuthData;

	const ccb = new CCB();
	const connection = await ccb.connect(<Config>{
		church:process.env.CCB_CHURCH || '',
		client:process.env.CCB_CLIENT || '',
		secret:process.env.CCB_SECRET || '',
		redirectUri: process.env.CCB_REDIRECT_URI || '',
		dataGetter:dataGetter,
		dataSetter:dataSetter
	});

	if (connection.type === 'success') {
		//const church = await ccb.church.get();
		//console.log(church);

		//const mobileCarriers = await ccb.church.mobileCarriers();
		//console.log(mobileCarriers);

		//const individuals = await ccb.individuals.get({name:'JR'});
		//console.log(individuals);

		//const individual = await ccb.individual(3151).get();
		//console.log(individual);

		//const individual = await ccb.individual('73757').updatePhoto('https://cultivatedculture.com/wp-content/uploads/2019/12/LinkedIn-Profile-Picture-Example-Tynan-Allan.jpeg');
		//console.log(individual);

		//const individual = await ccb.individuals.add({
		//	first_name: "Testing1",
		//	last_name: "Account2",
		//});
		//console.log(individual);

		//const family = await ccb.family(35763).get();
		//console.log(family);

		//const individual = await ccb.family('35763').addMember({
		//	first_name: "Child15",
		//	last_name: "Account",
		//	family_position: "CHILD"
		//});
		//console.log(individual);

		//const added = await ccb.individual(63660).addToGroup(2323);
		//console.log(added);

		//const removed = await ccb.individual(63660).removeFromGroup(2323);
		//console.log(removed);

		//const note = await ccb.individual('73300').addNote("This is a test note.");
		//console.log(note);

		//const queue = await ccb.individual('73300').addToQueue(321, { note: "This is a test note." });
		//console.log(queue);

		//const groups = await ccb.groups.get({ per_page: 100, page: 15 });
		//console.log(groups);

		//const group = await ccb.group('4882').get();
		//console.log(group);

		//const participants = await ccb.group('4882').participants();
		//console.log(participants);

		//const events = await ccb.events.get({ per_page: 100, page: 60, range_type: 'ALL' });
		//console.log(events);

		//const forms = await ccb.forms.get();
		//console.log(forms)

		//const form = await ccb.form(2073).get();
		//console.log(JSON.stringify(form));

		//const questions = await ccb.form(2073).questions();
		//console.log(JSON.stringify(questions));

		/*
		const responses = await ccb.form(2073).responses();
		//console.log(responses);
		responses.forEach((response: any) => {
			console.log(JSON.stringify(response))
		});
		*/

		/*
		const search = await ccb.search('individuals').run(Search.filter('equal', 'first_name', 'JR'));
		console.log(search);
		*/

	} else {
		console.log(connection);
	}

	//ccb.updateAuthorizationCode(process.env.CCB_CODE || '');
} catch(e) {
	console.log(e);
}

})()