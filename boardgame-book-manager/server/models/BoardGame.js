const mongoose = require('mongoose');

const boardGameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  designer: {
    type: String,
    trim: true,
  },
  genre: {
    type: String,
    trim: true,
  },
  // Example of how you might add more fields later:
  // minPlayers: { type: Number, min: 1 },
  // maxPlayers: { type: Number },
  // yearPublished: { type: Number }
}, { timestamps: true });

const BoardGame = mongoose.model('BoardGame', boardGameSchema);

module.exports = BoardGame;
