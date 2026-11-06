function socketHandler(io) {
  // In-memory map: userId -> socketId
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user joining with their userId
    socket.on('join', (data) => {
      try {
        const { userId } = data;

        if (!userId) {
          socket.emit('error', { message: 'userId is required' });
          return;
        }

        // Store mapping: userId -> socketId
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;

        console.log(`User ${userId} joined with socket ${socket.id}`);

        // Confirm join to user
        socket.emit('joined', { userId, socketId: socket.id });

      } catch (error) {
        console.error('Join error:', error);
        socket.emit('error', { message: 'Failed to join' });
      }
    });

    // Handle sending messages
    socket.on('send_message', (data) => {
      try {
        const { senderId, receiverId, encryptedMessage, encryptedSessionKey, timestamp } = data;

        // Validate all required fields exist
        const requiredFields = ['senderId', 'receiverId', 'encryptedMessage', 'encryptedSessionKey', 'timestamp'];
        
        for (const field of requiredFields) {
          if (!data[field]) {
            socket.emit('error', { message: `${field} is required` });
            return;
          }
        }

        // Find receiver's socketId
        const receiverSocketId = connectedUsers.get(receiverId);

        if (receiverSocketId) {
          // Receiver is online - relay message as-is (NO PROCESSING)
          io.to(receiverSocketId).emit('receive_message', {
            senderId,
            encryptedMessage,
            encryptedSessionKey,
            timestamp
          });

          // Send delivery acknowledgment to sender
          socket.emit('message_delivered', {
            receiverId,
            status: 'delivered'
          });

          console.log(`Message relayed from ${senderId} to ${receiverId}`);

        } else {
          // Receiver offline - let HTTP API handle storage
          socket.emit('message_delivered', {
            receiverId,
            status: 'offline'
          });

          console.log(`User ${receiverId} offline - message not relayed`);
        }

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators (optional)
    socket.on('typing', (data) => {
      try {
        const { receiverId, isTyping } = data;

        if (!receiverId || typeof isTyping !== 'boolean') {
          return; // Silently ignore invalid typing data
        }

        const receiverSocketId = connectedUsers.get(receiverId);
        
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user_typing', {
            userId: socket.userId,
            isTyping
          });
        }

      } catch (error) {
        console.error('Typing indicator error:', error);
        // Don't emit error for typing indicators
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      try {
        if (socket.userId) {
          // Remove user from connected map
          connectedUsers.delete(socket.userId);
          console.log(`User ${socket.userId} disconnected`);
        } else {
          console.log('Unknown user disconnected:', socket.id);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper function to check if user is online
  const isUserOnline = (userId) => {
    return connectedUsers.has(userId);
  };

  // Helper function to get socketId by userId
  const getSocketId = (userId) => {
    return connectedUsers.get(userId);
  };

  // Expose helper functions for external use if needed
  return {
    isUserOnline,
    getSocketId,
    getConnectedUsers: () => Array.from(connectedUsers.keys())
  };
}

module.exports = socketHandler;
