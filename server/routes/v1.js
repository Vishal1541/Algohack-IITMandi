var express = require("express");
var router = express.Router();
var app = express();
var publicApis = require('./public'); 
var contestApis = require('./contest'); 

app.use('/public', publicApis); 

app.use('/contest', contestApis);

module.exports = app;
