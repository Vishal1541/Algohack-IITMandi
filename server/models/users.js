var mongoose = require('mongoose');

var users = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  isVerified: Boolean,
  isAdmin: Boolean,
  verificationUri: String,
  registeredAt: Date,
  totalScore: Number,
  totalPenalty: Number,
  quesAttempts: [{
    qID: String,
    hasSolved: Boolean,
    wrongAttemptsCount: Number,
    hasHintTaken: Boolean
  }]
});

module.exports = mongoose.model('Users', users);
