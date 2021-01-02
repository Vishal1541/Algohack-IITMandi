var usersModel = require('../models/users');
var contestModel = require('../models/contest');
var problemsModel = require('../models/problems');
var submissionModel = require('../models/submissions');

exports.Constants = {
    "ContestStatusEnum": {
        NOT_STARTED: "NOT_STARTED",
        RUNNING: "RUNNING",
        ENDED: "ENDED",
    },
    "HINT_TAKEN_REDUCTION_FACTOR": 0.5,
    "MIN_SCORABLE_POINTS_PER_QUES": 1,
}

var allProblemsMetadata = [];
var contestSettings = null;

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

exports.fetchAllUsersData = async () => {
    var allUsersData = [];
    await usersModel.find({})
        .then((users) => {
            allUsersData = users;
        })
        .catch((err) => {
            console.log(err);
        })
    return allUsersData;
}

exports.fetchAllQuestionsMetadata = async () => {
    var allQuestionsMetadata = [];
    await problemsModel.find({})
        .then((problems) => {
            problems.forEach(problem => {
                allQuestionsMetadata.push({
                    qID: problem.qID,
                    name: problem.name,
                    points: problem.points,
                });
            });
        })
        .catch((err) => {
            console.log(err);
        })
    return allQuestionsMetadata;
}

exports.getQuestionPointsByQID = (qID, allQuestions) => {
    var points = 0;
    allQuestions.forEach(question => {
        if (question.qID === qID) {
            points = question.points;
        }
    });
    return points;
}

exports.calculateUserOneQuestionPoints = (
    questionAttempt,
    allProblemsMetadata,
    contestSettings) => {
    if (!questionAttempt.hasSolved) {
        return null;
    }

    var questionPoints =
        parseInt(this.getQuestionPointsByQID(questionAttempt.qID, allProblemsMetadata));

    for (var i = 0; i < questionAttempt.wrongAttemptsCount; i++) {
        questionPoints = parseInt(questionPoints * contestSettings.pointReductionConstant);
    }

    if (questionAttempt.hasHintTaken) {
        questionPoints = parseInt(questionPoints * this.Constants.HINT_TAKEN_REDUCTION_FACTOR);
    }

    questionPoints = Math.max(this.Constants.MIN_SCORABLE_POINTS_PER_QUES, questionPoints);

    return questionPoints;
}

exports.addRankToOrderedRanklist = async (ranklist) => {
    var currentRank = 1;
    for (var i = 0; i < ranklist.length; i++) {
        // User with none question solved should have no rank.
        if (ranklist[i].totalScore == 0) {
            break;
        }
        if (i == 0) {
            ranklist[i].rank = currentRank;
        } else {
            if (ranklist[i].totalScore === ranklist[i - 1].totalScore
                && ranklist[i].penalty === ranklist[i - 1].penalty) {
                ranklist[i].rank = currentRank;
            }
            else {
                currentRank++;
                ranklist[i].rank = currentRank;
            }
        }
    }
    return ranklist;
}
