var mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

var problems = new mongoose.Schema({
  qID: String,
  name: String,
  description: String,
  inputFormat: String,
  outputFormat: String,
  constraints: String,
  sampleInput: String,
  sampleOutput: String,
  timeLimit: Double,
  correctSolution: String,
  incorrectSolution: String,
  checkerProgram: String,
  hint: String,
  points: Number,
  problemSetter: String
});

module.exports = mongoose.model('Problems', problems);
