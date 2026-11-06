const User = require('../models/User');
const ContactRequest = require('../models/ContactRequest');
const mongoose = require('mongoose');

const sendContactRequest = async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;

    // Validate required fields
    if (!fromUserId || !toUserId) {
      return res.status(400).json({
        success: false,
        message: 'fromUserId and toUserId are required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(fromUserId) || !mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Prevent self-request
    if (fromUserId === toUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send contact request to yourself'
      });
    }

    // Check if both users exist
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId)
    ]);

    if (!fromUser || !toUser) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }

    // Prevent duplicate requests
    const existingRequest = await ContactRequest.findOne({
      $or: [
        { fromUser: fromUserId, toUser: toUserId },
        { fromUser: toUserId, toUser: fromUserId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Contact request already sent'
        });
      } else if (existingRequest.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Users are already contacts'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Previous contact request was rejected. Please try again later.'
        });
      }
    }

    // Check if already in contacts
    if (fromUser.contacts.includes(toUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Users are already contacts'
      });
    }

    // Create contact request
    const contactRequest = new ContactRequest({
      fromUser: fromUserId,
      toUser: toUserId,
      status: 'pending'
    });

    await contactRequest.save();

    res.status(201).json({
      success: true,
      message: 'Contact request sent successfully',
      requestId: contactRequest._id
    });

  } catch (error) {
    console.error('Send contact request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while sending contact request'
    });
  }
};

const acceptContactRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    // Validate required fields
    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'requestId is required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format'
      });
    }

    // Find contact request
    const contactRequest = await ContactRequest.findById(requestId).populate('fromUser toUser');

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    // Ensure status is pending
    if (contactRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Contact request has already been processed'
      });
    }

    // Update status to accepted
    contactRequest.status = 'accepted';
    await contactRequest.save();

    // Add each user to other's contacts list
    await Promise.all([
      User.findByIdAndUpdate(
        contactRequest.fromUser._id,
        { $addToSet: { contacts: contactRequest.toUser._id } }
      ),
      User.findByIdAndUpdate(
        contactRequest.toUser._id,
        { $addToSet: { contacts: contactRequest.fromUser._id } }
      )
    ]);

    res.status(200).json({
      success: true,
      message: 'Contact request accepted successfully'
    });

  } catch (error) {
    console.error('Accept contact request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while accepting contact request'
    });
  }
};

const rejectContactRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    // Validate required fields
    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'requestId is required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format'
      });
    }

    // Find contact request
    const contactRequest = await ContactRequest.findById(requestId);

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found'
      });
    }

    // Ensure status is pending
    if (contactRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Contact request has already been processed'
      });
    }

    // Update status to rejected
    contactRequest.status = 'rejected';
    await contactRequest.save();

    res.status(200).json({
      success: true,
      message: 'Contact request rejected successfully'
    });

  } catch (error) {
    console.error('Reject contact request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while rejecting contact request'
    });
  }
};

const getContacts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Fetch user with populated contacts
    const user = await User.findById(userId)
      .populate({
        path: 'contacts',
        select: 'username publicKey' // Only expose necessary fields
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      contacts: user.contacts
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching contacts'
    });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Fetch pending requests where user is the recipient
    const requests = await ContactRequest.find({
      toUser: userId,
      status: 'pending'
    })
    .populate({
      path: 'fromUser',
      select: 'username' // Only expose necessary field
    })
    .sort({ createdAt: -1 });

    // Return minimal info
    const requestsInfo = requests.map(request => ({
      requestId: request._id,
      fromUser: request.fromUser.username,
      createdAt: request.createdAt
    }));

    res.status(200).json({
      success: true,
      requests: requestsInfo
    });

  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching pending requests'
    });
  }
};

module.exports = {
  sendContactRequest,
  acceptContactRequest,
  rejectContactRequest,
  getContacts,
  getPendingRequests
};
