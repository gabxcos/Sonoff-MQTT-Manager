const logger = require('./logger');
const { SERVER_HOST, SERVER_PORT } = require('./config');

var express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');

const { Broker } = require('./broker');
const { db } = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(routes);

app.listen(SERVER_PORT, () => { logger('ExpressJS', `Now listening for connections on port ${SERVER_PORT}.`)});

module.exports = app;
