var express = require("express");
var router = express.Router();
var publicApis = require('../controls/public'); 

router.get('/fetch-contest-status', publicApis.fetchContestStatus);

router.get('/fetch-user-metadata', publicApis.fetchUserMetadata);

module.exports = router;
