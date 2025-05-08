# Node CCB library

NodeJS library for accessing the Church Community Builder v2 API

[CCB v2 API Documentation](https://village.ccbchurch.com/documentation)

*This library is currently in an alpha state and should be carefully tested and not actively updated in production. Updates may and likely will introduce breaking changes. This library will be updated as needed for my projects or as time allows. Pull requests are welcome if certain required features are missing.*

## Getting started

### Initialize and Connect

The **connect()** method will return a promise that resolves with `{type:'success'}` on successful connection or `{type:'redirect',data:'URLToRedirectTo'}` if a client authorization code is required. After redirection back to the application, the authorization code can be updated using the **updateAuthorizationCode()** method. If you already have an authorization code, it can also be passed into the connect function directly using the *code* key in the connect parameters object.

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

## Methods

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

### Individual

##### [individual(id: string | number).get(): Promise\<individual\>](https://village.ccbchurch.com/documentation/#/individuals/readIndividual)

Returns a promise that resolves with the data of the individual requested.

```typescript
const individual = await ccb.individual('1').get();
```

##### [individual(id: string | number).updatePhoto(image: string | Readable): Promise\<individual\>](https://village.ccbchurch.com/documentation/#/individuals/updateIndividualPhoto)

Returns a promise that resolves with the data of the individual that was updated.

```typescript
const individual = await ccb.individual('1').updatePhoto('https://path.to/new/image.jpg');
```

### Individual Methods

##### [individual(id: string | number).update(individual: Record<string, any>): Promise\<individual\>](https://village.ccbchurch.com/documentation/#/individuals/updateIndividual)

Updates an individual's information and returns a promise that resolves with the updated individual data.

```typescript
const individual = await ccb.individual('1').update({
    first_name: "Updated",
    last_name: "Name"
});
```

##### [individual(id: string | number).addToGroup(group: string | number): Promise\<response\>](https://village.ccbchurch.com/documentation/#/groups/addGroupMembers)

Adds an individual to a specified group and returns a promise that resolves with the response data.

```typescript
const response = await ccb.individual('1').addToGroup('123');
```

##### [individual(id: string | number).removeFromGroup(group: string | number): Promise\<response\>](https://village.ccbchurch.com/documentation/#/groups/removeGroupMembers)

Removes an individual from a specified group and returns a promise that resolves with the response data.

```typescript
const response = await ccb.individual('1').removeFromGroup('123');
```

##### [individual(id: string | number).addNote(note: string, options?: NoteOptions): Promise\<response\>](https://village.ccbchurch.com/documentation/#/individuals/addIndividualNote)

Adds a note to an individual's profile and returns a promise that resolves with the response data.

```typescript
const response = await ccb.individual('1').addNote('This is a note', {
    context: 'GENERAL',
    sharing_level: 'PRIVATE'
});
```

##### [individual(id: string | number).addToQueue(queue: string | number, options?: QueueOptions): Promise\<response\>](https://village.ccbchurch.com/documentation/#/queues/addQueueIndividual)

Adds an individual to a specified queue and returns a promise that resolves with the response data.

```typescript
const response = await ccb.individual('1').addToQueue('123', {
    status: 'NOT_STARTED'
});
```

### Individuals

##### [individuals.get(params:Record<string, string>): Promise\<individuals\>](https://village.ccbchurch.com/documentation/#/individuals/readIndividuals)

Returns a promise that resolves with a paginated list of the search results or a paginated list of all individuals if no parameters passed.

```typescript
const individual = await ccb.individuals.get({name: 'Partial Name'});
```

##### [individuals.add(individual:Record<string, string>): Promise\<individual\>](https://village.ccbchurch.com/documentation/#/individuals/updateIndividualPhoto)

Returns a promise that resolves with the data of the individual that was created.

```typescript
const individual = await ccb.individuals.add({
	first_name: "Test",
	last_name: "Individual",
});
```

### Family

##### [family(id: string | number).get(): Promise\<family\>](https://village.ccbchurch.com/documentation/#/individuals/readIndividual)

Returns a promise that resolves with the data of the family requested.

```typescript
const family = await ccb.family('1').get();
```

##### [family(id: string | number).addMember(individual:Record<string, string>): Promise\<individual\>](https://village.ccbchurch.com/documentation/#/individuals/updateIndividualPhoto)

Returns a promise that resolves with the data of the individual that was created.

```typescript
const individual = await ccb.family('1').addMember({
	first_name: "Test",
	last_name: "Child",
	family_position: "CHILD"
});
```

### Family Methods

##### [family(id: string | number).updatePhoto(photo: string | Readable): Promise\<family\>](https://village.ccbchurch.com/documentation/#/families/updateFamilyPhoto)

Updates a family's photo and returns a promise that resolves with the updated family data.

```typescript
const family = await ccb.family('1').updatePhoto('https://path.to/new/family/photo.jpg');
```

### Groups

##### [groups.get(params?: Record<string, string | number>): Promise\<groups\>](https://village.ccbchurch.com/documentation/#/groups/readGroups)

Returns a promise that resolves with a paginated list of groups. Optional parameters can be passed to filter the results.

```typescript
const groups = await ccb.groups.get({ name: 'Youth Group' });
```

##### [groups.admin(params?: Record<string, string | number>): Promise\<groups\>](https://village.ccbchurch.com/documentation/#/groups/readAdminGroups)

Returns a promise that resolves with a paginated list of groups where the authenticated user is an administrator. Optional parameters can be passed to filter the results.

```typescript
const adminGroups = await ccb.groups.admin();
```

### Group

##### [group(id: string | number).get(): Promise\<group\>](https://village.ccbchurch.com/documentation/#/groups/readGroup)

Returns a promise that resolves with the data of the group requested.

```typescript
const group = await ccb.group('123').get();
```

##### [group(id: string | number).participants(params?: Record<string, string>): Promise\<participants\>](https://village.ccbchurch.com/documentation/#/groups/readGroupMembers)

Returns a promise that resolves with a paginated list of participants in the group. Optional parameters can be passed to filter the results.

```typescript
const participants = await ccb.group('123').participants({ status: 'active' });
```

### Forms

##### [forms.get(params?: Record<string, string | number>): Promise\<forms\>](https://village.ccbchurch.com/documentation/#/forms/readForms)

Returns a promise that resolves with a paginated list of forms. Optional parameters can be passed to filter the results.

```typescript
const forms = await ccb.forms.get({ type: 'registration' });
```

### Form

##### [form(id: string | number).get(): Promise\<form\>](https://village.ccbchurch.com/documentation/#/forms/readForm)

Returns a promise that resolves with the data of the form requested.

```typescript
const form = await ccb.form('123').get();
```

##### [form(id: string | number).questions(params?: Record<string, string>): Promise\<questions\>](https://village.ccbchurch.com/documentation/#/forms/readFormQuestions)

Returns a promise that resolves with a paginated list of questions in the form. Optional parameters can be passed to filter the results.

```typescript
const questions = await ccb.form('123').questions();
```

##### [form(id: string | number).responses(params?: Record<string, string>): Promise\<responses\>](https://village.ccbchurch.com/documentation/#/forms/readFormResponses)

Returns a promise that resolves with a paginated list of responses to the form. Optional parameters can be passed to filter the results.

```typescript
const responses = await ccb.form('123').responses({ status: 'completed' });
```

### Events

##### [events.get(params?: Record<string, string | number>): Promise\<events\>](https://village.ccbchurch.com/documentation/#/events/readEvents)

Returns a promise that resolves with a paginated list of events. Optional parameters can be passed to filter the results.

```typescript
const events = await ccb.events.get({ start_date: '2024-01-01' });
```

### Church

##### [church.get(params?: Record<string, string | number>): Promise\<church\>](https://village.ccbchurch.com/documentation/#/church/readChurch)

Returns a promise that resolves with the church's information. Optional parameters can be passed to filter the results.

```typescript
const church = await ccb.church.get();
```

##### [church.areasOfTown(params?: Record<string, string | number>): Promise\<areas\>](https://village.ccbchurch.com/documentation/#/church/readAreasOfTown)

Returns a promise that resolves with a list of areas of town associated with the church. Optional parameters can be passed to filter the results.

```typescript
const areas = await ccb.church.areasOfTown();
```

##### [church.schools(params?: Record<string, string | number>): Promise\<schools\>](https://village.ccbchurch.com/documentation/#/church/readSchools)

Returns a promise that resolves with a list of schools associated with the church. Optional parameters can be passed to filter the results.

```typescript
const schools = await ccb.church.schools();
```

##### [church.schoolGrades(params?: Record<string, string | number>): Promise\<grades\>](https://village.ccbchurch.com/documentation/#/church/readSchoolGrades)

Returns a promise that resolves with a list of school grades associated with the church. Optional parameters can be passed to filter the results.

```typescript
const grades = await ccb.church.schoolGrades();
```

##### [church.attendanceGroupings(params?: Record<string, string | number>): Promise\<groupings\>](https://village.ccbchurch.com/documentation/#/church/readAttendanceGroupings)

Returns a promise that resolves with a list of attendance groupings associated with the church. Optional parameters can be passed to filter the results.

```typescript
const groupings = await ccb.church.attendanceGroupings();
```

##### [church.socialNetworks(params?: Record<string, string | number>): Promise\<networks\>](https://village.ccbchurch.com/documentation/#/church/readSocialNetworks)

Returns a promise that resolves with a list of social networks associated with the church. Optional parameters can be passed to filter the results.

```typescript
const networks = await ccb.church.socialNetworks();
```

##### [church.mobileCarriers(params?: Record<string, string | number>): Promise\<carriers\>](https://village.ccbchurch.com/documentation/#/church/readMobileCarriers)

Returns a promise that resolves with a list of mobile carriers associated with the church. Optional parameters can be passed to filter the results.

```typescript
const carriers = await ccb.church.mobileCarriers();
```

##### [church.countries(params?: Record<string, string | number>): Promise\<countries\>](https://village.ccbchurch.com/documentation/#/church/readCountries)

Returns a promise that resolves with a list of countries associated with the church. Optional parameters can be passed to filter the results.

```typescript
const countries = await ccb.church.countries();
```

##### [church.membershipTypes(params?: Record<string, string | number>): Promise\<types\>](https://village.ccbchurch.com/documentation/#/church/readMembershipTypes)

Returns a promise that resolves with a list of membership types associated with the church. Optional parameters can be passed to filter the results.

```typescript
const types = await ccb.church.membershipTypes();
```

##### [church.services(params?: Record<string, string | number>): Promise\<services\>](https://village.ccbchurch.com/documentation/#/church/readServices)

Returns a promise that resolves with a list of services associated with the church. Optional parameters can be passed to filter the results.

```typescript
const services = await ccb.church.services();
```

##### [church.customFields(params?: Record<string, string | number>): Promise\<fields\>](https://village.ccbchurch.com/documentation/#/church/readCustomFields)

Returns a promise that resolves with a list of custom fields associated with the church. Optional parameters can be passed to filter the results.

```typescript
const fields = await ccb.church.customFields();
```

##### [church.reasonsLeft(params?: Record<string, string | number>): Promise\<reasons\>](https://village.ccbchurch.com/documentation/#/church/readReasonsLeft)

Returns a promise that resolves with a list of reasons for leaving associated with the church. Optional parameters can be passed to filter the results.

```typescript
const reasons = await ccb.church.reasonsLeft();
```

##### [church.privacyDefaults(params?: Record<string, string | number>): Promise\<defaults\>](https://village.ccbchurch.com/documentation/#/church/readPrivacyDefaults)

Returns a promise that resolves with the privacy defaults associated with the church. Optional parameters can be passed to filter the results.

```typescript
const defaults = await ccb.church.privacyDefaults();
```

### Search

##### [search(type: string, config?: Record<string, any>).run(filters: SearchConstraint[]): Promise\<results\>](https://village.ccbchurch.com/documentation/#/search/runSearch)

Runs a search with the specified type and filters. Returns a promise that resolves with the search results.

```typescript
const results = await ccb.search('individuals').run([
    Search.filter('equals', 'first_name', 'John')
]);
```

##### [Search.group(operator: 'and' | 'or', constraints: SearchConstraint[], inverted?: boolean): SearchGroup](https://village.ccbchurch.com/documentation/#/search/runSearch)

Creates a search group that can be used to combine multiple search constraints with AND or OR operators.

```typescript
const group = Search.group('and', [
    Search.filter('equals', 'first_name', 'John'),
    Search.filter('equals', 'last_name', 'Doe')
]);
```

##### [Search.filter(operator: ConstraintOperator, field: IndividualConstraintField, value: string, inverted?: boolean): SearchConstraint](https://village.ccbchurch.com/documentation/#/search/runSearch)

Creates a search constraint that can be used to filter search results.

```typescript
const filter = Search.filter('equals', 'first_name', 'John');
```

## Types

#### Config
```javascript
	{
		church: 'village', // CCB subdomain of your church. Required.
		client: '5a69aef2...', // CCB API UID from when you signed up for APIv2 access. Required.
		secret: 'e5c3cc06...', // CCB API Secret from when you signed up for APIv2 access. Required.
		code: 'e9fa51ea...', // Client authorization code received after completion of the first OAuth step. Not required if redirectURI parameter is set.
		redirectURI: 'https://example.net/oauth/redirect/', //Your redirect url provided to CCB when you signed up for APIv2 access. Not required if code parameter is set.
		dataGetter: () => { return data; }, // Function to retrieve auth data from storage. Can return promise that resolves with AuthData or AuthData directly. Required.
		dataSetter: (data) => { storage.write(data) } // Function to save AuthData to storage. Can return a promise for synchronous writes. Required.
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
'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'greater_than_or_equals' | 'less_than_or_equals' | 'is_null' | 'is_not_null' | 'is_empty' | 'is_not_empty' | 'is_true' | 'is_false' | 'in' | 'not_in' | 'between' | 'not_between'
```

#### IndividualConstraintField
```javascript
'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'address' | 'city' | 'state' | 'zip' | 'country' | 'birth_date' | 'anniversary' | 'gender' | 'marital_status' | 'family_position' | 'family_id' | 'family_name' | 'family_address' | 'family_city' | 'family_state' | 'family_zip' | 'family_country' | 'family_phone' | 'family_email' | 'family_website' | 'family_notes' | 'family_created' | 'family_modified' | 'family_created_by' | 'family_modified_by' | 'family_created_by_id' | 'family_modified_by_id' | 'family_created_by_name' | 'family_modified_by_name' | 'family_created_by_email' | 'family_modified_by_email' | 'family_created_by_phone' | 'family_modified_by_phone' | 'family_created_by_address' | 'family_modified_by_address' | 'family_created_by_city' | 'family_modified_by_city' | 'family_created_by_state' | 'family_modified_by_state' | 'family_created_by_zip' | 'family_modified_by_zip' | 'family_created_by_country' | 'family_modified_by_country' | 'family_created_by_birth_date' | 'family_modified_by_birth_date' | 'family_created_by_anniversary' | 'family_modified_by_anniversary' | 'family_created_by_gender' | 'family_modified_by_gender' | 'family_created_by_marital_status' | 'family_modified_by_marital_status' | 'family_created_by_family_position' | 'family_modified_by_family_position'
```
