import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate } from '../common.js';
import { defaultIndividual } from '../defaults.js';
import { Data } from '../data.js';

export class Church {
	private data: Data;
	constructor(data: Data) {
		this.data = data;
	}

	public async get(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church`, params);
		return response.data.response;
	}

	public async areasOfTown(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/areas_of_town`, params);
		return response.data.response;
	}

	public async schools(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/schools`, params);
		return response.data.response;
	}

	public async schoolGrades(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/school_grades`, params);
		return response.data.response;
	}

	public async attendanceGroupings(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/attendance_groupings`, params);
		return response.data.response;
	}

	public async socialNetworks(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/social_networks`, params);
		return response.data.response;
	}

	public async mobileCarriers(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/mobile_carriers`, params);
		return response.data.response;
	}

	public async countries(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/countries`, params);
		return response.data.response;
	}

	public async membershipTypes(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/membership_types`, params);
		return response.data.response;
	}

	public async services(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/services`, params);
		return response.data.response;
	}

	public async customFields(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/custom_fields`, params);
		return response.data.response;
	}

	public async reasonsLeft(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/reasons_left`, params);
		return response.data.response;
	}

	public async privacyDefaults(params:Record<string, string | number> | null = null): Promise<any> {
		const response: any = await this.data.get(`/church/privacy_defaults`, params);
		return response.data.response;
	}

}
