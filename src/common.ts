export function validate(object: any, schema: any) {
	return Object.keys(schema).filter(key => !schema[key](object[key], object)).map(key =>
		new Error(`Required parameter "${key}" is invalid.`)
	);
}
