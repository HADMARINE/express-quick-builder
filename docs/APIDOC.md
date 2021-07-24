# API Documentation

## Express-Quick-Builder

### TOC

To be updated

## Setup

### 1. Initialising ServerStarter

Import the ServerStarter from the library and execute it.
Parameter information is provided below.

#### Usage

```typescript
// index.ts (or something else)
import { ServerStarter } from 'express-quick-builder';

...

const parameters = {
   ...
}

const returnValue = ServerStarter(parameters)
...

```

port: <number> // The port that you want to make server to listen. OPTIONAL, Default is 4000
portStrict: <boolean> //

#### Parameters

|          key          |                                       type                                       | description                                                                                                                                                                             | etc                                                                       |
| :-------------------: | :------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
|         port          |                                      number                                      | The port that you want to make server to listen.                                                                                                                                        | optional<br>default : 4000                                                |
|      portStrict       |                                     boolean                                      | Set true if you want to use just only the port you stated. <br>Details: ServerStarter has auto port binding function. It finds another port if the port you entered is using currently. | optional<br>default : false                                               |
|          app          |                                 express.Express                                  | Provide custom Express app if you want to                                                                                                                                               | optional<br>default : undefined                                           |
|    requestHandlers    | <code>(express.RequestHandler \| [string, ...express.RequestHandler[]])[]</code> | RequestHandler Array. Provide some request handlers like morgan, helmet, etc...<br> If you want to mount handler to certain endpoint, provide like [string, RequestHandler] to Array.   | optional<br>default : null                                                |
|       routePath       |                                      string                                      | Resolving path of auto router.<br> **Notice!** the router path may differ by environment or whether code was built or not. Please check the router file root before you deploy.         | optional<br>default : /src/routes                                         |
|  customErrorHandler   |                              express.RequestHandler                              | If you are not satisfied with the built-in error handler, write your own error handler and provide it.                                                                                  | optional<br>default : Built-in Error handler                              |
| customNotFoundHandler |                              express.RequestHandler                              | If you are not satisfied with the built-in 404 Not Found handler, write your own error handler and provide it.                                                                          | optional<br>default : Built-in Not Found handler                          |
|        appName        |                                      string                                      | The app name displays on the console when starts.                                                                                                                                       | optional<br>default : EXPRESS API SERVER powered by express-quick-builder |

#### Return Value

|  key   |      type       | description                             | etc |
| :----: | :-------------: | :-------------------------------------- | :-- |
|  port  |     number      | The actual port that the server listens |     |
| server |   http.Server   | HTTP Server Instance                    |     |
|  app   | express.Express | Express Instance                        |     |

### 2. Initialising Controller

It's simple.

1. Create xxx.controller.ts (ends with .js if you are using javascript)

   - **You must locate the file below the auto routing directory.** (default : src/routes/)
   - Use folder/file combination to locate your endpoint.
     XXX.controller.ts routes to <code>\<fileroot>/XXX</code>. index.controller.ts will route to the file root.
     - Example 1: src/routes/test/index.controller.ts -> \<server-location>/test
     - Example 2: src/routes/test/hello/world/foo/bar.controller.ts -> \<server-location>/test/hello/world/foo/bar

2. Create default class and decorate with @Controller decorator

   ```typescript
   import { Controller } from 'express-quick-builder';

   @Controller
   export default class TestClass {
       ...
   }
   ```

3. Create Member function and decorate.

   ```typescript
   import { Controller, GetMapping, ErrorBuilder, DataTypes } from 'express-quick-builder';

   @Controller
   export default class TestClass {
       @GetMapping(<routePath>)
       async getTime(req:WrappedRequest): Promise<Date> {

           const { value } = req.verify.query({
               value: DataTypes.string
           })

           const result: boolean = await AwaitFunction();
           if (!result) {
               throw ErrorBuilder('This is error message', 400, "THIS_IS_ERROR_CODE"); // Will return error automatically to client.
           }
       }
   }
   ```

# Decorators

> #### Note: Decorator name rule
>
> If decorator name starts with "Set" (like : SetMiddleware) or MappingFunctions (GetMapping, PostMapping, etc...), the decorator is wrapped with parameter providing closure.
> Use like <code>@SetMiddleware(Middleware)</code>
> Else not, Just use like <code>@Controller</code>

### Mapping functions

> Mapping functions has 2 parameters, both are not required.
> <code>GetMapping(dir, ...middlewares)</code>
> |parameter|type|default|behaviour|
> |:-:|:-:|:-|:-|
> |dir|<code>string \| RegExp \| (string\|RegExp)[]</code>|/|set dirs of endpoint.|
> |middleware|<code>RequestHandler[]</code>|undefined|Sets middleware of endpoint|
>
> Usage, all of below are allowed.
>
> 1. @GetMapping() : GET / , no middleware
> 2. @GetMapping('/hello') : GET /hello, no middleware
> 3. @GetMapping('hello') : GET /hello, no middleware
> 4. @GetMapping(undefined, SuchMiddleware) : GET /, Middlewares : SuchMiddlware
> 5. @GetMapping('hello', M1, M2, M3) : GET /hello, Middlewares : M1, M2, M3

- GetMapping
- PostMapping
- PatchMapping
- DeleteMapping
- PutMapping
- HeadMapping
- AllMapping : routes all method to this endpoint

### Endpoint Decorators

- SetMiddleware(...middleware) : Sets middleware
- UseCustomHandler : Use raw express handler
- SetSuccessMessage(message: string) : Sets message when success
- SetSuccessCode(code: string) : Set code when success
- SetSuccessStatus(status: number) : Set HTTP Status code when success
- DeprecatedSoon : Return message that notifies it will be deprecated.
- SetDeprecated : Send deprecated error (CODE : API_DEPRECATED), and abort execution before it executes.
- NoErrorOnNull : Do not send error when null returned
- ReturnRawData : Return raw data instead of returning JSON value.
- SetEndpointProperties(properties) : Set endpoint properties (properties below)

> Property parameter of SetEndpointProperties
>
> method: METHODS;<br>
> useCustomHandler: boolean;<br>
> returnRawData: boolean;<br>
> path: string | RegExp | (string | RegExp)[];<br>
> successMessage: string;<br>
> successCode: string;<br>
> successStatus: keyof typeof codeData;<br>
> noErrorOnNull: boolean;<br>
> errorBeforeExecution: Error;

### Class Decorators

- Controller : Set class to controller

# Request Data Verifier

## Usage

<code>const { value } = req.verify.query({ value: DataTypes.string })</code>

```typescript
  import { Controller, GetMapping, ErrorBuilder, DataTypes } from 'express-quick-builder';

  @Controller
  export default class TestClass {
      @GetMapping(<routePath>)
      async getTime(req:WrappedRequest): Promise<Date> {

          // HERE!
          const { value } = req.verify.query({
              value: DataTypes.string
          })

          const result: boolean = await AwaitFunction();
          if (!result) {
              throw ErrorBuilder('This is error message', 400, "THIS_IS_ERROR_CODE"); // Will return error automatically to client.
          }
      }
  }
```

## DataTypes

> #### Error return conditions
>
> - If data is null but the data type does not allow nully value, throws parameterNull error.<br>error code: PARAMETER_NOT_PROVIDED
> - If data is invalid, throws parameterInvalid error.<br>error code: PARAMETER_INVALID
>
> You can access those codes by : error.code

|     name     | behaviour                                                                                                                                                                                                                          |
| :----------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    object    | Verify object                                                                                                                                                                                                                      |
|  objectNull  | Verify object, null allowed                                                                                                                                                                                                        |
|    number    | Verify number, Accept string passes isNaN (stringified number is allowed)                                                                                                                                                          |
|  numberNull  | Works same as number, null allowed                                                                                                                                                                                                 |
|     date     | Verify if it is string, and parses to Date object on return. If parse fail, throws parameterInvalid error                                                                                                                          |
|   dateNull   | Works same as date, with null allowed                                                                                                                                                                                              |
|   notnull    | Verify if it is not nully value. (undefined or null)                                                                                                                                                                               |
|     any      | Allows any data                                                                                                                                                                                                                    |
|   function   | No use.                                                                                                                                                                                                                            |
| functionNull | No use.                                                                                                                                                                                                                            |
|    string    | Verify string                                                                                                                                                                                                                      |
|  stringNull  | Verify string, null allowed                                                                                                                                                                                                        |
|    array     | **NOTE: Generic wrapped.**<br>Use like : <code>DataTypes.array\<string>()</code><br> Verify array, Accept string with comma-divided (like: '1,2,3,4,5' -> [1,2,3,4,5]), but not recommended due to the failure of data integritity |
|  arrayNull   | Works same as array, null allowed                                                                                                                                                                                                  |
|   boolean    | Verify boolean, try parse string value to bool ("true" or "false")                                                                                                                                                                 |
| booleanNull  | Works same as boolean, null allowed                                                                                                                                                                                                |

#### Additional

If you want to verify certain data, create [TypeGuard (TS Handbook)](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) function and apply it.

# Questions

Send your questions to Issue tab, or directly to my email: [contact@hadmarine.com](mailto:contact@hadmarine.com), or [Telegram](https://t.me/hadmarine)
