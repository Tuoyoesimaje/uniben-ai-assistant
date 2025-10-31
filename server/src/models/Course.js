const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2,4}\s?\d{3,4}[A-Z]?$/, 'Please enter a valid course code (e.g., CSC 201, MATH101)']
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Course description cannot exceed 1000 characters']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Owning department is required']
  },
  departments_offering: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  departments_offering: [{
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    level: {
      type: Number,
      required: true,
      min: [100, 'Level must be at least 100'],
      max: [800, 'Level cannot exceed 800']
    },
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    schedule: {
      type: String,
      trim: true
    },
    semester: {
      type: String,
      enum: ['first', 'second', 'both'],
      default: 'both'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  faculty: {
    type: String,
    required: [true, 'Faculty is required'],
    trim: true
  },
  level: {
    type: Number,
    required: [true, 'Course level is required'],
    min: [100, 'Course level must be at least 100'],
    max: [800, 'Course level cannot exceed 800']
  },
  credit: {
    type: Number,
    required: [true, 'Credit hours are required'],
    min: [1, 'Credit hours must be at least 1'],
    max: [6, 'Credit hours cannot exceed 6']
  },
  semester: {
    type: String,
    enum: {
      values: ['first', 'second', 'both'],
      message: 'Semester must be first, second, or both'
    },
    default: 'both'
  },
  prerequisites: [{
    type: String,
    trim: true,
    uppercase: true
  }],
  corequisites: [{
    type: String,
    trim: true,
    uppercase: true
  }],
  lecturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lecturer: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Lecturer name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    office: {
      type: String,
      trim: true,
      maxlength: [100, 'Office location cannot exceed 100 characters']
    },
    officeHours: {
      type: String,
      trim: true,
      maxlength: [200, 'Office hours cannot exceed 200 characters']
    }
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  syllabus: {
    objectives: [{
      type: String,
      trim: true
    }],
    topics: [{
      type: String,
      trim: true
    }],
    textbooks: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      author: {
        type: String,
        required: true,
        trim: true
      },
      isbn: {
        type: String,
        trim: true
      }
    }],
    assessment: {
      type: String,
      trim: true,
      maxlength: [500, 'Assessment description cannot exceed 500 characters']
    },
    gradingScheme: {
      type: String,
      trim: true,
      maxlength: [500, 'Grading scheme cannot exceed 500 characters']
    }
  },
  schedule: {
    type: String,
    trim: true,
    maxlength: [500, 'Schedule cannot exceed 500 characters']
  },
  announcements: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Announcement title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Announcement content cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  resources: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['video', 'article', 'book', 'website', 'tutorial'],
      required: true
    },
    url: {
      type: String,
      required: true,
      trim: true,
      match: [/^https?:\/\/.+/, 'URL must start with http:// or https://']
    },
    description: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    }
  }],
  difficulty: {
    type: String,
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: 'Difficulty must be beginner, intermediate, or advanced'
    },
    default: 'intermediate'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  enrollmentCount: {
    type: Number,
    default: 0,
    min: [0, 'Enrollment count cannot be negative']
  },
  baseCourseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  venue: {
    type: String,
    trim: true,
    maxlength: [100, 'Venue cannot exceed 100 characters']
  },
  maxStudents: {
    type: Number,
    min: [1, 'Maximum students must be at least 1']
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
courseSchema.index({ code: 1 });
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ department: 1 });
courseSchema.index({ departments_offering: 1 });
courseSchema.index({ faculty: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ credit: 1 });
courseSchema.index({ difficulty: 1 });
courseSchema.index({ isActive: 1 });

// Virtual for course identifier
courseSchema.virtual('identifier').get(function() {
  return `${this.code}: ${this.title}`;
});

// Virtual for full course info
courseSchema.virtual('fullInfo').get(function() {
  return {
    code: this.code,
    title: this.title,
    department: this.department,
    faculty: this.faculty,
    level: this.level,
    credit: this.credit,
    lecturer: this.lecturer?.name
  };
});

// Static method to find courses by level
courseSchema.statics.findByLevel = function(level) {
  return this.find({ level, isActive: true }).populate('department', 'name faculty');
};

// Static method to find courses by department
courseSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId, isActive: true });
};

// Static method to search courses
courseSchema.statics.searchCourses = function(searchTerm) {
  return this.find({
    $or: [
      { code: { $regex: searchTerm, $options: 'i' } },
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ],
    isActive: true
  }).populate('department', 'name faculty').limit(20);
};

// Pre-save middleware to update updatedAt
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Course', courseSchema);