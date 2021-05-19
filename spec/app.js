require('express-async-errors');

const express = require('express');
const path = require('path');
const middleware = require('../src/middleware');
const controller = require('./controller');
const bodyParser = require('body-parser');
const { connectDB } = require('./utils/db');
const errorHandler = require('./utils/error_handler');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

connectDB();

const app = express();
app.use(bodyParser.json());
app.use('/app', controller);

app.use(errorHandler);

const schemaPath = path.join(__dirname, 'schema/*.js');
const specPath = path.join(__dirname, 'controller.spec.js');
const swaggerPath = path.join(__dirname, 'spec.yaml');
const controllerPath = path.join(__dirname, 'controller.js');
app.use(
  '/doc/app',
  middleware(swaggerPath, schemaPath, specPath, controllerPath)
);

app.listen(3000);
