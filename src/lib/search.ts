import { BehaviorSubject, Observable } from 'rxjs';

import { Readable } from 'stream';

import { validate } from '../common.js';
import { defaultSearchConfig } from '../defaults.js';
import { Data } from '../data.js';

import { SearchGroup, SearchConstraint, ConstraintOperator, IndividualConstraintField } from 'interfaces/search.js';

export class Search {
	private type: string;
	private config: any;
	private data: Data;
	constructor(type: string, config: any = {}, data: Data) {
		this.type = type;
		this.config = { ...defaultSearchConfig, ...config };
		this.data = data;
	}

	/**
	 * Run the search. `filters` is a single constraint or a single group; to combine several
	 * constraints wrap them in `Search.group(...)`. The API rejects a bare array.
	 */
	public run(filters: SearchGroup | SearchConstraint) {
		return new Promise(async (resolve, reject) => {
			try {
				const data = {
					configuration: this.config,
					filters: filters
				}
				const response: any = await this.data.post(`/search/${this.type}/results`, null, data);
				resolve(response.data.response);
			} catch (e) {
				reject(e);
			}
		});
	}

	static group(operator: 'and' | 'or', constraints: SearchConstraint[], inverted = false): SearchGroup {
		return {
			type: 'group',
			operator: operator,
			inverted: inverted,
			conditions: constraints
		}
	}
	/**
	 * Build a constraint. Note that the API currently ignores `inverted`; use a negated operator
	 * (`not_equal`, `does_not_contain`, `not_like`, `not_in`, ...) to exclude matches.
	 */
	static filter(operator: ConstraintOperator, field: IndividualConstraintField, value: string, inverted = false): SearchConstraint {
		return {
			type: 'constraint',
			id: field,
			operator: operator,
			value: value,
			inverted: inverted,
		}
	}

}
