var usersModel = require('../models/users');
var contestModel = require('../models/contest');
var problemsModel = require('../models/problems');
var helperFunctions = require('./helper');

const AlgohackConstants = helperFunctions.Constants;

exports.fetchContestStatus = async (req, res) => {
    const contestSettings = await helperFunctions.fetchContestSettings();
    const CURRENT_TIME_UTC = new Date();
    const CONTEST_START_UTC = new Date(contestSettings.startDateTime);
    const CONTEST_END_UTC = new Date(contestSettings.endDateTime);

    if (CURRENT_TIME_UTC < CONTEST_START_UTC) {
        return res.send({ contestStatus: AlgohackConstants.ContestStatusEnum.NOT_STARTED });
    }

    if (CURRENT_TIME_UTC > CONTEST_END_UTC) {
        return res.send({ contestStatus: AlgohackConstants.ContestStatusEnum.ENDED });
    }

    return res.send({ contestStatus: AlgohackConstants.ContestStatusEnum.RUNNING });
}

exports.fetchUserMetadata = async (req, res) => {
    var userMetaData = {};
    await usersModel.findOne({ _id: req.session.passport.user })
        .then((user) => {
            if (user) {
                userMetaData = {
                    name: user.name,
                    username: user.username,
                    isVerified: user.isVerified,
                }
            }
        })
        .catch((err) => {
            console.log(err);
        })
    return res.send(userMetaData);
}
