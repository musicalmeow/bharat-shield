const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
contactRequestSchema.index({ fromUser: 1, toUser: 1 });
contactRequestSchema.index({ toUser: 1, status: 1 });
contactRequestSchema.index({ fromUser: 1, status: 1 });

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
