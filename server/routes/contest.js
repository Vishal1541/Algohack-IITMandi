var express = require("express");
var router = express.Router();
var contest = require("../controls/contest");

// Will @deprecate soon.
router.get('/settings', contest.getSettings);

// Will @deprecate soon.
router.get('/all-problems', contest.allProblems);

// Will @deprecate soon.
router.post('/update-user-data', contest.updateUserData);

// Will @deprecate soon.
router.post('/add-submission', contest.addSubmission);

router.get('/fetch-user-navbar-info', contest.fetchUserNavbarInfo);

router.get('/fetch-contest-settings', contest.fetchContestSettings);

module.exports = router;
