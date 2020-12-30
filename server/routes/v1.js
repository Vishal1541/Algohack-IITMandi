var express = require("express");
var router = express.Router();
var app = express();
var publicApis = require('./public'); 

app.use('/public', publicApis);

module.exports = app;
