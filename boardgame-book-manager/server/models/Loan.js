const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  item: { // Reference to either BoardGame or Book
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemTypeEnum', // Dynamic reference based on itemTypeEnum
  },
  itemTypeEnum: { // To specify which collection 'item' refers to
    type: String,
    required: true,
    enum: ['BoardGame', 'Book'],
  },
  borrowerName: { // Kept for now as per previous decision
    type: String,
    required: true,
    trim: true,
  },
  loanDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date, // Will be null until returned
  },
  loanedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  returnedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Will be null until returned
  },
}, { timestamps: true });

// Optional: Index for common queries
loanSchema.index({ item: 1, itemTypeEnum: 1, returnDate: 1 }); // For finding active loans for an item
loanSchema.index({ loanedByUserId: 1 });
loanSchema.index({ borrowerName: 1 });


const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;
