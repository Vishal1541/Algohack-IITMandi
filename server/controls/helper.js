var usersModel = require('../models/users');
var contestModel = require('../models/contest');
var problemsModel = require('../models/problems');
var submissionModel = require('../models/submissions');
const users = require('../models/users');
const axios = require('axios');

exports.Constants = {
    ContestStatusEnum: {
        NOT_STARTED: "NOT_STARTED",
        RUNNING: "RUNNING",
        ENDED: "ENDED",
    },
    HINT_TAKEN_REDUCTION_FACTOR: 0.5,
    MIN_SCORABLE_POINTS_PER_QUES: 1,
    INPUT_FORMAT_STATUS: {
        UNSPECIFIED: "UNSPECIFIED",
        CORRECT_FORMAT: "CORRECT_FORMAT",
        INCORRECT_FORMAT: "INCORRECT_FORMAT"
    },
    HACK_STATUS: {
        SUCCESS: "SUCCESS",
        UNSUCCESSFUL: "UNSUCCESSFUL"
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
                if (problem.isPresentInContest) {
                    allQuestionsMetadata.push({
                        qID: problem.qID,
                        name: problem.name,
                        points: problem.points,
                    });
                }
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

exports.findUserTotalHintsTaken = async (quesAttempts) => {
    var totalHintsTaken = 0;
    quesAttempts.forEach(quesAttempt => {
        if (quesAttempt.hasHintTaken) {
            totalHintsTaken++;
        }
    });
    return totalHintsTaken;
}

/** @param _id This id is the req.session.passport.user */
exports.fetchSingleUserAllData = async (_id) => {
    var userAllData = null;
    await users.findOne({ _id: _id })
        .then((user) => {
            userAllData = user;
        })
        .catch((err) => {
            console.log(err);
        })
    return userAllData;
}

exports.fetchContestCurrentStatus = async (contestSettings) => {
    const CURRENT_TIME = new Date();
    const CONTEST_START_TIME = new Date(contestSettings.startDateTime);
    const CONTEST_END_TIME = new Date(contestSettings.endDateTime);

    if (CURRENT_TIME < CONTEST_START_TIME) {
        return this.Constants.ContestStatusEnum.NOT_STARTED;
    }

    if (CURRENT_TIME > CONTEST_END_TIME) {
        return this.Constants.ContestStatusEnum.ENDED;
    }

    return this.Constants.ContestStatusEnum.RUNNING;
}

/**
 * Call Judge0 API hosted on IIT Mandi SNTC server.
 * 
 * @param {body} : {source_code: String, language_id: String, stdin: String}
 * @returns The result of the submission.
 */
exports.makeJudge0Submission = async (body) => {
    // Converting Windows version (CR+LF) to the Unix version (LF).
    body.stdin = body.stdin.replace(/\r\n/g, "\n");
    var result = null;
    await axios.post('http://sntc.iitmandi.ac.in:3000/submissions/?base64_encoded=false&wait=true', body)
        .then((res) => {
            result = res.data;
        })
        .catch((err) => {
            console.log(err);
        })
    return result;
}

exports.checkInputFormatHelper = async (qID, inputFile, language_id) => {
    const problemAllData = await problemsModel.findOne({ qID: qID });
    const judge0ApiInput = {
        source_code: problemAllData.checkerProgram,
        language_id: language_id,
        stdin: inputFile
    }
    var judge0SubmissionResult = this.Constants.INPUT_FORMAT_STATUS.UNSPECIFIED;
    await this.makeJudge0Submission(judge0ApiInput)
        .then((result) => {
            if (result.stderr === "SUCCESS\n") {
                judge0SubmissionResult = this.Constants.INPUT_FORMAT_STATUS.CORRECT_FORMAT;
            } else {
                judge0SubmissionResult = this.Constants.INPUT_FORMAT_STATUS.INCORRECT_FORMAT;
            }
        })
        .catch((err) => {
            console.log(err);
        })
    return judge0SubmissionResult;
}

/**
 * To update the user data into the database after the problem submission.
 * @param {user_id} : req.session.passport.user
 * @param {qID} : question id i.e. problem.qID
 * @param {hacking_status} : HACK_STATUS.SUCCESS or HACK_STATUS.UNSUCCESSFUL
 */
exports.updateUserDataAfterSubmission = async (user_id, qID, hacking_status) => {
    const currentDatetime = new Date();
    var userAllData = await this.fetchSingleUserAllData(user_id);
    for (var i = 0; i < userAllData.quesAttempts.length; i++) {
        if (userAllData.quesAttempts[i].qID === qID) {
            // Don't update the user's scores if the user has already solved
            // this problem.
            if (userAllData.quesAttempts[i].hasSolved) {
                return;
            }

            const contestSettings = await this.fetchContestSettings();
            const allProblemsMetadata = await this.fetchAllQuestionsMetadata();

            // The user has solved this problem.
            if (hacking_status === this.Constants.HACK_STATUS.SUCCESS) {
                userAllData.quesAttempts[i].hasSolved = true;
                const currentProblemScores =
                    this.calculateUserOneQuestionPoints(
                        userAllData.quesAttempts[i], allProblemsMetadata, contestSettings);
                // The penalty for the problem is the time difference between the time of
                // the submission and the contest start time. (in seconds)
                const penalty = Math.round((currentDatetime.getTime()
                    - contestSettings.startDateTime.getTime()) / 1000);

                userAllData.totalScore += currentProblemScores;
                userAllData.totalPenalty += penalty;
            }
            // The user has made unsuccessful hacking attempt.
            else {
                userAllData.quesAttempts[i].wrongAttemptsCount++;
            }

            // Now update the user's scores to the database.
            await usersModel.findOneAndUpdate({_id: user_id}, userAllData);
            break;
        }
    }
}
