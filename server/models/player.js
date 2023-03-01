const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: String,
  highscores: [{
    songName: String,
    score: Number,
    grade: String
  }],
  preferences: {
    type: {
      sfxOn: Boolean,
      volume: Number,
      topKey1: String,
      topKey2: String,
      bottomKey1: String,
      bottomKey2: String
    },
    default: {
      sfxOn: true,
      volume: 100,
      topKey1: "S",
      topKey2: "D",
      bottomKey1: "J",
      bottomKey2: "K"
    }
  }
});

module.exports = mongoose.model('Player', playerSchema);