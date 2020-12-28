var mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

var submissions = new mongoose.Schema({
  username: String,
  qID: String,
  submittedAt: Date,
  testcase: String,
  isCorrectFormat: Boolean,
  maxPoint: Number,
  scoredPoint: Number,
  reductionConstant: Double
});

module.exports = mongoose.model('Submissions', submissions);
