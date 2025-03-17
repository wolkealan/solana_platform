const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
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
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying of conversations
messageSchema.index({ senderWallet: 1, receiverWallet: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;