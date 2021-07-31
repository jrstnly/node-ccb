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
