const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  highscores: [{
    name: String,
    score: Number
  }],
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);