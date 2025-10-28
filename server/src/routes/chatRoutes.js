const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { guestMiddleware } = require('../middleware/auth');

// POST /api/chat/message - Send a chat message
router.post('/message', guestMiddleware, chatController.sendMessage);

// GET /api/chat/conversations - Get user's conversations
router.get('/conversations', guestMiddleware, async (req, res) => {
  try {
    // Guests don't have persisted conversations. Return an empty list early to avoid
    // casting errors when req.user.id is a non-ObjectId (eg. 'guest-user').
    if (req.user?.role === 'guest') {
      return res.json({ success: true, conversations: [] });
    }

    const Conversation = require('../models/Conversation');
    const conversations = await Conversation.findRecentByUser(req.user.id, 20);

    res.json({
      success: true,
      conversations: conversations.map(conv => ({
        id: conv._id,
        title: conv.title,
        lastMessage: conv.lastMessagePreview,
        lastActivity: conv.lastActivity,
        messageCount: conv.messageCount
      }))
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Failed to get conversations' });
  }
});

// GET /api/chat/conversation/:id - Get specific conversation
router.get('/conversation/:id', guestMiddleware, async (req, res) => {
  try {
    const Conversation = require('../models/Conversation');
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation: {
        id: conversation._id,
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        lastActivity: conversation.lastActivity
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to get conversation' });
  }
});

module.exports = router;