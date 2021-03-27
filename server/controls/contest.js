var users = require('../models/users');
var usersModel = require('../models/users');
var contestModel = require('../models/contest');
var problemsModel = require('../models/problems');
var submissionModel = require('../models/submissions');
var helperFunctions = require('./helper');

const AlgohackConstants = helperFunctions.Constants;

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

exports.fetchProblemsTable = async (req, res) => {
  const contestSettings = await helperFunctions.fetchContestSettings();
  const contestCurrentStatus = await helperFunctions
    .fetchContestCurrentStatus(contestSettings);
  if (contestCurrentStatus !== AlgohackConstants.ContestStatusEnum.RUNNING) {
    return res.status(404).send("CONTEST_NOT_RUNNING");
  }
  const allProblemsMetadata = await helperFunctions
    .fetchAllQuestionsMetadata();
  const loggedInUserAllData = await helperFunctions
    .fetchSingleUserAllData(req.session.passport.user);
  var problemsTable = allProblemsMetadata;
  for (var i = 0; i < problemsTable.length; i++) {
    problemsTable[i].SNo = i + 1;
    problemsTable[i].currentPoints = problemsTable[i].points;
    problemsTable[i].hasSolved = false;
    problemsTable[i].hasHintTaken = false;
    var userAttemptedCurrentQuestionIndex = -1;
    for (var j = 0; j < loggedInUserAllData.quesAttempts.length; j++) {
      if (loggedInUserAllData.quesAttempts[j].qID === problemsTable[i].qID) {
        userAttemptedCurrentQuestionIndex = j;
        break;
      }
    }
    if (userAttemptedCurrentQuestionIndex !== -1) {
      problemsTable[i].currentPoints = helperFunctions.calculateUserOneQuestionPoints(
        loggedInUserAllData.quesAttempts[userAttemptedCurrentQuestionIndex],
        allProblemsMetadata,
        contestSettings);
      if (loggedInUserAllData
        .quesAttempts[userAttemptedCurrentQuestionIndex]
        .hasSolved) {
        problemsTable[i].hasSolved = true;
      }
      problemsTable[i].hasHintTaken =
        loggedInUserAllData.quesAttempts[userAttemptedCurrentQuestionIndex].hasHintTaken;
    }
  }
  return res.status(200).send(problemsTable);
}

exports.fetchProblemPageByqID = async (req, res) => {
  const contestSettings = await helperFunctions.fetchContestSettings();
  const contestCurrentStatus = await helperFunctions
    .fetchContestCurrentStatus(contestSettings);
  if (contestCurrentStatus !== AlgohackConstants.ContestStatusEnum.RUNNING) {
    return res.status(401).send("CONTEST_NOT_RUNNING");
  }
  var filteredProblem = {
    qID: null,
    name: null,
    description: null,
    inputFormat: null,
    outputFormat: null,
    constraints: null,
    sampleInput: null,
    sampleOutput: null,
    timeLimit: null,
    language: null,
    incorrectSolution: null,
    points: null,
    problemSetter: null,
    hint: null
  };
  await problemsModel.findOne({ qID: req.params.qID })
    .then((problem) => {
      if (problem.isPresentInContest) {
        filteredProblem.qID = problem.qID;
        filteredProblem.name = problem.name;
        filteredProblem.description = problem.description;
        filteredProblem.inputFormat = problem.inputFormat;
        filteredProblem.outputFormat = problem.outputFormat;
        filteredProblem.constraints = problem.constraints;
        filteredProblem.sampleInput = problem.sampleInput;
        filteredProblem.sampleOutput = problem.sampleOutput;
        filteredProblem.timeLimit = problem.timeLimit;
        filteredProblem.language = problem.language;
        filteredProblem.incorrectSolution = problem.incorrectSolution;
        filteredProblem.points = problem.points;
        filteredProblem.problemSetter = problem.problemSetter;

        return res.status(200).send(filteredProblem);
      } else {
        return res.status(401).send("CANNOT_FETCH_PROBLEM");
      }
    })
    .catch((err) => {
      console.log(err);
    })
}

exports.fetchProblemsTab = async (req, res) => {
  var problemsTab = [];
  const questionsMetadata = await helperFunctions.fetchAllQuestionsMetadata();
  const loggedInUserAllData = await helperFunctions
    .fetchSingleUserAllData(req.session.passport.user);
  for (var i = 0; i < questionsMetadata.length; i++) {
    obj = {
      qID: questionsMetadata[i].qID,
      name: questionsMetadata[i].name,
      hasSolved: false
    };
    loggedInUserAllData.quesAttempts.forEach(quesAttempt => {
      if (quesAttempt.qID === questionsMetadata[i].qID && quesAttempt.hasSolved) {
        obj.hasSolved = true;
      }
    });
    problemsTab.push(obj);
  }
  return res.status(200).send(problemsTab);
}

exports.initializeUserProblemData = async (req, res) => {
  const qID = req.params.qID;
  var userAllData =
    await helperFunctions.fetchSingleUserAllData(req.session.passport.user);
  var isQuestionPresent = false;
  for (var i = 0; i < userAllData.quesAttempts.length; i++) {
    if (userAllData.quesAttempts[i].qID === qID) {
      isQuestionPresent = true;
      break;
    }
  }
  if (!isQuestionPresent) {
    userAllData.quesAttempts.push({
      qID: qID,
      hasSolved: false,
      wrongAttemptsCount: 0,
      hasHintTaken: false
    });
    await usersModel.findOneAndUpdate({ _id: req.session.passport.user }, userAllData)
      .then(() => {
        return res.status(200).send();
      })
      .catch((err) => {
        console.log(err);
      })
  }
  return res.status(200).send();
}

exports.fetchUserProblemDataByQID = async (req, res) => {
  var userProblemData = {
    qID: req.params.qID,
    hasSolved: null,
    wrongAttemptsCount: null,
    hasHintTaken: null,
    currentPoints: null,
    totalHintsLeft: null,
    totalHintsTaken: null
  };
  const userAllData = await helperFunctions
    .fetchSingleUserAllData(req.session.passport.user);
  const allProblemsMetadata = await helperFunctions
    .fetchAllQuestionsMetadata();
  const contestSettings = await helperFunctions.fetchContestSettings();
  var totalHintsTaken = 0;

  for (var i = 0; i < userAllData.quesAttempts.length; i++) {
    const quesAttempt = userAllData.quesAttempts[i];
    if (quesAttempt.hasHintTaken) {
      totalHintsTaken++;
    }
    if (quesAttempt.qID === req.params.qID) {
      userProblemData.hasSolved = quesAttempt.hasSolved;
      userProblemData.wrongAttemptsCount = quesAttempt.wrongAttemptsCount;
      userProblemData.hasHintTaken = quesAttempt.hasHintTaken;
      userProblemData.currentPoints =
        helperFunctions.calculateUserOneQuestionPoints(
          quesAttempt,
          allProblemsMetadata,
          contestSettings);
    }
  }
  userProblemData.totalHintsLeft = contestSettings.maxHints - totalHintsTaken;
  userProblemData.totalHintsTaken = totalHintsTaken;
  return (null === userProblemData.hasSolved ?
    res.status(404).send("QUESTION_DATA_NOT_FOUND_FOR_USER")
    : res.status(200).send(userProblemData));
}

exports.getHintByQID = async (req, res) => {
  const qID = req.params.qID;
  var userAllData = await helperFunctions
    .fetchSingleUserAllData(req.session.passport.user);
  const contestSettings = await helperFunctions.fetchContestSettings();
  const problem = await problemsModel.findOne({ qID: qID });
  var totalHintsTaken = 0;

  // NOT FOR LIVE CONTEST
  // For practice contest after the actual contest is over, we want everyone
  // to seek for hint if they ask for, without actually altering the ranklist.
  // Therefore, directly return the hint.

  // return res.status(200).send(problem.hint);

  // FOR LIVE CONTEST
  // Only uncomment the above return statement, when the contest is over and
  // reoponed for practicing. Otherwise DO NOT UNCOMMENT the above statement for
  // live contest.
  for (var i = 0; i < userAllData.quesAttempts.length; i++) {
    const quesAttempt = userAllData.quesAttempts[i];
    if (quesAttempt.hasHintTaken) {
      totalHintsTaken++;
    }
    // The hint for this question is already taken. Therefore, simply
    // return the hint.
    if (quesAttempt.qID === qID && quesAttempt.hasHintTaken) {
      return res.status(200).send(problem.hint);
    }

    // User already solved this problem are not allowed to take the hint.
    if (quesAttempt.qID === qID && quesAttempt.hasSolved) {
      return res.status(401).send("NOT_ALLOWED_TO_SEE_HINT");
    }
  }

  // Already maximum number of hints taken. Taking more hint is not allowed.
  if (totalHintsTaken >= contestSettings.maxHints) {
    return res.status(401).send("MAXIMUM_HINTS_LIMIT_REACHED");
  }

  for (var i = 0; i < userAllData.quesAttempts.length; i++) {
    // Take hint for this problem and update the user problem data.
    if (userAllData.quesAttempts[i].qID === qID) {
      userAllData.quesAttempts[i].hasHintTaken = true;
      await usersModel.findOneAndUpdate({ username: userAllData.username }, userAllData);
      break;
    }
  }
  return res.status(200).send(problem.hint);
}

exports.checkInputFormatStatus = async (req, res) => {
  // Language Id 10 refers to C++ (g++ 7.2.0). All the checker programs are written in
  // C++
  await helperFunctions.checkInputFormatHelper(req.body.qID, req.body.inputFile, 10)
    .then((inputFormatStatus) => {
      return res.status(200).send(inputFormatStatus);
    })
    .catch((err) => {
      console.log(err);
    })
}

exports.submitProblem = async (req, res) => {
  const inputText = req.body.inputText;
  const problemAllData = await problemsModel.findOne({ qID: req.body.qID });
  const correctSolution = {
    source_code: problemAllData.correctSolution,
    language_id: problemAllData.languageCode,
    stdin: inputText
  };
  const incorrectSolution = {
    source_code: problemAllData.incorrectSolution,
    language_id: problemAllData.languageCode,
    stdin: inputText
  };
  const correctResult = await helperFunctions.makeJudge0Submission(correctSolution);
  const incorrectResult = await helperFunctions.makeJudge0Submission(incorrectSolution);
  var hacking_status;

  if (correctResult.stdout === incorrectResult.stdout) {
    hacking_status = AlgohackConstants.HACK_STATUS.UNSUCCESSFUL;
  } else {
    hacking_status = AlgohackConstants.HACK_STATUS.SUCCESS;
  }

  // Comment the below statement `updateUserDataAfterSubmission` when it's the practice
  // contest after the actual contest is over. This statement updates the user's scores 
  // into the database after submitting this particular problem.

  await helperFunctions.updateUserDataAfterSubmission(
    req.session.passport.user, req.body.qID, hacking_status);

  // ---------------------------------------------------------------------------------

  return res.status(200).send(hacking_status);

}
