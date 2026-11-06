const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');

const sendMessage = async (req, res) => {
  try {
    const {
      senderId,
      receiverId,
      encryptedMessage,
      encryptedSessionKey,
      timestamp,
      text // Optional plain text for visibility
    } = req.body;

    // Validate all required fields
    const requiredFields = ['senderId', 'receiverId', 'encryptedMessage', 'encryptedSessionKey', 'timestamp'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate field types
    if (typeof encryptedMessage !== 'string' || encryptedMessage.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'encryptedMessage must be a non-empty string'
      });
    }

    if (typeof encryptedSessionKey !== 'string' || encryptedSessionKey.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'encryptedSessionKey must be a non-empty string'
      });
    }

    // Validate timestamp
    const timestampDate = new Date(timestamp);
    if (isNaN(timestampDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid timestamp format'
      });
    }

    // Verify sender and receiver exist
    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create and store message
    const messageData = {
      senderId,
      receiverId,
      encryptedMessage: encryptedMessage.trim(),
      encryptedSessionKey: encryptedSessionKey.trim(),
      timestamp: timestampDate
    };
    
    // Add plain text if provided (for development/testing)
    if (text) {
      messageData.text = text.trim();
    }
    
    const message = new Message(messageData);

    await message.save();

    res.status(201).json({
      success: true,
      message: 'Message stored successfully',
      messageId: message._id
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while storing message'
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    // Validate required parameters
    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Both senderId and receiverId are required'
      });
    }

    // Validate ObjectId format
    const isValidSenderId = mongoose.Types.ObjectId.isValid(senderId);
    const isValidReceiverId = mongoose.Types.ObjectId.isValid(receiverId);

    if (!isValidSenderId || !isValidReceiverId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Fetch messages from user's perspective (both sent and received)
    // Respect soft delete flags - don't show messages deleted by the requesting user
    const messages = await Message.find({
      $or: [
        { 
          senderId: senderId, 
          receiverId: receiverId,
          deletedBySender: { $ne: true }  // Don't show if sender deleted them
        },  
        { 
          senderId: receiverId, 
          receiverId: senderId,
          deletedByReceiver: { $ne: true }  // Don't show if receiver deleted them
        }   
      ]
    })
    .sort({ timestamp: 1 }) // chronological order
    .lean(); // return plain JavaScript objects for better performance

    // Return encrypted messages as-is (NO PROCESSING OR DECRYPTION)
    res.status(200).json({
      success: true,
      messages: messages.map(msg => ({
        messageId: msg._id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        encryptedMessage: msg.encryptedMessage,
        encryptedSessionKey: msg.encryptedSessionKey,
        timestamp: msg.timestamp,
        isRead: msg.isRead,
        readAt: msg.readAt
      }))
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching messages'
    });
  }
};

module.exports = {
  sendMessage,
  getMessages
};
