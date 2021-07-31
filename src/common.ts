import got from 'got';
import * as mime from 'mime-types';
import * as uuid from 'uuid';
import FormData from 'form-data';
import { BehaviorSubject } from 'rxjs';

import { existsSync, mkdirSync, unlinkSync, rename, createReadStream, createWriteStream } from 'fs';
import { Readable } from 'stream';

import { Response } from './interfaces/response.js';
import { RequestOptions } from './interfaces/request-options';
import { Config } from './interfaces/config.js';
import { AuthData } from './interfaces/auth-data.js';

import mmm from 'mmmagic';
const { Magic, MAGIC_MIME_TYPE } = mmm;

export function validate(object: any, schema: any) {
	return Object.keys(schema).filter(key => !schema[key](object[key])).map(key =>
		new Error(`Required parameter "${key}" is empty.`)
	);
}


export function getJSON(path: string, params: Record<string, string> | null, config: Config, auth: BehaviorSubject<AuthData>): Promise<Response> {
	return new Promise(async (resolve, reject) => {
		try {
			const url = getURL(path, params);
			const token = auth.getValue().accessToken || '';
			const data = await got(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/vnd.ccbchurch.v2+json',
					'Authorization': `Bearer ${token}`
				}
			}).json();
			resolve({type: 'success', data: data});
		} catch(e) {
			reject({type: 'error', data: e});
		}
	});
}

export function postJSON(path: string, params: Record<string, string> | null, body: any, config: Config, auth: BehaviorSubject<AuthData>): Promise<Response> {
	return new Promise(async (resolve, reject) => {
		try {
			const url = getURL(path, params);
			const token = auth.getValue().accessToken || '';
			const data = await got(url, {
				method: 'POST',
				headers: {
					'Accept': 'application/vnd.ccbchurch.v2+json',
					'Authorization': `Bearer ${token}`
				},
				json: body,
			}).json();
			resolve({type: 'success', data: data});
		} catch(e) {
			reject({type: 'error', data: e});
		}
	});
}

export function putJSON(path: string, params: Record<string, string> | null, body: any, config: Config, auth: BehaviorSubject<AuthData>): Promise<Response> {
	return new Promise(async (resolve, reject) => {
		try {
			const url = getURL(path, params);
			const token = auth.getValue().accessToken || '';
			const data = await got(url, {
				method: 'PUT',
				headers: {
					'Accept': 'application/vnd.ccbchurch.v2+json',
					'Authorization': `Bearer ${token}`
				},
				json: body,
			}).json();
			resolve({type: 'success', data: data});
		} catch(e) {
			reject({type: 'error', data: e});
		}
	});
}


export function uploadPhoto(path: string, image: string | Readable, config: Config, auth: BehaviorSubject<AuthData>): Promise<Response> {
	return new Promise(async (resolve, reject) => {
		try {
			const url = getURL(path, null);
			const token = auth.getValue().accessToken || '';
			let localPath: string = '';

			const form = new FormData();
			if (image instanceof Readable) {
				form.append('photo', image);
			} else if (typeof image === 'string') {
				if (/(http(s?)):\/\//i.test(image)) { // File is remote. Fetch it then convert to stream.
					const file = await downloadRemoteFile(image);
					localPath = file.data.path;
					form.append('photo', createReadStream(localPath));
				} else { // File is local. Just convert to stream.
					const read = createReadStream(image);
					form.append('photo', read);
				}
			}

			const formHeaders = form.getHeaders();
			const data = await got.post(url, {
				headers: {
					'accept': 'application/vnd.ccbchurch.v2+json',
					'authorization': `Bearer ${token}`,
					...formHeaders,
				},
				body: form,
			}).json();
			if (localPath !== '') unlinkSync(localPath);
			resolve({type: 'success', data: data});
		} catch (e) {
			console.log(e);
			reject({type: 'error', msg: `Error uploading photo: ${e.message}`});
		}

	});
}

function getURL(path: string, params: Record<string, string> | null): string {
	const base = `https://api.ccbchurch.com`;
	let url = (/(http(s?)):\/\//i.test(path)) ? path : base+path
	if (params) {
		url += '?'
		url += new URLSearchParams(params).toString();
	}
	return url;
}

function downloadRemoteFile(url: string): Promise<Response> {
	return new Promise((resolve, reject) => {
		if (!existsSync('uploads/')){
			mkdirSync('uploads/');
		}
		const filename = uuid.v4();
		const downloadStream = got.stream(url);
		const fileWriterStream = createWriteStream(`uploads/${filename}`);

		downloadStream.on("error", (error) => {
			reject({type:'error',data:`Download failed: ${error.message}`});
		});
		fileWriterStream.on("error", (error) => {
			reject({type:'error',data:`Could not write file to system: ${error.message}`});
		}).on("finish", async () => {
			try {
				const type = await detectMimetype(`uploads/${filename}`);
				const extension = mime.extension(type.data);
				rename(`uploads/${filename}`, `uploads/${filename}.${extension}`, () => {
					resolve({type: 'success', data: {
						type: type.data,
						path: `uploads/${filename}.${extension}`,
					}});
				});
			} catch (e) {
				reject({type:'error',data:`Error detecting mime type: ${e.message}`});
			}
		});

		downloadStream.pipe(fileWriterStream);
	});
}

function detectMimetype(file: string): Promise<Response> {
	return new Promise((resolve, reject) => {
		const magic = new Magic(MAGIC_MIME_TYPE);
		magic.detectFile(file, function(err, result) {
			if (err) reject({type: 'error', data: err});
			resolve({type: 'success', data: result});
		});
	});
}

export const defaultIndividual = {
	active: true,
	first_name: "",
	last_name: "",
	middle_name: "",
	legal_first_name: "",
	prefix: "",
	suffix: "",
	gender: "",
	birthday: "",
	anniversary: "",
	email: "",
	addresses: {
		mailing: {
			city: "",
			state: "",
			street: "",
			country_iso: "",
			zip: ""
		}
	},
	phone: {
		home: "",
		mobile: "",
		mobile_carrier_id: "",
		work: ""
	},
	preferred_number: "NONE",
	family_position: "PRIMARY_CONTACT",
	marital_status: "",
	baptized: "",
	baptized_date: "",
	baptized_note: "",
	deceased: "",
	allergies: "",
	confirmed_no_allergies: "NOT_SPECIFIED",
	membership_type_id: 1,
	membership_start_date: "",
	campus_id: 1,
	church_service: [""],
	school_id: "",
	school_grade_id: "",
	barcode: "",
	listed: true,
	imited_access_user: true,
	reason_left_id: "",
	cid: "",
	custom_fields: []
}
