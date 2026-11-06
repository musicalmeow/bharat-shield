const mongoose = require('mongoose');
const User = require('../models/User');

const registerUser = async (req, res) => {
  try {
    const { username, publicKey } = req.body;

    // Validate inputs
    if (!username || !publicKey) {
      return res.status(400).json({
        success: false,
        message: 'Username and publicKey are required'
      });
    }

    if (typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Username must be a non-empty string'
      });
    }

    if (typeof publicKey !== 'string' || publicKey.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'PublicKey must be a non-empty string'
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create new user
    const user = new User({
      username: username.trim(),
      publicKey: publicKey.trim()
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: user._id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username } = req.body;

    // Validate input
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Username is required and must be a non-empty string'
      });
    }

    // Find user by username
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      userId: user._id,
      username: user.username,
      publicKey: user.publicKey
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

const getPublicKey = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId is required'
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      publicKey: user.publicKey
    });

  } catch (error) {
    console.error('Get public key error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching public key'
    });
  }
};

const listUsers = async (req, res) => {
  try {
    const { exclude } = req.query;
    const filter = {};
    if (exclude && mongoose.Types.ObjectId.isValid(exclude)) {
      filter._id = { $ne: new mongoose.Types.ObjectId(exclude) };
    }
    const users = await User.find(filter).select('username').sort({ username: 1 }).lean();
    res.status(200).json({
      success: true,
      users: users.map((u) => ({ userId: u._id.toString(), username: u.username })),
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while listing users',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getPublicKey,
  listUsers,
};
