const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, { timestamps: true }); // Add timestamps (createdAt, updatedAt)

// Method to compare password (optional, can also be done in route handler)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Middleware to hash password before saving (if password is modified)
// This is generally good practice but might be complex if password isn't directly set/modified on the model often.
// For now, password hashing is handled in the /register route.

const User = mongoose.model('User', userSchema);

module.exports = User;
