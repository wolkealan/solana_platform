const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  character: {
    type: String,
    required: true,
    enum: ['rpm', 'anita'], // Expand this as you add more characters
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;