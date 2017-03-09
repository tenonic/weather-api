const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

// Get our API routes
const api = require('./routes');

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// Set our api routes
app.use('/api', api);

const port = process.env.PORT || '3002';
app.set('port', port);


const server = http.createServer(app);

server.listen(app.get('port'), () => console.log(`API running on localhost:${port}`));