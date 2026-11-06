const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');

const router = express.Router();

// Validation middleware for POST /send
const validateSendMessage = (req, res, next) => {
  const requiredFields = ['senderId', 'receiverId', 'encryptedMessage', 'encryptedSessionKey', 'timestamp'];
  
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({
        success: false,
        message: `${field} is required`
      });
    }
  }
  
  next();
};

// POST /send - Send encrypted message
router.post('/send', validateSendMessage, sendMessage);

// GET /chat - Get messages between users
// Query params: senderId, receiverId
router.get('/chat', getMessages);

// DELETE /:messageId - Delete a specific message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    // Validate messageId
    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required'
      });
    }

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID format'
      });
    }

    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is authorized to delete this message
    // Users can only delete messages they sent
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting message'
    });
  }
});

module.exports = router;
