const express = require('express');
const { registerUser, loginUser, getPublicKey, listUsers } = require('../controllers/authController');

const router = express.Router();

// GET /users - Directory (demo): list registered users
router.get('/users', listUsers);

// POST /register - Register new user
router.post('/register', registerUser);

// POST /login - Login user
router.post('/login', loginUser);

// GET /public-key/:userId - Get user's public key
router.get('/public-key/:userId', getPublicKey);

module.exports = router;
