var users = require('../models/users');
var contestModel = require('../models/contest');
var problemsModel = require('../models/problems');
var submissionModel = require('../models/submissions');

exports.Constants = {
    "ContestStatusEnum": {
        NOT_STARTED : "NOT_STARTED",
        RUNNING : "RUNNING",
        ENDED : "ENDED",
    }
}

exports.fetchContestSettings = async () => {
    var contestSetting = null;
    await contestModel.findOne({})
        .then((settings) => {
            contestSetting = settings;
        })
        .catch((err) => {
            console.log(err);
        })
    return contestSetting;
}