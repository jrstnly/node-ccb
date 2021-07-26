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

### Authorization

##### updateAuthorizationCode(code: string)

Updates and saves the client authorization code into the library and database for generating auth tokens.

```typescript
ccb.updateAuthorizationCode(process.env.CCB_CODE || '');
```

### Individuals

##### [individuals.get(id: string | number)](https://village.ccbchurch.com/documentation/#/individuals/readIndividual)

Returns a promise that resolves with the data of the individual requested.

```typescript
const individual = await ccb.individuals.get('1');
```
