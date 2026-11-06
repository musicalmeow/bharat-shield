const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  encryptedMessage: {
    type: String,
    required: true
  },
  encryptedSessionKey: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: false // Optional for backward compatibility
  },
  timestamp: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Soft delete fields
  deletedBySender: {
    type: Boolean,
    default: false
  },
  deletedBySenderAt: {
    type: Date
  },
  deletedByReceiver: {
    type: Boolean,
    default: false
  },
  deletedByReceiverAt: {
    type: Date
  }
});

// Index for fast chat retrieval
messageSchema.index({ senderId: 1, receiverId: 1 });

module.exports = mongoose.model('Message', messageSchema);
