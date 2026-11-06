const dns = require('dns');
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;
    // Force simple local connection
    if (mongoURI && mongoURI.includes('localhost')) {
      mongoURI = 'mongodb://127.0.0.1:27017/kmune';
    }

    if (!mongoURI) {
      console.error('MongoDB URI not provided in environment variables');
      process.exit(1);
    }

    // Atlas on Windows + recent Node: happy-eyeballs / IPv6-first DNS can pick a
    // path that fails TLS with "SSL alert number 80". Prefer IPv4 and disable
    // automatic dual-stack family selection for the driver sockets.
    if (typeof dns.setDefaultResultOrder === 'function') {
      dns.setDefaultResultOrder('ipv4first');
    }

    await mongoose.connect('mongodb://127.0.0.1:27017/kmune');

    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
