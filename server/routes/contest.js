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

router.get('/fetch-problems-table', contest.fetchProblemsTable);

router.get('/fetch-problem-by-qid/:qID', contest.fetchProblemPageByqID);

router.get('/fetch-problems-tab', contest.fetchProblemsTab);

router.post('/initialize-user-problem-data/:qID', contest.initializeUserProblemData);

router.get('/fetch-user-problem-data-by-qID/:qID', contest.fetchUserProblemDataByQID);

router.get('/get-hint-for-problem/:qID', contest.getHintByQID);

router.post('/check-input-format-by-qID', contest.checkInputFormatStatus);

router.post('/submit-problem', contest.submitProblem);

module.exports = router;
