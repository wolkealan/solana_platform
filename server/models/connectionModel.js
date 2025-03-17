const mongoose = require('mongoose');

const connectionSchema = mongoose.Schema({
  senderWallet: {
    type: String,
    required: true,
    ref: 'User'
  },
  receiverWallet: {
    type: String,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure that combination of sender and receiver is unique
connectionSchema.index({ senderWallet: 1, receiverWallet: 1 }, { unique: true });

const Connection = mongoose.model('Connection', connectionSchema);
module.exports = Connection;