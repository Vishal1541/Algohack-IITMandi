var express = require("express");
var router = express.Router();
var app = express();
var publicApis = require('./public'); 
var contestApis = require('./contest');
const authMiddleware = require('../middleware/auth_middleware'); 

app.use('/public', publicApis); 

app.use('/contest', authMiddleware, contestApis);

module.exports = app;
