const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Delete chat only for specific user (not receiver) - SOFT DELETE
router.delete('/chat/:userId/:contactId', async (req, res) => {
  try {
    const { userId, contactId } = req.params;
    
    console.log(`Soft deleting chat for user ${userId} with contact ${contactId} (user-specific only)`);
    
    // SOFT DELETE: Mark messages as deleted for specific user
    // This preserves receiver's chat history while hiding from sender
    const updateResult = await Message.updateMany(
      {
        senderId: userId,
        receiverId: contactId,
        deletedBySender: { $ne: true }  // Only update if not already deleted by sender
      },
      {
        $set: { deletedBySender: true, deletedBySenderAt: new Date() }
      }
    );
    
    console.log(`Marked ${updateResult.modifiedCount} sent messages as deleted for sender (receiver still sees them)`);
    
    res.json({
      success: true,
      deletedCount: updateResult.modifiedCount,
      message: 'Your sent messages deleted successfully (receiver messages preserved)'
    });
    
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chat history'
    });
  }
});

// Delete all messages for a user (only as sender, not receiver)
router.delete('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`🗑️ Deleting all sent chats for user ${userId} (sender only)`);
    
    // Delete only messages where user is sender (not receiver)
    // This preserves the receiver's chat history
    const deleteResult = await Message.deleteMany({
      senderId: userId  // Only delete sent messages
    });
    
    console.log(`✅ Deleted ${deleteResult.deletedCount} sent messages (receiver chats preserved)`);
    
    res.json({
      success: true,
      deletedCount: deleteResult.deletedCount,
      message: 'Sent chat history deleted successfully (receiver chats preserved)'
    });
    
  } catch (error) {
    console.error('❌ Error deleting user chats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user chat history'
    });
  }
});

module.exports = router;
