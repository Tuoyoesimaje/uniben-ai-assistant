const { chat } = require('../services/geminiService');
const Conversation = require('../models/Conversation');

exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    // Get conversation history if exists
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    const history = conversation?.messages || [];

    // Call Gemini
    const result = await chat(message, history);

    // Save conversation - handle guest users differently
    if (!conversation) {
      if (req.user.role === 'guest') {
        // For guests, don't save to database, just return response
        return res.json({
          success: true,
          conversationId: null,
          message: result.text,
          hasLocation: result.functionCalls?.some(
            call => call.name === 'queryDatabase' && call.args.queryType === 'building'
          ),
          functionCalls: result.functionCalls
        });
      } else {
        conversation = new Conversation({
          userId: userId,
          messages: []
        });
      }
    }

    // For existing conversations, only save if user is not guest
    if (req.user.role === 'guest') {
      return res.json({
        success: true,
        conversationId: null,
        message: result.text,
        hasLocation: result.functionCalls?.some(
          call => call.name === 'queryDatabase' && call.args.queryType === 'building'
        ),
        functionCalls: result.functionCalls
      });
    }

    // Only add messages if they have content
    if (message && message.trim()) {
      conversation.messages.push({ role: 'user', content: message.trim() });
    }
    if (result.text && result.text.trim()) {
      conversation.messages.push({ role: 'assistant', content: result.text.trim() });
    }

    await conversation.save();

    // Check if response contains building location
    const hasLocation = result.functionCalls?.some(
      call => call.name === 'queryDatabase' && call.args.queryType === 'building'
    );

    res.json({
      success: true,
      conversationId: conversation._id,
      message: result.text,
      hasLocation,
      functionCalls: result.functionCalls
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to process message' });
  }
};