var express = require("express");
var router = express.Router();
var publicApis = require('../controls/public'); 

router.get('/fetch-contest-status', publicApis.fetchContestStatus);

module.exports = router;
