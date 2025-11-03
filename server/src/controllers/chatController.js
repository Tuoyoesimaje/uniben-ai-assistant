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
    
    // Log detailed error information for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userId: req.user?.id,
      role: req.user?.role
    });
    
    // Provide user-friendly error messages based on error type
    let userMessage = 'Sorry, I encountered an error. Please try again.';
    
    if (error.message && error.message.includes('API key')) {
      userMessage = 'AI service is temporarily unavailable. Please contact administrator to configure the API key.';
    } else if (error.message && error.message.includes('quota')) {
      userMessage = 'AI service is busy. Please try again in a moment.';
    } else if (error.message && error.message.includes('database')) {
      userMessage = 'Database connection issue. Please try again later.';
    }
    
    res.status(500).json({
      success: false,
      message: userMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};