const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'News title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'News content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  audience: {
    type: String,
    enum: {
      values: ['everyone', 'students_only', 'staff_only', 'department_specific', 'course_specific'],
      message: 'Audience must be one of: everyone, students_only, staff_only, department_specific, course_specific'
    },
    required: [true, 'Audience is required']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: {
      values: ['high', 'medium', 'low'],
      message: 'Priority must be high, medium, or low'
    },
    default: 'medium'
  },
  expiresAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
newsSchema.index({ audience: 1 });
newsSchema.index({ department: 1 });
newsSchema.index({ courses: 1 });
newsSchema.index({ active: 1 });
newsSchema.index({ createdAt: -1 });
newsSchema.index({ authorId: 1 });

// Virtual for author info
newsSchema.virtual('authorInfo').get(async function() {
  if (this.populated('authorId')) {
    return {
      id: this.authorId._id,
      name: this.authorId.name,
      role: this.authorId.role
    };
  }
  return null;
});

// Static method to get news for a specific user
newsSchema.statics.getNewsForUser = function(userId, userRole, departmentId = null, courseIds = [], userTags = []) {
  const query = { active: true };

  switch (userRole) {
    case 'system_admin':
    case 'bursary_admin':
      // These admins can see all news
      break;

    case 'departmental_admin':
      // Can see department news and general news
      query.$or = [
        { audience: 'everyone' },
        { audience: 'staff_only' },
        { audience: 'department_specific', department: departmentId }
      ];
      break;

    case 'lecturer_admin':
      // Can see course news, department news, and general news
      query.$or = [
        { audience: 'everyone' },
        { audience: 'staff_only' },
        { audience: 'department_specific', department: departmentId },
        { audience: 'course_specific', courses: { $in: courseIds } }
      ];
      break;

    case 'staff':
      // Can see staff news and general news
      query.$or = [
        { audience: 'everyone' },
        { audience: 'staff_only' },
        { audience: 'department_specific', department: departmentId }
      ];
      break;

    case 'student':
      // Can see student news, department news, course news, and general news
      query.$or = [
        { audience: 'everyone' },
        { audience: 'students_only' },
        { audience: 'department_specific', department: departmentId },
        { audience: 'course_specific', courses: { $in: courseIds } }
      ];
      break;

    case 'guest':
      // Can only see general news
      query.audience = 'everyone';
      break;

    default:
      // Default to general news only
      query.audience = 'everyone';
  }

  // Apply tag filtering: if userTags provided, allow items with empty tags or tags that intersect userTags
  if (Array.isArray(userTags) && userTags.length > 0) {
    const tagFilter = { $or: [ { tags: { $exists: false } }, { tags: { $size: 0 } }, { tags: { $in: userTags } } ] };
    query.$and = query.$and || [];
    query.$and.push(tagFilter);
  }

  return this.find(query)
    .populate('authorId', 'name role')
    .populate('department', 'name')
    .populate('courses', 'code title')
    .sort({ createdAt: -1 })
    .limit(50);
};

// Pre-save middleware to update updatedAt
newsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('News', newsSchema);