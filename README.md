# Node CCB library

NodeJS library for accessing the Pushpay ChMS (Church Community Builder) v2 API

[ChMS v2 API Documentation](https://docs.pushpay.io/chms-v2/docs/getting-started) · [Endpoint reference for this library](docs/endpoints.md)

*This library is currently in an alpha state and should be carefully tested and not actively updated in production. Updates may and likely will introduce breaking changes. This library will be updated as needed for my projects or as time allows. Pull requests are welcome if certain required features are missing.*

## Getting started

### Initialize and Connect

The **connect()** method will return a promise that resolves with `{type:'success'}` on successful connection or `{type:'redirect',data:'URLToRedirectTo'}` if the church still needs to authorize the application. After redirection back to the application, pass the `code` query parameter to **updateAuthorizationCode()** (or pass it to **connect()** using the *code* key).

In order to remain deployment agnostic, getting and saving the auth token data is left up to the user through the **dataGetter** and **dataSetter** parameters. In the sample I am using [lowdb](https://github.com/typicode/lowdb) but any simple object store should work.

```typescript
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
} catch(e) {
	console.log(e);
}
```
[Full Sample Code](https://github.com/jrstnly/node-ccb/blob/main/sample/src/index.ts)

### How authentication works

By default the library sends the stored authorization code with `grant_type: 'client_credentials'` every time it needs an access token (tokens last two hours and are renewed automatically). The code is long-lived, so it only has to be obtained once per church. This is the behaviour of every previous version and is verified against the live API.

The [Pushpay documentation](https://docs.pushpay.io/chms-v2/docs/getting-started) describes an authorization code flow with rotating refresh tokens. To use it, pass `grantType: 'authorization_code'` together with the `redirectUri` used during authorization:

1. The code is exchanged once for an access token and a refresh token, then cleared, because it is single-use.
2. Each refresh returns a new pair and revokes the old one. The new pair is written through **dataSetter** before it is used, so **dataSetter** must persist reliably.
3. If the stored code or refresh token is rejected (`invalid_grant`), it is cleared and **connect()** returns a `redirect` so the church can authorize again.

Additional connect options:

| Option | Description |
| --- | --- |
| `scope` | Scopes to request, as a string or array. Defaults to everything granted to the application. |
| `state` | Value echoed back to your redirect URI for CSRF protection. |
| `identityAuth` | Use Identity Auth so that calls act as the signed-in individual. |
| `sandbox` | Use the sandbox servers (`beta-oauth.ccbchurch.com` / `api-beta.ccbchurch.com`). |
| `grantType` | `'client_credentials'` (default) or `'authorization_code'`. See above. |
| `maxRetries` | Retries for rate-limited requests. Defaults to 3. |
| `timeout` | Request timeout in milliseconds. Defaults to 60000. |

## Full API coverage

Every endpoint in the ChMS v2 OpenAPI specification is available under `ccb.api`, grouped as in the API reference and named after the operation ids used there. Parameters, request bodies and responses are fully typed. See [docs/endpoints.md](docs/endpoints.md) for the complete list.

```typescript
const me = await ccb.api.session.getMe();
const individual = await ccb.api.individuals.getIndividual(1);
const results = await ccb.api.individuals.getIndividuals({ name: 'Smith', per_page: 100 });
await ccb.api.individuals.updateIndividual(1, { first_name: 'Updated' });
await ccb.api.groups.addGroupMembers(123, { individual_ids: [1, 2] });
await ccb.api.files.uploadIndividualFile(1, { file: { data: buffer, filename: 'form.pdf' }, label: 'Signed form' });
```

Arguments are always in the order: path parameters, request body (if the endpoint takes one), query parameters (if the endpoint takes any).

Groups: `campuses`, `church`, `departments`, `events`, `families`, `files`, `forms`, `groups`, `individuals`, `integrations`, `needs`, `notes`, `processQueues`, `sacraments`, `savedSearches`, `scheduling`, `search`, `session`, `settings`, `templates`, `workflows`.

`session.getMe()` returns 401 for a church-level token, since no individual is signed in. It needs a token obtained with `identityAuth`.

### Array filters

Pass array filters as plain arrays. They are sent in the bracket form the API requires (`statuses[]=WAITING&statuses[]=IN_PROCESS`); the same parameter as a plain repeated key is rejected with a 412.

```typescript
const waiting = await ccb.api.processQueues.getStepIndividuals({ queue_ids: [320], statuses: ['WAITING'] });
```

The API silently ignores filter names it does not recognise and returns the unfiltered list, so a misspelled filter does not raise an error.

### File uploads

Endpoints that take a file accept a `Buffer`, a readable stream, or an object with `data`, `filename` and `contentType`. Other form fields are passed alongside it.

```typescript
await ccb.api.individuals.updateIndividualPhoto(1, { photo: { data: buffer, filename: 'photo.jpg', contentType: 'image/jpeg' } });
await ccb.api.files.uploadIndividualFile(1, { file: createReadStream('form.pdf'), label: 'Signed form' });
```

Requests with a file are not retried, because a stream cannot be replayed.

### Pagination

List endpoints take `page` and `per_page` (25, 50, 75 or 100). **paginate()** walks every page for you:

```typescript
for await (const group of ccb.paginate((page) => ccb.api.groups.getGroups(page), { per_page: 100 })) {
	console.log(group.name);
}
```

The callback receives the `page` and `per_page` to request. Add your own filters alongside them:

```typescript
ccb.paginate((page) => ccb.api.individuals.getIndividuals({ name: 'Smith', ...page }));
```

To read the pagination headers yourself, use **request()**, which returns the body together with `pagination` (`page`, `perPage`, `totalPages`, ...) and `rateLimit`:

```typescript
const { data, pagination, rateLimit } = await ccb.request({ path: '/individuals', query: { page: 2 } });
```

### Rate limits

The API allows a sustained 1 request per second per endpoint with a burst of 60 (some endpoints are stricter). Requests that receive a 429 are retried automatically after the `retry-after` delay, up to `maxRetries` times. The docs warn that excessive 429s are monitored, so throttle bulk jobs rather than relying on retries.

### Errors

Calls through `ccb.api` and `ccb.request` reject with a `CCBError` carrying `status`, the parsed `body`, and `retryAfter` (for 429s). Token failures reject with a `CCBAuthError`, which also has the OAuth error `code`.

```typescript
try {
	await ccb.api.individuals.getIndividual(999999);
} catch (e) {
	if (e instanceof CCBError && e.status === 404) { /* not found */ }
}
```

### Updating to a new API version

The endpoint classes in `src/generated` are generated from `openapi/chms-api-specs.json`. To pull the latest specification and regenerate:

```bash
npm run generate:fetch
```

Where the live API accepts something the published specification leaves out, add it to `openapi/overrides.json` and run `npm run generate`. It currently adds the `queue_ids` filter to `processQueues.getStepIndividuals`.

## Testing

```bash
npm test
```

Builds the library and runs the unit tests against a local stand-in for the API. No credentials or network access are needed.

```bash
npm run test:live
```

Runs a read-only smoke test against the real API. It only makes GET requests and prints counts and field names, not record contents. Copy `.env-sample` to `.env` and fill in `CCB_CHURCH`, `CCB_CLIENT`, `CCB_SECRET` and `CCB_CODE` first. Tokens are cached in `db.json`; both files are gitignored.

## Convenience methods

These hand-written helpers predate `ccb.api` and remain available.

### Initialization
##### connect(options: Config): Promise\<Response\>

Attempts to connect to the CCB API and returns a promise that resolves with `{type:'success'}` on successful connection or `{type:'redirect',data:'URLToRedirectTo'}` if a client authorization code is required.

```typescript
const connection = await ccb.connect({
	church:process.env.CCB_CHURCH || '',
	client:process.env.CCB_CLIENT || '',
	secret:process.env.CCB_SECRET || '',
	redirectUri: process.env.CCB_REDIRECT_URI || '',
	dataGetter:dataGetter,
	dataSetter:dataSetter
});
```

### Authorization

##### updateAuthorizationCode(code: string): Response

Updates and saves the client authorization code into the library and database for generating auth tokens.

```typescript
ccb.updateAuthorizationCode(process.env.CCB_CODE || '');
```

##### authorizationUrl: string

The URL to send a church administrator to in order to authorize the application. This is the same URL that **connect()** returns in a `redirect` response.

```typescript
res.redirect(ccb.authorizationUrl);
```

### Individual

##### [individual(id: string | number).get(): Promise\<individual\>](https://docs.pushpay.io/chms-v2/reference/getindividual)

Returns a promise that resolves with the data of the individual requested.

```typescript
const individual = await ccb.individual('1').get();
```

##### [individual(id: string | number).updatePhoto(image: string | Readable): Promise\<individual\>](https://docs.pushpay.io/chms-v2/reference/updateindividualphoto)

Returns a promise that resolves with the data of the individual that was updated.

```typescript
const individual = await ccb.individual('1').updatePhoto('https://path.to/new/image.jpg');
```

### Individual Methods

##### [individual(id: string | number).update(individual: Record<string, any>): Promise\<individual\>](https://docs.pushpay.io/chms-v2/reference/updateindividual)

Updates an individual's information and returns a promise that resolves with the updated individual data.

```typescript
const individual = await ccb.individual('1').update({
    first_name: "Updated",
    last_name: "Name"
});
```

##### [individual(id: string | number).addToGroup(group: string | number): Promise\<response\>](https://docs.pushpay.io/chms-v2/reference/addgroupmembers)

Adds an individual to a specified group and returns a promise that resolves with the response data.

```typescript
const response = await ccb.individual('1').addToGroup('123');
```

##### [individual(id: string | number).removeFromGroup(group: string | number): Promise\<response\>](https://docs.pushpay.io/chms-v2/reference/deletegroupmembers)

Removes an individual from a specified group and returns a promise that resolves with the response data.

```typescript
const response = await ccb.individual('1').removeFromGroup('123');
```

##### [individual(id: string | number).addNote(note: string, options?: NoteOptions): Promise\<response\>](https://docs.pushpay.io/chms-v2/reference/createindividualnote)

Adds a note to an individual's profile and returns a promise that resolves with the response data.

```typescript
const response = await ccb.individual('1').addNote('This is a note', {
    context: 'GENERAL',
    sharing_level: 'PRIVATE'
});
```

##### [individual(id: string | number).addToQueue(queue: string | number, options?: QueueOptions): Promise\<response\>](https://docs.pushpay.io/chms-v2/reference/addqueueindividual)

Adds an individual to a specified queue and returns a promise that resolves with the response data.

```typescript
const response = await ccb.individual('1').addToQueue('123', {
    status: 'NOT_STARTED'
});
```

### Individuals

##### [individuals.get(params:Record<string, string>): Promise\<individuals\>](https://docs.pushpay.io/chms-v2/reference/getindividuals)

Returns a promise that resolves with a paginated list of the search results or a paginated list of all individuals if no parameters passed.

```typescript
const individual = await ccb.individuals.get({name: 'Partial Name'});
```

##### [individuals.add(individual:Record<string, string>): Promise\<individual\>](https://docs.pushpay.io/chms-v2/reference/createfamily)

Returns a promise that resolves with the data of the individual that was created.

```typescript
const individual = await ccb.individuals.add({
	first_name: "Test",
	last_name: "Individual",
});
```

### Family

##### [family(id: string | number).get(): Promise\<family\>](https://docs.pushpay.io/chms-v2/reference/getfamily)

Returns a promise that resolves with the data of the family requested.

```typescript
const family = await ccb.family('1').get();
```

##### [family(id: string | number).addMember(individual:Record<string, string>): Promise\<individual\>](https://docs.pushpay.io/chms-v2/reference/createindividual)

Returns a promise that resolves with the data of the individual that was created.

```typescript
const individual = await ccb.family('1').addMember({
	first_name: "Test",
	last_name: "Child",
	family_position: "CHILD"
});
```

### Family Methods

##### [family(id: string | number).updatePhoto(photo: string | Readable): Promise\<family\>](https://docs.pushpay.io/chms-v2/reference/updatefamilyphoto)

Updates a family's photo and returns a promise that resolves with the updated family data.

```typescript
const family = await ccb.family('1').updatePhoto('https://path.to/new/family/photo.jpg');
```

### Groups

##### [groups.get(params?: Record<string, string | number>): Promise\<groups\>](https://docs.pushpay.io/chms-v2/reference/getgroups)

Returns a promise that resolves with a paginated list of groups. Optional parameters can be passed to filter the results.

```typescript
const groups = await ccb.groups.get({ name: 'Youth Group' });
```

##### [groups.admin(params?: Record<string, string | number>): Promise\<groups\>](https://docs.pushpay.io/chms-v2/reference/getgroupsadmin)

Returns a promise that resolves with a paginated list of groups where the authenticated user is an administrator. Optional parameters can be passed to filter the results.

```typescript
const adminGroups = await ccb.groups.admin();
```

### Group

##### [group(id: string | number).get(): Promise\<group\>](https://docs.pushpay.io/chms-v2/reference/getgroup)

Returns a promise that resolves with the data of the group requested.

```typescript
const group = await ccb.group('123').get();
```

##### [group(id: string | number).participants(params?: Record<string, string>): Promise\<participants\>](https://docs.pushpay.io/chms-v2/reference/getgroupmembers)

Returns a promise that resolves with a paginated list of participants in the group. Optional parameters can be passed to filter the results.

```typescript
const participants = await ccb.group('123').participants({ status: 'active' });
```

### Forms

##### [forms.get(params?: Record<string, string | number>): Promise\<forms\>](https://docs.pushpay.io/chms-v2/reference/getforms)

Returns a promise that resolves with a paginated list of forms. Optional parameters can be passed to filter the results.

```typescript
const forms = await ccb.forms.get({ type: 'registration' });
```

### Form

##### [form(id: string | number).get(): Promise\<form\>](https://docs.pushpay.io/chms-v2/reference/getform)

Returns a promise that resolves with the data of the form requested.

```typescript
const form = await ccb.form('123').get();
```

##### [form(id: string | number).questions(params?: Record<string, string>): Promise\<questions\>](https://docs.pushpay.io/chms-v2/reference/getformquestions)

Returns a promise that resolves with a paginated list of questions in the form. Optional parameters can be passed to filter the results.

```typescript
const questions = await ccb.form('123').questions();
```

##### [form(id: string | number).responses(params?: Record<string, string>): Promise\<responses\>](https://docs.pushpay.io/chms-v2/reference/getformresponses)

Returns a promise that resolves with a paginated list of responses to the form. Optional parameters can be passed to filter the results.

```typescript
const responses = await ccb.form('123').responses({ status: 'completed' });
```

### Events

##### [events.get(params?: Record<string, string | number>): Promise\<events\>](https://docs.pushpay.io/chms-v2/reference/getevents)

Returns a promise that resolves with a paginated list of events. Optional parameters can be passed to filter the results.

```typescript
const events = await ccb.events.get({ start_date: '2024-01-01' });
```

### Church

##### [church.get(params?: Record<string, string | number>): Promise\<church\>](https://docs.pushpay.io/chms-v2/reference/getchurch)

Returns a promise that resolves with the church's information. Optional parameters can be passed to filter the results.

```typescript
const church = await ccb.church.get();
```

##### [church.areasOfTown(params?: Record<string, string | number>): Promise\<areas\>](https://docs.pushpay.io/chms-v2/reference/getareasoftown)

Returns a promise that resolves with a list of areas of town associated with the church. Optional parameters can be passed to filter the results.

```typescript
const areas = await ccb.church.areasOfTown();
```

##### [church.schools(params?: Record<string, string | number>): Promise\<schools\>](https://docs.pushpay.io/chms-v2/reference/getschools)

Returns a promise that resolves with a list of schools associated with the church. Optional parameters can be passed to filter the results.

```typescript
const schools = await ccb.church.schools();
```

##### [church.schoolGrades(params?: Record<string, string | number>): Promise\<grades\>](https://docs.pushpay.io/chms-v2/reference/getschoolgrades)

Returns a promise that resolves with a list of school grades associated with the church. Optional parameters can be passed to filter the results.

```typescript
const grades = await ccb.church.schoolGrades();
```

##### [church.attendanceGroupings(params?: Record<string, string | number>): Promise\<groupings\>](https://docs.pushpay.io/chms-v2/reference/getattendancegroupings)

Returns a promise that resolves with a list of attendance groupings associated with the church. Optional parameters can be passed to filter the results.

```typescript
const groupings = await ccb.church.attendanceGroupings();
```

##### [church.socialNetworks(params?: Record<string, string | number>): Promise\<networks\>](https://docs.pushpay.io/chms-v2/reference/getsocialnetworks)

Returns a promise that resolves with a list of social networks associated with the church. Optional parameters can be passed to filter the results.

```typescript
const networks = await ccb.church.socialNetworks();
```

##### [church.mobileCarriers(params?: Record<string, string | number>): Promise\<carriers\>](https://docs.pushpay.io/chms-v2/reference/getmobilecarriers)

Returns a promise that resolves with a list of mobile carriers associated with the church. Optional parameters can be passed to filter the results.

```typescript
const carriers = await ccb.church.mobileCarriers();
```

##### [church.countries(params?: Record<string, string | number>): Promise\<countries\>](https://docs.pushpay.io/chms-v2/reference/getcountries)

Returns a promise that resolves with a list of countries associated with the church. Optional parameters can be passed to filter the results.

```typescript
const countries = await ccb.church.countries();
```

##### [church.membershipTypes(params?: Record<string, string | number>): Promise\<types\>](https://docs.pushpay.io/chms-v2/reference/getmembershiptypes)

Returns a promise that resolves with a list of membership types associated with the church. Optional parameters can be passed to filter the results.

```typescript
const types = await ccb.church.membershipTypes();
```

##### [church.services(params?: Record<string, string | number>): Promise\<services\>](https://docs.pushpay.io/chms-v2/reference/getservices)

Returns a promise that resolves with a list of services associated with the church. Optional parameters can be passed to filter the results.

```typescript
const services = await ccb.church.services();
```

##### [church.customFields(params?: Record<string, string | number>): Promise\<fields\>](https://docs.pushpay.io/chms-v2/reference/getcustomfields)

Returns a promise that resolves with a list of custom fields associated with the church. Optional parameters can be passed to filter the results.

```typescript
const fields = await ccb.church.customFields();
```

##### [church.reasonsLeft(params?: Record<string, string | number>): Promise\<reasons\>](https://docs.pushpay.io/chms-v2/reference/getreasonsleft)

Returns a promise that resolves with a list of reasons for leaving associated with the church. Optional parameters can be passed to filter the results.

```typescript
const reasons = await ccb.church.reasonsLeft();
```

##### [church.privacyDefaults(params?: Record<string, string | number>): Promise\<defaults\>](https://docs.pushpay.io/chms-v2/reference/getprivacydefaults)

Returns a promise that resolves with the privacy defaults associated with the church. Optional parameters can be passed to filter the results.

```typescript
const defaults = await ccb.church.privacyDefaults();
```

### Search

##### [search(type: string, config?: Record<string, any>).run(filters: SearchConstraint | SearchGroup): Promise\<results\>](https://docs.pushpay.io/chms-v2/reference/getindividualadvancedsearchresults)

Runs a search with the specified type and filters. Returns a promise that resolves with the search results.

`filters` is a single constraint or a single group. To combine several constraints, wrap them in `Search.group(...)`; the API rejects a bare array with a 412.

The optional `config` is merged over these defaults, so pass only what you want to change:

```javascript
{
    columns: [],
    order_by: [{ column: 'last_name', direction: 'asc' }],
    filter_profile_type: ['active'],
    include_unlisted: true,
    include_lau: true,
    include_pending: true,
    return_search_results: true,
    return_family_positions: [],
}
```

```typescript
const everyone = await ccb.search('individuals', { filter_profile_type: ['active', 'inactive'] }).run(filters);
```

```typescript
const results = await ccb.search('individuals').run(Search.filter('equal', 'first_name', 'John'));

const both = await ccb.search('individuals').run(
    Search.group('and', [
        Search.filter('equal', 'first_name', 'John'),
        Search.filter('equal', 'last_name', 'Doe')
    ])
);
```

##### [Search.group(operator: 'and' | 'or', constraints: SearchConstraint[], inverted?: boolean): SearchGroup](https://docs.pushpay.io/chms-v2/reference/getindividualadvancedsearchresults)

Creates a search group that can be used to combine multiple search constraints with AND or OR operators.

```typescript
const group = Search.group('and', [
    Search.filter('equal', 'first_name', 'John'),
    Search.filter('equal', 'last_name', 'Doe')
]);
```

##### [Search.filter(operator: ConstraintOperator, field: IndividualConstraintField, value: string, inverted?: boolean): SearchConstraint](https://docs.pushpay.io/chms-v2/reference/getindividualadvancedsearchresults)

Creates a search constraint that can be used to filter search results.

The `inverted` argument is sent to the API, but the live API currently ignores it on both constraints and groups. To exclude matches, use a negated operator instead (`not_equal`, `does_not_contain`, `not_like`, `not_in`, ...).

```typescript
const filter = Search.filter('equal', 'first_name', 'John');
```

## Types

#### Config
```javascript
	{
		church: 'village', // CCB subdomain of your church. Required.
		client: '5a69aef2...', // CCB API UID from when you signed up for APIv2 access. Required.
		secret: 'e5c3cc06...', // CCB API Secret from when you signed up for APIv2 access. Required.
		code: 'e9fa51ea...', // Client authorization code. Not required if the redirectUri parameter is set.
		redirectUri: 'https://example.net/oauth/redirect/', // Your redirect url provided to CCB when you signed up for APIv2 access. Not required if the code parameter is set.
		grantType: 'client_credentials', // 'client_credentials' (default) or 'authorization_code'. Optional.
		scope: ['read:individuals'], // Scopes to request during authorization, as a string or array. Optional.
		state: 'abc123', // Value echoed back to your redirect URI. Optional.
		identityAuth: false, // Authorize as the signed-in individual. Optional.
		sandbox: false, // Use the sandbox servers. Optional.
		maxRetries: 3, // Retries for rate-limited requests. Optional.
		timeout: 60000, // Request timeout in milliseconds. Optional.
		dataGetter: () => { return data; }, // Function to retrieve auth data from storage. Can return promise that resolves with AuthData or AuthData directly. Required.
		dataSetter: (data) => { storage.write(data) } // Function to save AuthData to storage. Can return a promise for synchronous writes. Required.
	}
```

#### AuthData
```javascript
	{
		code: 'e9fa51ea...', // Authorization code, or null.
		accessToken: '...', // Current access token, or null.
		refreshToken: '...', // Refresh token (authorization_code grant only), or null.
		tokenExpiration: '2026-01-01T12:00:00.000Z', // ISO timestamp after which the access token is renewed, or null.
	}
```

#### CCBError
```javascript
	{
		name: 'CCBError', // 'CCBAuthError' for token failures.
		message: 'Not found.',
		status: 404, // HTTP status, when the server responded.
		body: {}, // Parsed response body, when the server responded.
		retryAfter: 5, // Seconds to wait, on a 429.
		code: 'invalid_grant', // OAuth error code. CCBAuthError only.
	}
```

#### Response
```javascript
	{
		type: 'success', // Can be 'success', 'error', or 'redirect'.
		data: {}, // Response data from function. Can be any data type.
		msg: 'An error occurred.', // Optional message included in response. Usually only set when type is 'error'.
	}
```

#### SearchGroup
```javascript
{
    type: 'group', // Type of the search object
    operator: 'and' | 'or', // Operator to combine constraints
    inverted: boolean, // Whether the group should be inverted
    conditions: SearchConstraint[] // Array of search constraints
}
```

#### SearchConstraint
```javascript
{
    type: 'constraint', // Type of the search object
    id: IndividualConstraintField, // Field to search on
    operator: ConstraintOperator, // Operator to use for comparison
    value: string, // Value to compare against
    inverted: boolean // Whether the constraint should be inverted
}
```

#### ConstraintOperator
```javascript
'between' | 'contains' | 'contains_like' | 'does_not_contain' | 'ends_with' | 'equal' | 'greater_than' | 'greater_than_or_equal' | 'in' | 'in_the_current' | 'in_the_last' | 'in_the_next' | 'in_the_previous' | 'in_the_upcoming' | 'is_not_set' | 'is_set' | 'less_than' | 'less_than_or_equal' | 'like' | 'not_between' | 'not_equal' | 'not_in' | 'not_in_the_current' | 'not_in_the_last' | 'not_in_the_next' | 'not_in_the_previous' | 'not_in_the_upcoming' | 'not_like' | 'starts_with' | 'word_boundary'
```

Which operators apply depends on the field type. The date and number operators (`between`, `greater_than`, `in_the_last`, ...) come from the published specification; the text operators were checked against the live API.

#### IndividualConstraintField
```javascript
'ability' | 'age' | 'allergies' | 'anniversary' | 'anniversary_date_parts' | 'anniversary_month' | 'area' | 'attendance_attendance_grouping' | 'attendance_department' | 'attendance_single_event' | 'barcode' | 'birth_date' | 'birth_date_parts' | 'birth_month' | 'campus' | 'child_work_approved_start_date' | 'child_work_approved_start_month' | 'child_work_approved_stop_date' | 'child_work_approved_stop_month' | 'church_service' | 'commitment_date' | 'commitment_story' | 'contact_phone_number' | 'creator_first_name' | 'creator_last_name' | 'current_story' | 'date_created' | 'date_created_month' | 'date_created_parts' | 'date_deceased' | 'date_deceased_month' | 'date_deceased_parts' | 'date_modified' | 'date_modified_month' | 'date_modified_parts' | 'discussion_posts' | 'email' | 'emergency_contact_number' | 'emergency_contact_phone_number' | 'event' | 'event_legacy' | 'family_child' | 'family_head' | 'family_id' | 'family_other' | 'family_photo' | 'family_position' | 'family_spouse' | 'fax_phone_number' | 'first_name' | 'form_question_answer' | 'gender' | 'giving_number' | 'group' | 'group_department' | 'group_name' | 'group_relationship' | 'group_search' | 'group_type' | 'group_udf_pulldown_1' | 'group_udf_pulldown_2' | 'group_udf_pulldown_3' | 'home_city' | 'home_country' | 'home_state' | 'home_street' | 'home_zip' | 'how_joined_church' | 'how_they_heard' | 'individual_id' | 'is_baptized' | 'is_confirmed_no_allergies' | 'is_home_listed' | 'is_inactive' | 'is_limited_access_user' | 'is_listed' | 'is_other_listed' | 'is_work_listed' | 'last_attended_date' | 'last_giving_date' | 'last_login_date' | 'last_login_date_parts' | 'last_name' | 'last_need_assigned_date' | 'legal_name' | 'login' | 'mailing_carrier_route' | 'mailing_city' | 'mailing_country' | 'mailing_state' | 'mailing_street' | 'mailing_zip' | 'marital_status' | 'membership_month' | 'membership_start_date' | 'membership_stop_date' | 'membership_type' | 'middle_name' | 'military' | 'mobile_carrier' | 'mobile_phone_number' | 'modifier_first_name' | 'modifier_last_name' | 'name' | 'new_giver' | 'other_city' | 'other_country' | 'other_id' | 'other_state' | 'other_street' | 'other_zip' | 'pager_phone_number' | 'passion' | 'personality_style' | 'photo' | 'pledge' | 'position' | 'process_queue' | 'process_queue_date' | 'reason_left_church' | 'school' | 'school_grade' | 'significant_event' | 'spiritual_gift' | 'spiritual_maturity' | 'sync_id' | 'transaction_amount' | 'udf_date_1' | 'udf_date_2' | 'udf_date_3' | 'udf_date_4' | 'udf_date_5' | 'udf_date_6' | 'udf_pulldown_1' | 'udf_pulldown_2' | 'udf_pulldown_3' | 'udf_pulldown_4' | 'udf_pulldown_5' | 'udf_pulldown_6' | 'udf_text_1' | 'udf_text_10' | 'udf_text_11' | 'udf_text_12' | 'udf_text_2' | 'udf_text_3' | 'udf_text_4' | 'udf_text_5' | 'udf_text_6' | 'udf_text_7' | 'udf_text_8' | 'udf_text_9' | 'work_city' | 'work_country' | 'work_state' | 'work_street' | 'work_zip'
```
