var usersModel = require('../models/users');
var contestModel = require('../models/contest');
var problemsModel = require('../models/problems');
var helperFunctions = require('./helper');

exports.fetchContestStatus = async (req, res) => {
    const contestSettings = await helperFunctions.fetchContestSettings();
    const contestStatus = await helperFunctions.fetchContestCurrentStatus(contestSettings);
    return res.send({ contestStatus: contestStatus });
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

exports.fetchAllQuestionsMetadata = async (req, res) => {
    const allQuestionsMetadata = await helperFunctions.fetchAllQuestionsMetadata();
    return res.send(allQuestionsMetadata);
}

ranklistComparator = (userA, userB) => {
    if (userA.totalScore == 0)
        return 1;
    if (userB.totalScore == 0)
        return -1;
    if (userA.totalScore > userB.totalScore)
        return -1;
    if (userA.totalScore < userB.totalScore)
        return 1;
    if (userA.penalty < userB.penalty)
        return -1;
    return 1;
}

exports.fetchRanklist = async (req, res) => {
    const allUsersDetails = await helperFunctions.fetchAllUsersData();
    const allProblemsMetadata = await helperFunctions.fetchAllQuestionsMetadata();
    const contestSettings = await helperFunctions.fetchContestSettings();
    var ranklist = [];

    allUsersDetails.forEach((user) => {
        var userScores = {
            username: user.username,
            name: user.name,
            penalty: user.totalPenalty,
            totalScore: user.totalScore,
        };

        user.quesAttempts.forEach((quesAttempt) => {
            userScores[quesAttempt.qID] = {
                qID: quesAttempt.qID,
                hasSolved: quesAttempt.hasSolved,
                wrongAttemptsCount: quesAttempt.wrongAttemptsCount,
                hasHintTaken: quesAttempt.hasHintTaken,
                quesScore: 0,
            }
            var questionSolvedPoints = 0;
            if (quesAttempt.hasSolved) {
                questionSolvedPoints = helperFunctions.calculateUserOneQuestionPoints(
                    quesAttempt,
                    allProblemsMetadata,
                    contestSettings);
            }
            userScores[quesAttempt.qID].quesScore = questionSolvedPoints;
        });
        ranklist.push(userScores);
    });

    ranklist.sort(ranklistComparator);
    ranklist = await helperFunctions.addRankToOrderedRanklist(ranklist);

    return res.send(ranklist);
}
