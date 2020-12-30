var users = require('../models/users');
var contestModel = require('../models/contest');
var problemsModel = require('../models/problems');
var helperFunctions = require('./helper');

const AlgohackConstants = helperFunctions.Constants;

exports.fetchContestStatus = async (req, res) => {
    const contestSettings = await helperFunctions.fetchContestSettings();
    const CURRENT_TIME_UTC = new Date();
    const CONTEST_START_UTC = new Date(contestSettings.startDateTime);
    const CONTEST_END_UTC = new Date(contestSettings.endDateTime);

    console.log(CURRENT_TIME_UTC, CONTEST_START_UTC, CONTEST_END_UTC);

    if (CURRENT_TIME_UTC < CONTEST_START_UTC) {
        return res.send({ contestStatus: AlgohackConstants.ContestStatusEnum.NOT_STARTED });
    }

    if (CURRENT_TIME_UTC > CONTEST_END_UTC) {
        return res.send({ contestStatus: AlgohackConstants.ContestStatusEnum.ENDED });
    }

    return res.send({ contestStatus: AlgohackConstants.ContestStatusEnum.RUNNING });
}
