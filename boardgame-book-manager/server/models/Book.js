const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  genre: {
    type: String,
    trim: true,
  },
  // Example fields for later:
  // isbn: { type: String, unique: true, sparse: true }, // sparse allows nulls not to violate unique constraint
  // publishedYear: { type: Number }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
