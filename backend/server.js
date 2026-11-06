const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const deleteRoutes = require('./routes/deleteRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Import socket handler
const socketHandler = require('./socket/socketHandler');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = socketIo(server, { cors: { origin: "*" } });

// Middleware
app.use(cors({ origin: true, credentials: false }));
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.send('API running');
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/delete', deleteRoutes);
app.use('/api/contacts', contactRoutes);

// Connect to database
connectDB();

// Setup Socket.IO handler
socketHandler(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
