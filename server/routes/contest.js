var express = require("express");
var router = express.Router();
var contest = require("../controls/contest");

router.get('/settings', contest.getSettings);

router.get('/all-problems', contest.allProblems);

router.post('/update-user-data', contest.updateUserData);

router.post('/add-submission', contest.addSubmission);

module.exports = router;
