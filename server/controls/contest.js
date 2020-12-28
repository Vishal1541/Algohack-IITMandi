var users = require('../models/users');
var contestModel = require('../models/contest');
var problemsModel = require('../models/problems');
var submissionModel = require('../models/submissions');

exports.getSettings = async (req, res) => {
  contestModel.findOne({})
    .then((settings) => {
      return res.send(settings);
    })
    .catch((err) => {
      console.log(err);
    })
}

exports.allProblems = async (req, res) => {
  problemsModel.find({})
    .then((problems) => {
      res.send(problems);
    })
    .catch((err) => {
      console.log(err);
    })
}

exports.updateUserData = async (req, res, next) => {
  users.findOneAndUpdate({ _id: req.session.passport.user }, req.body)
    .then((response) => {
      return res.send(response);
    })
    .catch((err) => {
      console.log(err);
    })
}

exports.addSubmission = async (req, res, next) => {
  const new_submission = new submissionModel(req.body);
  new_submission.save();
  return res.status(200);
}
