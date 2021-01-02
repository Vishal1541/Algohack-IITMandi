var users = require('../models/users');
var usersModel = require('../models/users');
var contestModel = require('../models/contest');
var problemsModel = require('../models/problems');
var submissionModel = require('../models/submissions');
var helperFunctions = require('./helper');

// Will @deprecate soon.
exports.getSettings = async (req, res) => {
  contestModel.findOne({})
    .then((settings) => {
      return res.send(settings);
    })
    .catch((err) => {
      console.log(err);
    })
}

// Will @deprecate soon.
exports.allProblems = async (req, res) => {
  problemsModel.find({})
    .then((problems) => {
      res.send(problems);
    })
    .catch((err) => {
      console.log(err);
    })
}

// Will @deprecate soon.
exports.updateUserData = async (req, res, next) => {
  users.findOneAndUpdate({ _id: req.session.passport.user }, req.body)
    .then((response) => {
      return res.send(response);
    })
    .catch((err) => {
      console.log(err);
    })
}

// Will @deprecate soon.
exports.addSubmission = async (req, res, next) => {
  const new_submission = new submissionModel(req.body);
  new_submission.save();
  return res.status(200);
}

exports.fetchUserNavbarInfo = async (req, res) => {
  var userNavBarInfo = {
    name: null,
    username: null,
    totalScore: null,
    totalHintsTaken: null,
    totalAvailableHints: null,
  };
  await usersModel.findOne({ _id: req.session.passport.user })
    .then(async (userDetail) => {
      if (userDetail) {
        userNavBarInfo.name = userDetail.name;
        userNavBarInfo.username = userDetail.username;
        userNavBarInfo.totalScore = userDetail.totalScore;
        userNavBarInfo.totalHintsTaken =
          await helperFunctions.findUserTotalHintsTaken(userDetail.quesAttempts);
        userNavBarInfo.totalAvailableHints =
          (await helperFunctions.fetchContestSettings()).maxHints;
      }
    })
    .catch((err) => {
      console.log(err);
    })
  return res.send(userNavBarInfo);
}

exports.fetchContestSettings = async (req, res) => {
  const contestSettings = await helperFunctions.fetchContestSettings();
  return res.send(contestSettings);
}
