const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: [true, 'Message role is required'],
    enum: {
      values: ['user', 'assistant', 'system'],
      message: 'Role must be user, assistant, or system'
    }
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [5000, 'Message content cannot exceed 5000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  functionCalls: [{
    name: {
      type: String,
      required: true
    },
    args: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    response: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Conversation title cannot exceed 200 characters']
  },
  messages: {
    type: [messageSchema],
    required: [true, 'Messages are required'],
    validate: {
      validator: function(arr) {
        return arr.length > 0;
      },
      message: 'Conversation must have at least one message'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },

  // Conversation analytics
  messageCount: {
    type: Number,
    default: 0,
    min: [0, 'Message count cannot be negative']
  },
  userMessageCount: {
    type: Number,
    default: 0,
    min: [0, 'User message count cannot be negative']
  },
  assistantMessageCount: {
    type: Number,
    default: 0,
    min: [0, 'Assistant message count cannot be negative']
  },
  functionCallCount: {
    type: Number,
    default: 0,
    min: [0, 'Function call count cannot be negative']
  },
  averageResponseTime: {
    type: Number,
    default: 0,
    min: [0, 'Average response time cannot be negative']
  },

  // Topics and categories
  topics: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: {
      values: ['general', 'academic', 'navigation', 'course_info', 'department_info', 'building_info', 'other'],
      message: 'Category must be one of the predefined values'
    },
    default: 'general'
  },

  // User feedback
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Feedback cannot exceed 500 characters']
  },

  // Session information
  sessionId: {
    type: String,
    trim: true,
    maxlength: [100, 'Session ID cannot exceed 100 characters']
  },
  userAgent: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, lastActivity: -1 });
conversationSchema.index({ isActive: 1, lastActivity: -1 });
conversationSchema.index({ category: 1 });
conversationSchema.index({ topics: 1 });
conversationSchema.index({ rating: 1 });

// Virtual for conversation duration
conversationSchema.virtual('duration').get(function() {
  if (this.messages.length < 2) return 0;
  const firstMessage = this.messages[0].timestamp;
  const lastMessage = this.messages[this.messages.length - 1].timestamp;
  return Math.floor((lastMessage - firstMessage) / 1000); // in seconds
});

// Virtual for conversation summary
conversationSchema.virtual('summary').get(function() {
  const firstUserMessage = this.messages.find(m => m.role === 'user');
  if (firstUserMessage) {
    return firstUserMessage.content.substring(0, 100) + (firstUserMessage.content.length > 100 ? '...' : '');
  }
  return 'New conversation';
});

// Virtual for last message preview
conversationSchema.virtual('lastMessagePreview').get(function() {
  const lastMessage = this.messages[this.messages.length - 1];
  if (lastMessage) {
    return lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '');
  }
  return '';
});

// Static method to find recent conversations for a user
conversationSchema.statics.findRecentByUser = function(userId, limit = 20) {
  return this.find({ userId, isActive: true })
    .sort({ lastActivity: -1 })
    .limit(limit);
};

// Static method to find conversations by category
conversationSchema.statics.findByCategory = function(category, userId = null) {
  const query = { category, isActive: true };
  if (userId) query.userId = userId;
  return this.find(query).sort({ lastActivity: -1 });
};

// Static method to search conversations
conversationSchema.statics.searchConversations = function(userId, searchTerm) {
  return this.find({
    userId,
    isActive: true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { 'messages.content': { $regex: searchTerm, $options: 'i' } },
      { topics: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  }).sort({ lastActivity: -1 });
};

// Static method to get conversation statistics
conversationSchema.statics.getStats = function(userId = null) {
  const matchStage = userId ? { userId } : {};

  return this.aggregate([
    { $match: { ...matchStage, isActive: true } },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        totalMessages: { $sum: '$messageCount' },
        totalFunctionCalls: { $sum: '$functionCallCount' },
        averageRating: { $avg: '$rating' },
        categoryBreakdown: {
          $push: '$category'
        }
      }
    },
    {
      $project: {
        totalConversations: 1,
        totalMessages: 1,
        totalFunctionCalls: 1,
        averageRating: { $round: ['$averageRating', 2] },
        categoryBreakdown: 1
      }
    }
  ]);
};

// Pre-save middleware to update timestamps and counters
conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastActivity = new Date();

  // Update message counts
  this.messageCount = this.messages.length;
  this.userMessageCount = this.messages.filter(m => m.role === 'user').length;
  this.assistantMessageCount = this.messages.filter(m => m.role === 'assistant').length;
  this.functionCallCount = this.messages.reduce((total, msg) => {
    return total + (msg.functionCalls ? msg.functionCalls.length : 0);
  }, 0);

  // Extract topics from messages (simple keyword extraction)
  if (this.messages.length > 0) {
    const userMessages = this.messages.filter(m => m.role === 'user');
    const allText = userMessages.map(m => m.content).join(' ').toLowerCase();

    // Simple topic extraction based on keywords
    const topics = [];
    if (allText.includes('course') || allText.includes('class')) topics.push('course');
    if (allText.includes('building') || allText.includes('location') || allText.includes('where')) topics.push('navigation');
    if (allText.includes('department') || allText.includes('faculty')) topics.push('department');
    if (allText.includes('quiz') || allText.includes('exam') || allText.includes('test')) topics.push('quiz');

    this.topics = [...new Set(topics)]; // Remove duplicates
  }

  // Auto-generate title if not provided
  if (!this.title && this.messages.length > 0) {
    const firstUserMessage = this.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      this.title = firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
    }
  }

  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);