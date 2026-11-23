#!/usr/bin/env node
// Generates src/generated/* from openapi/chms-api-specs.json.
//
// Refresh the spec and regenerate with:
//   npm run generate:fetch
//
// One class is emitted per API reference group (the first tag of each operation), with one method
// per operation named after its operationId.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const spec = JSON.parse(readFileSync(join(root, 'openapi/chms-api-specs.json'), 'utf8'));
const out = join(root, 'src/generated');

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const RESERVED = new Set(['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'await', 'query', 'body']);

const isIdent = (s) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(s);
const key = (s) => (isIdent(s) ? s : JSON.stringify(s));
const camel = (s) => s.replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^[A-Z]/, (c) => c.toLowerCase());
const pascal = (s) => camel(s).replace(/^[a-z]/, (c) => c.toUpperCase());
const clean = (s) => String(s).replace(/\*\//g, '*\\/').replace(/\s+/g, ' ').trim();

function deref(node) {
	let seen = 0;
	while (node && node.$ref) {
		if (seen++ > 20) throw new Error(`Circular $ref: ${node.$ref}`);
		const { $ref, ...rest } = node;
		const target = $ref.replace(/^#\//, '').split('/').reduce((o, k) => o?.[k], spec);
		if (!target) throw new Error(`Unresolved $ref: ${$ref}`);
		node = { ...target, ...rest };
	}
	return node;
}

const usedTypes = new Set();

/** Convert a schema to a TypeScript type expression. `pad` is the indentation of the enclosing line. */
function toType(schema, pad = '') {
	if (!schema || typeof schema !== 'object') return 'unknown';
	let type;
	if (schema.$ref) {
		const match = schema.$ref.match(/^#\/components\/schemas\/(.+)$/);
		if (match) {
			usedTypes.add(match[1]);
			type = match[1];
		} else {
			type = toType(deref(schema), pad);
		}
	} else if (schema.allOf || schema.oneOf || schema.anyOf) {
		const parts = (schema.allOf || schema.oneOf || schema.anyOf).map((s) => toType(s, pad));
		if (schema.allOf && schema.properties) parts.push(objectType(schema, pad));
		const unique = [...new Set(parts)];
		type = unique.length === 1 ? unique[0] : `(${unique.join(schema.allOf ? ' & ' : ' | ')})`;
	} else if (Array.isArray(schema.enum) && schema.enum.length) {
		type = [...new Set(schema.enum.map((v) => JSON.stringify(v)))].join(' | ');
		if (schema.enum.length > 1) type = `(${type})`;
	} else if (schema.type === 'array' || schema.items) {
		type = `Array<${toType(schema.items, pad)}>`;
	} else if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
		type = objectType(schema, pad);
	} else if (schema.type === 'integer' || schema.type === 'number') {
		type = 'number';
	} else if (schema.type === 'boolean') {
		type = 'boolean';
	} else if (schema.type === 'string') {
		type = schema.format === 'binary' ? 'FileInput' : 'string';
	} else {
		type = 'unknown';
	}
	if (schema.nullable && type !== 'unknown') type = `${type} | null`;
	return type;
}

function objectType(schema, pad) {
	const props = schema.properties && typeof schema.properties === 'object' ? Object.entries(schema.properties) : [];
	const extra = schema.additionalProperties;
	if (props.length === 0) {
		if (extra && typeof extra === 'object') return `Record<string, ${toType(extra, pad)}>`;
		return 'Record<string, any>';
	}
	const required = new Set(Array.isArray(schema.required) ? schema.required : []);
	const inner = pad + '\t';
	const lines = [];
	for (const [name, prop] of props) {
		const doc = propDoc(prop);
		if (doc) lines.push(`${inner}/** ${doc} */`);
		lines.push(`${inner}${key(name)}${required.has(name) ? '' : '?'}: ${toType(prop, inner)};`);
	}
	if (extra) lines.push(`${inner}[key: string]: any;`);
	return `{\n${lines.join('\n')}\n${pad}}`;
}

function propDoc(prop) {
	if (!prop || typeof prop !== 'object') return '';
	const parts = [];
	if (typeof prop.description === 'string' && prop.description.trim()) parts.push(clean(prop.description));
	if (prop.deprecated) parts.push('@deprecated');
	return parts.join(' ');
}

// ---------------------------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------------------------

const groups = new Map();
const seenIds = new Set();

for (const [path, item] of Object.entries(spec.paths)) {
	const shared = item.parameters || [];
	for (const method of METHODS) {
		const op = item[method];
		if (!op) continue;
		if (path === '/oauth/token') continue; // handled by the client's auth layer
		if (!op.operationId) throw new Error(`Missing operationId: ${method} ${path}`);
		if (seenIds.has(op.operationId)) throw new Error(`Duplicate operationId: ${op.operationId}`);
		seenIds.add(op.operationId);
		const tag = (op.tags && op.tags[0]) || 'misc';
		if (!groups.has(tag)) groups.set(tag, []);
		groups.get(tag).push({ path, method, op, params: [...shared, ...(op.parameters || [])].map(deref) });
	}
}

function buildOperation({ path, method, op, params }) {
	const name = camel(op.operationId);
	const typeBase = pascal(op.operationId);
	const types = [];

	// Path parameters, in the order they appear in the path.
	const pathNames = [...path.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
	const used = new Set();
	const pathArgs = pathNames.map((raw) => {
		let arg = camel(raw);
		if (RESERVED.has(arg)) arg = `${arg}Param`;
		while (used.has(arg)) arg += '_';
		used.add(arg);
		const def = params.find((p) => p.in === 'path' && p.name === raw);
		return { raw, arg, description: def?.description };
	});
	const url = '`' + path.replace(/\{([^}]+)\}/g, (_, raw) => `\${encodeURIComponent(${pathArgs.find((p) => p.raw === raw).arg})}`) + '`';

	// Request body.
	let body = null;
	if (op.requestBody) {
		const rb = deref(op.requestBody);
		const content = rb.content || {};
		const type = ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded', '*/*'].find((t) => content[t]) || Object.keys(content)[0];
		if (type) {
			const schema = content[type].schema || {};
			const resolved = deref(schema);
			const binary = JSON.stringify(resolved).includes('"binary"');
			body = {
				schema,
				resolved,
				form: type === 'multipart/form-data' || (type === 'application/x-www-form-urlencoded' && binary),
				required: rb.required === true || type !== '*/*',
				description: rb.description,
			};
		}
	}

	// Query parameters. The spec describes filters of a few GET endpoints as a request body; those
	// are sent as query parameters, since a GET request cannot carry a body.
	const queryProps = {};
	const queryRequired = [];
	for (const p of params.filter((p) => p.in === 'query')) {
		queryProps[p.name] = { ...(p.schema || {}), description: p.description ?? p.schema?.description, deprecated: p.deprecated };
		if (p.required) queryRequired.push(p.name);
	}
	if (body && method === 'get') {
		for (const [k, v] of Object.entries(body.resolved.properties || {})) if (!(k in queryProps)) queryProps[k] = v;
		body = null;
	}
	const hasQuery = Object.keys(queryProps).length > 0;

	const args = pathArgs.map((p) => `${p.arg}: number | string`);
	const docParams = pathArgs.map((p) => `@param ${p.arg} ${clean(p.description || `The \`${p.raw}\` path parameter.`)}`);
	const call = [`method: '${method.toUpperCase()}'`, `path: ${url}`];

	if (body) {
		let bodyType;
		const ref = body.schema.$ref && body.schema.$ref.match(/^#\/components\/schemas\/(.+)$/);
		if (ref) {
			bodyType = toType(body.schema);
		} else {
			bodyType = `${typeBase}Body`;
			const expr = toType(body.schema);
			types.push(`/** Request body of {@link ${typeBase}Body | ${name}}. */\nexport type ${bodyType} = ${expr};`.replace(`{@link ${typeBase}Body | ${name}}`, `\`${name}\``));
		}
		args.push(`body${body.required ? '' : '?'}: ${bodyType}`);
		docParams.push(`@param body ${clean(body.description || (body.form ? 'Multipart form fields.' : 'Request body.'))}`);
		call.push(body.form ? 'form: body' : 'body');
	}
	if (hasQuery) {
		const queryType = `${typeBase}Query`;
		types.push(`/** Query parameters of \`${name}\`. */\nexport type ${queryType} = ${objectType({ properties: queryProps, required: queryRequired }, '')};`);
		// A required query parameter can only stay optional if it follows an optional body.
		const optional = queryRequired.length === 0 || (body && !body.required);
		args.push(`query${optional ? '?' : ''}: ${queryType}`);
		docParams.push('@param query Query parameters.');
		call.push('query');
	}

	// Response type: the first documented 2xx response that has a schema.
	let responseType = 'void';
	for (const [status, response] of Object.entries(op.responses || {}).sort()) {
		if (!/^2/.test(status)) continue;
		const content = deref(response).content || {};
		const schema = (content['application/json'] || content['*/*'] || Object.values(content)[0])?.schema;
		if (schema) {
			responseType = toType(schema, '\t');
			break;
		}
	}

	const scopes = [...new Set((op.security || []).flatMap((s) => Object.values(s).flat()))];
	const doc = ['/**'];
	doc.push(` * ${clean(op.summary || op.operationId)}`);
	if (op.description && clean(op.description) !== clean(op.summary || '')) {
		doc.push(' *');
		for (const line of String(op.description).trim().split('\n')) doc.push(` * ${line.replace(/\*\//g, '*\\/').trimEnd()}`.trimEnd());
	}
	doc.push(' *');
	doc.push(` * \`${method.toUpperCase()} ${path}\`${scopes.length ? ` — scope: ${scopes.map((s) => `\`${s}\``).join(', ')}` : ''}`);
	if (docParams.length) doc.push(' *');
	for (const p of docParams) doc.push(` * ${p}`);
	if (op.deprecated) doc.push(' * @deprecated');
	doc.push(' */');

	const code = [
		...doc.map((l) => `\t${l}`),
		`\tpublic ${name}(${args.join(', ')}): Promise<${responseType}> {`,
		`\t\treturn this.client.call({ ${call.join(', ')} });`,
		'\t}',
	].join('\n');

	return { name, code, types, method: method.toUpperCase(), path, summary: clean(op.summary || ''), deprecated: !!op.deprecated };
}

// ---------------------------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------------------------

const HEADER = '// This file is generated by scripts/generate.mjs from openapi/chms-api-specs.json. Do not edit by hand.\n';

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const index = [];
const reference = [];
let total = 0;

for (const [tag, operations] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
	usedTypes.clear();
	const className = `${pascal(tag)}Api`;
	const property = camel(tag);
	const file = tag.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
	const built = operations.map(buildOperation).sort((a, b) => a.name.localeCompare(b.name));
	total += built.length;

	const typeBlocks = built.flatMap((b) => b.types);
	const needsFile = (typeBlocks.join('\n') + built.map((b) => b.code).join('\n')).includes('FileInput');
	const imports = [`import type { ApiClient } from './client.js';`];
	if (needsFile) imports.push(`import type { FileInput } from '../interfaces/request.js';`);
	if (usedTypes.size) imports.push(`import type {\n${[...usedTypes].sort().map((t) => `\t${t},`).join('\n')}\n} from './schemas.js';`);

	const source = [
		HEADER,
		imports.join('\n'),
		'',
		...typeBlocks.flatMap((t) => [t, '']),
		`/** The "${tag}" group of the ChMS v2 API. */`,
		`export class ${className} {`,
		'\tconstructor(private client: ApiClient) {}',
		'',
		built.map((b) => b.code).join('\n\n'),
		'}',
		'',
	].join('\n');
	writeFileSync(join(out, `${file}.ts`), source);
	index.push({ className, property, file, tag });
	reference.push({ tag, property, operations: built });
}

// Schemas
usedTypes.clear();
const schemaBlocks = Object.entries(spec.components.schemas)
	.sort(([a], [b]) => a.localeCompare(b))
	.map(([name, schema]) => {
		if (!isIdent(name)) throw new Error(`Schema name is not an identifier: ${name}`);
		const doc = propDoc(schema);
		return `${doc ? `/** ${doc} */\n` : ''}export type ${name} = ${toType(schema, '')};`;
	});
const schemaSource = schemaBlocks.join('\n\n');
writeFileSync(
	join(out, 'schemas.ts'),
	[HEADER, schemaSource.includes('FileInput') ? `import type { FileInput } from '../interfaces/request.js';\n` : '', schemaSource, ''].join('\n'),
);

writeFileSync(
	join(out, 'client.ts'),
	[
		HEADER,
		`import type { RequestConfig } from '../interfaces/request.js';`,
		'',
		'/** The transport used by the generated endpoint classes. */',
		'export interface ApiClient {',
		'\tcall<T = any>(config: RequestConfig): Promise<T>;',
		'}',
		'',
	].join('\n'),
);

writeFileSync(
	join(out, 'index.ts'),
	[
		HEADER,
		`import type { ApiClient } from './client.js';`,
		...index.map((g) => `import { ${g.className} } from './${g.file}.js';`),
		'',
		`export * from './client.js';`,
		`export * from './schemas.js';`,
		...index.map((g) => `export * from './${g.file}.js';`),
		'',
		'/** Every endpoint of the ChMS v2 API, grouped as in the API reference. */',
		'export class Api {',
		...index.map((g) => `\tpublic readonly ${g.property}: ${g.className};`),
		'',
		'\tconstructor(client: ApiClient) {',
		...index.map((g) => `\t\tthis.${g.property} = new ${g.className}(client);`),
		'\t}',
		'}',
		'',
	].join('\n'),
);

// Endpoint reference for the docs.
const md = ['# API endpoint reference', '', `Generated from the [ChMS v2 OpenAPI specification](https://docs.pushpay.io/chms-v2/openapi). ${total} endpoints.`, '', 'Every method is available as `ccb.api.<group>.<method>()`. Path parameters come first, then the request body (if any), then query parameters (if any).', ''];
for (const group of reference) {
	md.push(`## ${group.property}`, '', '| Method | Endpoint | Description |', '| --- | --- | --- |');
	for (const o of group.operations) {
		md.push(`| \`${group.property}.${o.name}\` | \`${o.method} ${o.path}\` | ${o.deprecated ? '**Deprecated.** ' : ''}${o.summary.replace(/\|/g, '\\|')} |`);
	}
	md.push('');
}
mkdirSync(join(root, 'docs'), { recursive: true });
writeFileSync(join(root, 'docs/endpoints.md'), md.join('\n'));

console.log(`Generated ${total} operations in ${index.length} groups and ${schemaBlocks.length} schemas.`);
