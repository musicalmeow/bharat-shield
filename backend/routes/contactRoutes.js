const express = require('express');
const router = express.Router();
const {
  sendContactRequest,
  acceptContactRequest,
  rejectContactRequest,
  getContacts,
  getPendingRequests
} = require('../controllers/contactController');

// POST /request - Send contact request
router.post('/request', async (req, res) => {
  await sendContactRequest(req, res);
});

// POST /accept - Accept contact request
router.post('/accept', async (req, res) => {
  await acceptContactRequest(req, res);
});

// POST /reject - Reject contact request
router.post('/reject', async (req, res) => {
  await rejectContactRequest(req, res);
});

// GET /list/:userId - Get user's contacts
router.get('/list/:userId', async (req, res) => {
  await getContacts(req, res);
});

// GET /pending/:userId - Get user's pending contact requests
router.get('/pending/:userId', async (req, res) => {
  await getPendingRequests(req, res);
});

module.exports = router;
