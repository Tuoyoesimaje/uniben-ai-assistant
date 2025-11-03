const express = require('express');
const router = express.Router();
const { chat, getFallbackResponse } = require('../services/geminiService');
const { guestMiddleware } = require('../middleware/auth');

// Simple debug endpoint to test Gemini responses without going through the full chat flow
// POST /api/debug/gemini-test { message: string, conversationHistory?: [] }
router.post('/gemini-test', guestMiddleware, async (req, res) => {
  try {
    // Allow this only in development to avoid exposing debug info in production
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ success: false, message: 'Debug endpoint disabled in production' });
    }

    const { message, conversationHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Call the chat service directly and return raw output for debugging
    const result = await chat(message, conversationHistory || []);

    return res.json({ success: true, raw: result });
  } catch (error) {
    console.error('Debug gemini-test error:', error);
    res.status(500).json({ success: false, message: 'Failed to call Gemini', error: error.message });
  }
});

module.exports = router;
