var express = require("express");
var router = express.Router();
var normal = require("../controls/normal");

router.get('/registered', normal.registered);

router.post('/judge0-sumbit', normal.makeSubmissionJudge0);

router.get('/all-users', normal.getAllUsers);

router.get('/all-problems', normal.getAllProblems);

router.get('/contest-settings', normal.getContestSettings);

module.exports = router;
