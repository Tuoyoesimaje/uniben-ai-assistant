const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: function(arr) {
        return arr.length === 4 && arr.every(opt => opt && opt.trim().length > 0);
      },
      message: 'Must have exactly 4 non-empty options'
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    enum: {
      values: ['A', 'B', 'C', 'D'],
      message: 'Correct answer must be A, B, C, or D'
    }
  },
  hint: {
    type: String,
    trim: true,
    maxlength: [200, 'Hint cannot exceed 200 characters']
  },
  explanation: {
    type: String,
    required: [true, 'Explanation is required'],
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Difficulty must be easy, medium, or hard'
    },
    default: 'medium'
  },
  topic: {
    type: String,
    trim: true,
    maxlength: [100, 'Topic cannot exceed 100 characters']
  },
  points: {
    type: Number,
    default: 1,
    min: [1, 'Points must be at least 1']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'Quiz title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Quiz description cannot exceed 500 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  source: {
    type: String,
    enum: {
      values: ['pdf', 'text', 'manual', 'generated'],
      message: 'Source must be pdf, text, manual, or generated'
    },
    required: [true, 'Source is required']
  },
  questions: {
    type: [questionSchema],
    required: [true, 'Questions are required'],
    validate: {
      validator: function(arr) {
        return arr.length > 0 && arr.length <= 50;
      },
      message: 'Quiz must have between 1 and 50 questions'
    }
  },
  timeLimit: {
    type: Number,
    default: 1200, // 20 minutes in seconds
    min: [60, 'Time limit must be at least 1 minute'],
    max: [7200, 'Time limit cannot exceed 2 hours']
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'hard', 'mixed'],
      message: 'Difficulty must be easy, medium, hard, or mixed'
    },
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Quiz results and analytics
  results: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be negative']
    },
    percentage: {
      type: Number,
      required: true,
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100']
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: [0, 'Correct answers cannot be negative']
    },
    incorrectAnswers: {
      type: Number,
      required: true,
      min: [0, 'Incorrect answers cannot be negative']
    },
    timeSpent: {
      type: Number,
      required: true,
      min: [0, 'Time spent cannot be negative']
    },
    answers: [{
      questionIndex: {
        type: Number,
        required: true
      },
      selectedAnswer: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D']
      },
      isCorrect: {
        type: Boolean,
        required: true
      },
      attempts: {
        type: Number,
        default: 1,
        min: [1, 'Attempts must be at least 1']
      },
      timeSpent: {
        type: Number,
        default: 0,
        min: [0, 'Time spent cannot be negative']
      }
    }],
    hintsUsed: {
      type: Number,
      default: 0,
      min: [0, 'Hints used cannot be negative']
    },
    explanationsUsed: {
      type: Number,
      default: 0,
      min: [0, 'Explanations used cannot be negative']
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    grade: {
      type: String,
      enum: {
        values: ['A', 'B', 'C', 'D', 'F'],
        message: 'Grade must be A, B, C, D, or F'
      }
    }
  }],

  // Quiz statistics
  totalAttempts: {
    type: Number,
    default: 0,
    min: [0, 'Total attempts cannot be negative']
  },
  averageScore: {
    type: Number,
    default: 0,
    min: [0, 'Average score cannot be negative'],
    max: [100, 'Average score cannot exceed 100']
  },
  averageTime: {
    type: Number,
    default: 0,
    min: [0, 'Average time cannot be negative']
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
quizSchema.index({ userId: 1, createdAt: -1 });
quizSchema.index({ course: 1 });
quizSchema.index({ department: 1 });
quizSchema.index({ isPublic: 1, isActive: 1 });
quizSchema.index({ difficulty: 1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ 'results.userId': 1 });

// Virtual for total points possible
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
});

// Virtual for average difficulty
quizSchema.virtual('averageDifficulty').get(function() {
  const difficulties = { easy: 1, medium: 2, hard: 3 };
  const total = this.questions.reduce((sum, q) => sum + difficulties[q.difficulty], 0);
  return total / this.questions.length;
});

// Virtual for completion rate
quizSchema.virtual('completionRate').get(function() {
  if (this.totalAttempts === 0) return 0;
  const completed = this.results.filter(r => r.completedAt).length;
  return (completed / this.totalAttempts) * 100;
});

// Static method to find public quizzes
quizSchema.statics.findPublic = function() {
  return this.find({ isPublic: true, isActive: true })
    .populate('course', 'code title')
    .populate('department', 'name')
    .sort({ createdAt: -1 });
};

// Static method to find user's quizzes
quizSchema.statics.findByUser = function(userId) {
  return this.find({ userId, isActive: true })
    .sort({ createdAt: -1 });
};

// Static method to get quiz statistics
quizSchema.statics.getStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        totalQuestions: { $sum: { $size: '$questions' } },
        totalAttempts: { $sum: '$totalAttempts' },
        averageScore: { $avg: '$averageScore' },
        publicQuizzes: {
          $sum: { $cond: ['$isPublic', 1, 0] }
        }
      }
    }
  ]);
};

// Pre-save middleware to update updatedAt and calculate statistics
quizSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Calculate average score and time
  if (this.results && this.results.length > 0) {
    const totalScore = this.results.reduce((sum, result) => sum + result.score, 0);
    const totalTime = this.results.reduce((sum, result) => sum + result.timeSpent, 0);

    this.averageScore = totalScore / this.results.length;
    this.averageTime = totalTime / this.results.length;
    this.totalAttempts = this.results.length;
  }

  next();
});

module.exports = mongoose.model('Quiz', quizSchema);