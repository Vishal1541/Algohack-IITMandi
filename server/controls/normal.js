var users = require('../models/users');
var problemsModel = require('../models/problems');
var contestModel = require('../models/contest');
const axios = require('axios');

exports.registered = async (req, res) => {
  users.find({ isVerified: true }).sort({ registeredAt: 1 })
    .then((reg_users) => {
      return res.send(reg_users);
    })
    .catch((err) => {
      console.log(err);
    })
}

exports.makeSubmissionJudge0 = async (req, res, next) => {
  req.body.stdin = req.body.stdin.replace(/\r\n/g, "\n"); // Windows version (CR+LF) to the Unix version (LF)
  await axios.post('http://sntc.iitmandi.ac.in:3000/submissions/?base64_encoded=false&wait=true', req.body)
    .then((response) => {
      return res.send(response.data);
    })
    .catch((err) => {
      console.log(err);
    })
}

exports.getAllUsers = async (req, res, next) => {
  users.find({})
    .then((response) => {
      return res.send(response);
    })
    .catch((err) => {
      console.log(err);
    })
}

exports.getAllProblems = async (req, res, next) => {
  problemsModel.find({})
    .then((response) => {
      return res.send(response);
    })
    .catch((err) => {
      console.log(err);
    })
}

exports.getContestSettings = async (req, res) => {
  contestModel.findOne({})
    .then((settings) => {
      return res.send(settings);
    })
    .catch((err) => {
      console.log(err);
    })
}
