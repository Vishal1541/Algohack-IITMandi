var mongoose = require('mongoose');
const Double = require('@mongoosejs/double');

var contest = new mongoose.Schema({
  startDateTime: Date,
  endDateTime: Date,
  maxHints: Number,
  pointReductionConstant: Double
});

module.exports = mongoose.model('ContestSetting', contest);
