## Description

Automatic documentation for your REST api server project implemented as an express middleware. Our goal is to generate documentation on tedious stuffs like schema and test case. The actual documentation would still need to be documented in swagger format, so you get its flexibility and community tools.

## Features
1. Automatically document mongoose schema from the given glob.
	- You can also reference them in the yaml file as follow: `#/components/schemas/User`
2. Automatically match your APIs with the corresponding test cases. So, the document viewer can click the link and view the test case files right from the browser.
3. Automatically report on routes without documentations.
4. The actual document server is implemented using `swagger-ui-express` so we get tons of convenient features including:
    1. Call the API right from your browser (similar to Postman)
    2. Filter
    3. Group API together into sections 


## Usage
```js
const express = require("express");
const path = require("path");
const middleware = require("../src/middleware");
const controller = require("./controller");

const app = express();
app.use("/app/controller", controller);

//these are glob syntax
const schemaPath = path.join(__dirname, "schema/*.js");
const specPath = path.join(__dirname, "controller.spec.js");
const swaggerPath = path.join(__dirname, "spec.yaml");
const controllerPath = path.join(__dirname, "controller.js");
app.use(
	"/doc/app",
	middleware(swaggerPath, schemaPath, specPath, controllerPath)
);

app.listen(3000);
```

## Try it out

```sh
git clone
yarn install
yarn start
# go to http://localhost:3000/doc/app
```

## More specifications (more information in the spec folder)

1. All the schema files given must exports Mongoose's `Model` object.
2. All controller file must export the router using `module.exports`.
3. All test case must have the same name as the source code (ignoring the file extension). For example, `user.js` and `user.test.js` is fine
