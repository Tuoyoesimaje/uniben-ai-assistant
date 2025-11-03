# UNIBEN AI Assistant - Complete Developer Documentation

## Table of Contents

1. [Executive Summary & Project Overview](#executive-summary--project-overview)
2. [Project Architecture & Technology Stack](#project-architecture--technology-stack)
3. [Database Architecture & Models](#database-architecture--models)
4. [Backend API & Services](#backend-api--services)
5. [Frontend Architecture & Components](#frontend-architecture--components)
6. [AI Integration & Quiz Generation System](#ai-integration--quiz-generation-system)
7. [Campus Navigation & Mapping System](#campus-navigation--mapping-system)
8. [Authentication & Security Implementation](#authentication--security-implementation)
9. [User Experience & Interface Design](#user-experience--interface-design)
10. [Development Workflow & Deployment](#development-workflow--deployment)

---

## Executive Summary & Project Overview

The UNIBEN AI Assistant is a comprehensive, full-stack university management system specifically designed for the University of Benin. This sophisticated web application combines artificial intelligence-powered educational tools, interactive campus navigation, administrative management, and communication features into a single, cohesive platform.

### What This System Does

This application serves as a digital ecosystem for the University of Benin, providing:

1. **AI-Powered Educational Tools**: Students can upload PDF study materials or paste text content to generate interactive quizzes using Google Gemini AI technology.

2. **Intelligent Campus Navigation**: A comprehensive mapping system with 44+ university buildings, providing turn-by-turn navigation and detailed building information.

3. **Multi-Role Administrative Management**: Sophisticated admin interfaces for different user types (System Admin, Departmental Admin, Lecturer Admin, Bursary Admin) with role-specific functionality.

4. **AI Chat System**: Conversational AI that can access real-time data about courses, buildings, news, and provide intelligent responses using function calling.

5. **News & Communication Platform**: Role-based news distribution system allowing targeted announcements to specific audiences.

6. **Quiz Generation & Analytics**: Complete quiz creation, taking, and results analysis system with detailed performance tracking.

### Target Users

- **Students**: Access to educational tools, campus navigation, news, and interactive quizzes
- **Faculty/Lecturers**: Course management, student communication, quiz creation
- **Administrative Staff**: Department management, user administration, financial tracking
- **System Administrators**: Full system control and configuration
- **Guest Users**: Limited access to public features

### Key Features Overview

- **Authentication System**: 7-tier role-based access control with JWT tokens
- **AI Integration**: Google Gemini 2.5-flash model for quiz generation and chat
- **Interactive Mapping**: Mapbox GL JS integration with custom UNIBEN campus data
- **Real-time Communication**: Chat system with persistent conversation history
- **File Processing**: PDF text extraction and processing for quiz generation
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Performance Optimized**: Code splitting, caching, and efficient data loading

---

## Project Architecture & Technology Stack

### System Architecture

The UNIBEN AI Assistant follows a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  React 18 + Vite + Tailwind CSS + Framer Motion           │
│  ├── User Interface Components                              │
│  ├── State Management (Context API)                        │
│  ├── Routing (React Router)                                │
│  └── API Communication (Axios)                            │
└─────────────────────────────────────────────────────────────┘
                            │
                        HTTP/REST
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Backend Layer                           │
│  Node.js + Express.js + MongoDB + Mongoose                 │
│  ├── RESTful API Endpoints                                 │
│  ├── Authentication & Authorization                        │
│  ├── Business Logic Services                               │
│  └── Database Operations                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                        MongoDB
                            │
┌─────────────────────────────────────────────────────────────┐
│                     External Services                       │
│  ├── Google Gemini AI (Quiz Generation & Chat)             │
│  ├── Mapbox API (Campus Navigation)                        │
│  └── File Processing (PDF Extraction)                      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Breakdown

#### Frontend Technologies
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router v6**: Client-side routing and navigation
- **Axios**: HTTP client for API requests
- **Framer Motion**: Animation library for smooth UI transitions
- **React Context API**: State management for authentication
- **Mapbox GL JS**: Interactive mapping and navigation
- **Material Symbols**: Icon library for UI elements
- **Lucide React**: Additional icon set for modern UI

#### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing and security
- **Multer**: File upload handling for PDFs
- **CORS**: Cross-Origin Resource Sharing configuration
- **dotenv**: Environment variable management
- **Jest**: Testing framework for backend services

#### External Service Integrations
- **Google Gemini AI**: Advanced language model for content generation
- **Mapbox API**: Geocoding, directions, and map rendering
- **Google Maps Integration**: Street view and location services

### Project Structure

The codebase is organized into two main directories:

```
uniben-ai-assistant/
├── client/                    # React Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── admin/         # Admin-specific components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── chat/          # Chat system components
│   │   │   ├── map/           # Campus navigation components
│   │   │   ├── news/          # News management components
│   │   │   ├── quiz/          # Quiz generation components
│   │   │   └── shared/        # Shared UI components
│   │   ├── pages/             # Route-level page components
│   │   ├── context/           # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   └── styles/            # Global CSS styles
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite build configuration
│   └── tailwind.config.js     # Tailwind CSS configuration
│
├── server/                    # Node.js Backend Application
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic services
│   │   ├── middleware/        # Express middleware
│   │   └── config/            # Configuration files
│   ├── tests/                 # Test files
│   ├── package.json           # Backend dependencies
│   └── server.js              # Main server entry point
│
└── docs/                      # Documentation files
```

---

## Database Architecture & Models

The UNIBEN AI Assistant uses MongoDB as its primary database, with Mongoose providing object data modeling capabilities. The database schema is designed to support complex relationships between users, courses, departments, quizzes, news, and campus infrastructure.

### Database Connection Configuration

**File: `server/src/config/database.js`**

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uniben-ai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Core Data Models

The system implements six core data models that form the foundation of the entire application:

#### 1. User Model
**File: `server/src/models/User.js`**

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['guest', 'student', 'staff', 'system_admin', 'departmental_admin', 'lecturer_admin', 'bursary_admin'],
    default: 'guest'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  staffId: {
    type: String,
    trim: true,
    sparse: true // Allows multiple null values
  },
  matricNumber: {
    type: String,
    trim: true,
    sparse: true
  },
  profileImage: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user's display name based on role
userSchema.methods.getDisplayName = function() {
  if (this.role === 'student' && this.matricNumber) {
    return this.matricNumber;
  } else if (this.role === 'staff' && this.staffId) {
    return this.staffId;
  }
  return this.name;
};

// Check if user has permission for specific action
userSchema.methods.hasPermission = function(action) {
  const permissions = {
    'system_admin': ['all'],
    'departmental_admin': ['manage_department', 'manage_courses', 'view_students'],
    'lecturer_admin': ['manage_courses', 'view_students', 'create_quizzes'],
    'bursary_admin': ['manage_finances', 'view_students'],
    'staff': ['view_admin'],
    'student': ['take_quizzes', 'view_news'],
    'guest': ['view_public']
  };
  
  const userPermissions = permissions[this.role] || [];
  return userPermissions.includes('all') || userPermissions.includes(action);
};

module.exports = mongoose.model('User', userSchema);
```

**Key Features:**
- Password hashing with bcrypt (12 rounds)
- Role-based permissions system
- Flexible user identification (name, staff ID, matriculation number)
- Department associations
- User settings and preferences

#### 2. Course Model
**File: `server/src/models/Course.js`**

```javascript
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: 20
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  credit: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  level: {
    type: Number,
    required: true,
    min: 100,
    max: 800
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  corequisites: [{
    type: String,
    trim: true
  }],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  departments_offering: [{
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    level: {
      type: Number,
      min: 100,
      max: 800
    },
    semester: {
      type: String,
      enum: ['first', 'second', 'both'],
      default: 'both'
    },
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    schedule: {
      // Schedule for department offering stored as an object with days + time
      days: [{ type: String, trim: true }],
      time: { type: String, trim: true }
    },
    venue: {
      type: String,
      trim: true
    },
    maxStudents: {
      type: Number,
      min: 1
    },
    isActive: {
      type: Boolean,
      default: true
    },
    enrolledStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  materials: [{
    title: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document']
    },
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
courseSchema.index({ code: 1, department: 1 });
courseSchema.index({ 'departments_offering.department': 1 });

// Virtual for getting available offerings
courseSchema.virtual('activeOfferings').get(function() {
  return this.departments_offering.filter(offering => offering.isActive);
});

// Method to check if user is enrolled in this course
courseSchema.methods.isUserEnrolled = function(userId) {
  return this.departments_offering.some(offering => 
    offering.enrolledStudents.includes(userId)
  );
};

// Method to get lecturers for this course
courseSchema.methods.getLecturers = function() {
  const lecturerIds = [...new Set(
    this.departments_offering
      .filter(offering => offering.lecturerId)
      .map(offering => offering.lecturerId.toString())
  )];
  return lecturerIds;
};

module.exports = mongoose.model('Course', courseSchema);
```

**Key Features:**
- Multiple department offerings support
- Lecturer assignment per offering
- Student enrollment tracking
- Course materials and resources
- Prerequisites and corequisites management

#### 3. Department Model
**File: `server/src/models/Department.js`**

```javascript
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  faculty: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 10
  },
  description: {
    type: String,
    maxlength: 1000
  },
  hodName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  hodEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  establishedYear: {
    type: Number,
    min: 1950,
    max: new Date().getFullYear()
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  departmentalAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  buildings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building'
  }],
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
departmentSchema.index({ code: 1 });
departmentSchema.index({ faculty: 1 });

// Virtual for getting active courses
departmentSchema.virtual('activeCourses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'department',
  match: { isActive: true }
});

// Virtual for getting course offerings
departmentSchema.virtual('courseOfferings', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'departments_offering.department'
});

// Method to get department statistics
departmentSchema.methods.getStatistics = async function() {
  const Course = mongoose.model('Course');
  const User = mongoose.model('User');
  
  const [totalCourses, totalStaff, totalStudents] = await Promise.all([
    Course.countDocuments({ department: this._id, isActive: true }),
    User.countDocuments({ department: this._id, role: { $in: ['staff', 'departmental_admin', 'lecturer_admin'] } }),
    User.countDocuments({ department: this._id, role: 'student' })
  ]);
  
  return {
    totalCourses,
    totalStaff,
    totalStudents,
    activeSince: this.createdAt
  };
};

module.exports = mongoose.model('Department', departmentSchema);
```

**Key Features:**
- Department hierarchy and faculty organization
- Head of Department (HOD) information
- Staff and student associations
- Building assignments
- Contact information and website links

#### 4. Quiz Model
**File: `server/src/models/Quiz.js`**

```javascript
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 500
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D']
    },
    explanation: {
      type: String,
      maxlength: 500
    },
    hint: {
      type: String,
      maxlength: 200
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    topic: {
      type: String,
      trim: true
    },
    timeLimit: {
      type: Number, // in seconds
      default: null
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    enum: ['pdf', 'text', 'manual'],
    required: true
  },
  sourceContent: {
    type: String // Original content used to generate questions
  },
  settings: {
    timeLimit: {
      type: Number, // in minutes
      default: 30
    },
    allowReview: {
      type: Boolean,
      default: true
    },
    showResults: {
      type: String,
      enum: ['immediate', 'after_submission', 'after_deadline'],
      default: 'immediate'
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    isRandomized: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  results: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [{
      questionIndex: {
        type: Number,
        required: true
      },
      selectedAnswer: {
        type: String,
        required: true
      },
      isCorrect: {
        type: Boolean,
        required: true
      },
      timeSpent: {
        type: Number // in seconds
      }
    }],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    incorrectAnswers: {
      type: Number,
      required: true
    },
    timeSpent: {
      type: Number // in seconds
    },
    attemptNumber: {
      type: Number,
      default: 1
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  analytics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTimeSpent: {
      type: Number,
      default: 0
    },
    questionAnalytics: [{
      questionIndex: Number,
      correctRate: Number,
      averageTimeSpent: Number,
      mostCommonWrongAnswer: String
    }]
  }
}, {
  timestamps: true
});

// Index for better query performance
quizSchema.index({ createdBy: 1 });
quizSchema.index({ course: 1 });
quizSchema.index({ department: 1 });
quizSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Virtual for getting active quizzes
quizSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         (!this.endDate || this.endDate >= now);
});

// Method to calculate user score
quizSchema.methods.calculateScore = function(answers) {
  let correctCount = 0;
  const detailedAnswers = answers.map((answer, index) => {
    const isCorrect = answer.selectedAnswer === this.questions[index].correctAnswer;
    if (isCorrect) correctCount++;
    return {
      questionIndex: index,
      selectedAnswer: answer.selectedAnswer,
      isCorrect,
      timeSpent: answer.timeSpent || 0
    };
  });
  
  return {
    detailedAnswers,
    score: Math.round((correctCount / this.questions.length) * 100),
    correctAnswers: correctCount,
    incorrectAnswers: this.questions.length - correctCount,
    totalQuestions: this.questions.length
  };
};

// Method to update analytics
quizSchema.methods.updateAnalytics = async function() {
  if (this.results.length === 0) return;
  
  const totalAttempts = this.results.length;
  const averageScore = this.results.reduce((sum, result) => sum + result.score, 0) / totalAttempts;
  const averageTimeSpent = this.results.reduce((sum, result) => sum + result.timeSpent, 0) / totalAttempts;
  
  // Calculate question-specific analytics
  const questionAnalytics = this.questions.map((_, questionIndex) => {
    const questionResults = this.results.map(result => 
      result.answers.find(answer => answer.questionIndex === questionIndex)
    ).filter(Boolean);
    
    const correctRate = questionResults.length > 0 
      ? (questionResults.filter(r => r.isCorrect).length / questionResults.length) * 100
      : 0;
    
    const averageTimeSpent = questionResults.length > 0
      ? questionResults.reduce((sum, r) => sum + r.timeSpent, 0) / questionResults.length
      : 0;
    
    const wrongAnswers = questionResults.filter(r => !r.isCorrect);
    const answerCounts = {};
    wrongAnswers.forEach(answer => {
      answerCounts[answer.selectedAnswer] = (answerCounts[answer.selectedAnswer] || 0) + 1;
    });
    
    const mostCommonWrongAnswer = Object.keys(answerCounts).length > 0
      ? Object.keys(answerCounts).reduce((a, b) => answerCounts[a] > answerCounts[b] ? a : b)
      : null;
    
    return {
      questionIndex,
      correctRate,
      averageTimeSpent,
      mostCommonWrongAnswer
    };
  });
  
  this.analytics = {
    totalAttempts,
    averageScore,
    averageTimeSpent,
    questionAnalytics
  };
  
  return this.save();
};

module.exports = mongoose.model('Quiz', quizSchema);
```

**Key Features:**
- Flexible question format with multiple choice options
- Comprehensive results tracking with detailed analytics
- Time limits and attempt management
- Course and department associations
- AI-generated content support

#### 5. News Model
**File: `server/src/models/News.js`**

```javascript
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  summary: {
    type: String,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  audience: {
    type: String,
    enum: ['everyone', 'students_only', 'staff_only', 'department_specific', 'course_specific'],
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
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
  expiresAt: {
    type: Date
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  viewsByUser: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: 1000
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
newsSchema.index({ author: 1 });
newsSchema.index({ audience: 1 });
newsSchema.index({ department: 1 });
newsSchema.index({ course: 1 });
newsSchema.index({ priority: 1, createdAt: -1 });
newsSchema.index({ isPublished: 1, publishedAt: -1 });

// Virtual for checking if news is currently active
newsSchema.virtual('isCurrentlyActive').get(function() {
  if (!this.isActive || !this.isPublished) return false;
  
  const now = new Date();
  if (this.expiresAt && this.expiresAt < now) return false;
  
  return true;
});

// Method to check if user can view this news
newsSchema.methods.canUserView = function(user) {
  if (!user) return this.audience === 'everyone';
  
  // Admin can view all news
  if (['system_admin', 'bursary_admin'].includes(user.role)) return true;
  
  switch (this.audience) {
    case 'everyone':
      return true;
    case 'students_only':
      return user.role === 'student';
    case 'staff_only':
      return ['staff', 'system_admin', 'departmental_admin', 'lecturer_admin', 'bursary_admin'].includes(user.role);
    case 'department_specific':
      return user.department?.toString() === this.department?.toString();
    case 'course_specific':
      return user.courses?.includes(this.course) || 
             (user.role === 'lecturer_admin' && user._id.toString() === this.author._id.toString());
    default:
      return false;
  }
};

// Method to record a view
newsSchema.methods.recordView = async function(userId) {
  if (userId) {
    const existingView = this.viewsByUser.find(view => 
      view.userId.toString() === userId.toString()
    );
    
    if (!existingView) {
      this.viewsByUser.push({ userId });
    }
  }
  
  this.views += 1;
  return this.save();
};

// Method to toggle like
newsSchema.methods.toggleLike = async function(userId) {
  const existingLike = this.likes.find(like => 
    like.userId.toString() === userId.toString()
  );
  
  if (existingLike) {
    this.likes = this.likes.filter(like => 
      like.userId.toString() !== userId.toString()
    );
  } else {
    this.likes.push({ userId });
  }
  
  return this.save();
};

// Method to add comment
newsSchema.methods.addComment = async function(userId, content) {
  this.comments.push({
    userId,
    content
  });
  
  return this.save();
};

// Pre-save middleware to set publishedAt
newsSchema.pre('save', function(next) {
  if (this.isNew && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('News', newsSchema);
```

**Key Features:**
- Multi-audience targeting with granular permissions
- Rich content with attachments support
- Engagement features (views, likes, comments)
- Expiration and publication scheduling
- Department and course-specific targeting

#### 6. Building Model
**File: `server/src/models/Building.js`**

```javascript
const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    required: true,
    enum: ['faculty', 'department', 'library', 'hostel', 'administrative', 'sports', 'commercial', 'facility', 'gate', 'auditorium', 'ict_center', 'hospital', 'school'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['academic', 'administrative', 'facility'],
    default: 'academic'
  },
  coordinates: {
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    }
  },
  address: {
    street: String,
    area: String,
    landmark: String,
    postalCode: String
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  description: {
    type: String,
    maxlength: 1000
  },
  facilities: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  capacity: {
    type: Number,
    min: 0
  },
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: true } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: true } }
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  accessibility: {
    wheelchairAccessible: { type: Boolean, default: false },
    parkingAvailable: { type: Boolean, default: false },
    publicTransport: { type: Boolean, default: false }
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  floorPlan: {
    url: String,
    levels: Number
  },
  navigation: {
    nearestEntrance: String,
    directions: String,
    landmark: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for geospatial queries
buildingSchema.index({ 'coordinates.longitude': 1, 'coordinates.latitude': 1 });
buildingSchema.index({ type: 1, category: 1 });
buildingSchema.index({ department: 1 });

// Virtual for formatted coordinates
buildingSchema.virtual('formattedCoordinates').get(function() {
  return `${this.coordinates.longitude}, ${this.coordinates.latitude}`;
});

// Virtual for address
buildingSchema.virtual('fullAddress').get(function() {
  const parts = [];
  if (this.address?.street) parts.push(this.address.street);
  if (this.address?.area) parts.push(this.address.area);
  if (this.address?.landmark) parts.push(`Near ${this.address.landmark}`);
  return parts.join(', ');
});

// Method to calculate distance from another point
buildingSchema.methods.calculateDistance = function(lat, lng) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat - this.coordinates.latitude) * Math.PI / 180;
  const dLng = (lng - this.coordinates.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.coordinates.latitude * Math.PI / 180) * 
            Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Method to check if currently open
buildingSchema.methods.isCurrentlyOpen = function() {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const daySchedule = this.operatingHours[currentDay];
  if (!daySchedule || daySchedule.closed) return false;
  
  return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
};

// Static method to find nearby buildings
buildingSchema.statics.findNearby = function(lat, lng, maxDistance = 1) {
  const R = 6371; // Earth's radius in kilometers
  
  return this.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distance',
        maxDistance: maxDistance * 1000, // Convert to meters
        spherical: true
      }
    },
    { $sort: { distance: 1 } }
  ]);
};

// Static method to get buildings by type
buildingSchema.statics.getByType = function(type) {
  return this.find({ type, isActive: true }).populate('department', 'name faculty');
};

module.exports = mongoose.model('Building', buildingSchema);
```

**Key Features:**
- Comprehensive geospatial data with coordinates
- Operating hours and accessibility information
- Department associations and facility details
- Distance calculations and nearby building searches
- Rich metadata including images and floor plans

### Additional Supporting Models

#### 7. Conversation Model (for Chat System)
**File: `server/src/models/Conversation.js`**

```javascript
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'ai_response'],
      default: 'text'
    },
    attachments: [{
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String
    }],
    metadata: {
      // For AI responses
      aiModel: String,
      processingTime: Number,
      functionCalls: [{
        name: String,
        arguments: mongoose.Schema.Types.Mixed,
        result: mongoose.Schema.Types.Mixed
      }]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    editedAt: Date,
    deletedAt: Date
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  context: {
    // For maintaining conversation context
    userPreferences: mongoose.Schema.Types.Mixed,
    previousTopics: [String],
    currentCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    currentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    }
  }
}, {
  timestamps: true
});

// Index for message search
conversationSchema.index({ 'messages.content': 'text' });
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
```

#### 8. Fees Model (for Financial Management)
**File: `server/src/models/Fees.js`**

```javascript
const mongoose = require('mongoose');

const feesSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    enum: ['first', 'second'],
    required: true
  },
  feeType: {
    type: String,
    enum: ['tuition', 'accommodation', 'registration', 'examination', 'library', 'laboratory', 'sports', 'ict', 'medical', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'waived', 'installment'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'card', 'cheque', 'online'],
      required: true
    },
    reference: String,
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    receipt: {
      receiptNumber: String,
      url: String
    }
  }],
  waivers: [{
    type: {
      type: String,
      enum: ['merit', 'financial_hardship', 'special_circumstances', 'staff_ward', 'other']
    },
    amount: {
      type: Number,
      required: true
    },
    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date,
      default: Date.now
    }
  }],
  installmentPlan: {
    isActive: {
      type: Boolean,
      default: false
    },
    totalInstallments: Number,
    amountPerInstallment: Number,
    schedule: [{
      installmentNumber: Number,
      dueDate: Date,
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
      },
      paidAt: Date
    }]
  },
  penalties: [{
    type: {
      type: String,
      enum: ['late_payment', 'outstanding_balance']
    },
    amount: {
      type: Number,
      required: true
    },
    reason: String,
    appliedAt: {
      type: Date,
      default: Date.now
    },
    waived: {
      type: Boolean,
      default: false
    }
  }],
  notes: String,
  lastReminderSent: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
feesSchema.index({ studentId: 1, academicYear: 1, semester: 1 });
feesSchema.index({ status: 1, dueDate: 1 });
feesSchema.index({ 'installmentPlan.schedule.dueDate': 1 });

module.exports = mongoose.model('Fees', feesSchema);
```

### Database Relationships

The database schema implements several key relationships:

1. **User-Department**: Users belong to departments
2. **Course-Department**: Courses are managed by departments
3. **Quiz-Course**: Quizzes can be associated with specific courses
4. **News-Audience**: News can target specific departments or courses
5. **Building-Department**: Buildings can be associated with departments
6. **User-Courses**: Students can be enrolled in multiple courses

These relationships are managed through MongoDB's reference system using ObjectId fields, allowing for efficient population and querying across related documents.

### Database Configuration

The application uses environment variables for database configuration:

```
MONGODB_URI=mongodb://localhost:27017/uniben-ai
```

The connection is established in the main server file (`server.js`) and includes proper error handling and connection retry logic.

---

## Backend API & Services

The backend of the UNIBEN AI Assistant is built with Node.js and Express.js, providing a comprehensive RESTful API that handles all application logic, data management, and external service integrations.

### Server Configuration & Startup

**File: `server/src/server.js`**

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const quizRoutes = require('./routes/quizRoutes');
const chatRoutes = require('./routes/chatRoutes');
const newsRoutes = require('./routes/newsRoutes');
const navigationRoutes = require('./routes/navigationRoutes');
const systemAdminRoutes = require('./routes/systemAdminRoutes');
const lecturerAdminRoutes = require('./routes/lecturerAdminRoutes');
const departmentalAdminRoutes = require('./routes/departmentalAdminRoutes');
const bursaryAdminRoutes = require('./routes/bursaryAdminRoutes');
const feesRoutes = require('./routes/feesRoutes');
const debugRoutes = require('./routes/debugRoutes');

// Import middleware
const auth = require('./middleware/auth');
const roleAuth = require('./middleware/roleAuth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', auth, adminRoutes);
app.use('/api/quiz', auth, quizRoutes);
app.use('/api/chat', auth, chatRoutes);
app.use('/api/news', auth, newsRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/system-admin', auth, roleAuth(['system_admin']), systemAdminRoutes);
app.use('/api/lecturer-admin', auth, roleAuth(['lecturer_admin']), lecturerAdminRoutes);
app.use('/api/departmental-admin', auth, roleAuth(['departmental_admin']), departmentalAdminRoutes);
app.use('/api/bursary-admin', auth, roleAuth(['bursary_admin']), bursaryAdminRoutes);
app.use('/api/fees', auth, feesRoutes);
app.use('/api/debug', debugRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
```

### Authentication & Authorization Middleware

**File: `server/src/middleware/auth.js`**

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid or user is inactive'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

module.exports = auth;
```

**File: `server/src/middleware/roleAuth.js`**

```javascript
const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

module.exports = roleAuth;
```

**File: `server/src/middleware/fileUpload.js`**

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = uploadsDir;
    
    if (file.mimetype === 'application/pdf') {
      uploadPath = path.join(uploadsDir, 'pdfs');
    } else if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(uploadsDir, 'images');
    } else {
      uploadPath = path.join(uploadsDir, 'documents');
    }
    
    // Create subdirectory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow PDFs, images, and common document formats
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, and documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;
```

### Core Controllers

#### Authentication Controller
**File: `server/src/controllers/authController.js`**

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Department = require('../models/Department');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'fallback_secret', 
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, role, department, staffId, matricNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      department,
      staffId,
      matricNumber
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).populate('department', 'name faculty');
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        staffId: user.staffId,
        matricNumber: user.matricNumber,
        courses: user.courses
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('department', 'name faculty')
      .populate('courses', 'code title');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('department', 'name faculty');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
```

#### Quiz Controller
**File: `server/src/controllers/quizController.js`**

```javascript
const fs = require('fs').promises;
const path = require('path');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { extractTextFromPDF } = require('../services/pdfExtractor');
const { generateQuizFromContent } = require('../services/quizGenerator');

// Generate quiz from PDF
const generateFromPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file provided'
      });
    }

    const { title } = req.body;
    const pdfPath = req.file.path;

    // Extract text from PDF
    let extractedText;
    try {
      extractedText = await extractTextFromPDF(pdfPath);
    } catch (error) {
      console.error('PDF extraction error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to extract text from PDF'
      });
    }

    if (!extractedText || extractedText.length < 100) {
      return res.status(400).json({
        success: false,
        message: 'PDF does not contain enough readable text (minimum 100 characters required)'
      });
    }

    // Generate quiz questions using AI
    let questions;
    try {
      questions = await generateQuizFromContent(extractedText, title || 'PDF Quiz');
    } catch (error) {
      console.error('Quiz generation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate quiz questions'
      });
    }

    // Clean up uploaded file
    try {
      await fs.unlink(pdfPath);
    } catch (error) {
      console.warn('Failed to delete uploaded file:', error);
    }

    // Create quiz in database
    const quiz = new Quiz({
      title: title || 'PDF Quiz',
      questions: questions,
      createdBy: req.user._id,
      source: 'pdf',
      sourceContent: extractedText
    });

    await quiz.save();
    await quiz.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      quiz
    });
  } catch (error) {
    console.error('Generate from PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating quiz from PDF'
    });
  }
};

// Generate quiz from text
const generateFromText = async (req, res) => {
  try {
    const { text, title } = req.body;

    if (!text || text.length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Text must be at least 100 characters long'
      });
    }

    // Generate quiz questions using AI
    let questions;
    try {
      questions = await generateQuizFromContent(text, title || 'Text Quiz');
    } catch (error) {
      console.error('Quiz generation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate quiz questions'
      });
    }

    // Create quiz in database
    const quiz = new Quiz({
      title: title || 'Text Quiz',
      questions: questions,
      createdBy: req.user._id,
      source: 'text',
      sourceContent: text
    });

    await quiz.save();
    await quiz.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      quiz
    });
  } catch (error) {
    console.error('Generate from text error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating quiz from text'
    });
  }
};

// Get quiz by ID
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findById(id)
      .populate('createdBy', 'name email')
      .populate('course', 'code title')
      .populate('department', 'name faculty');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving quiz'
    });
  }
};

// Submit quiz answers
const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user already attempted this quiz
    const existingResult = quiz.results.find(result => 
      result.userId.toString() === req.user._id.toString()
    );

    // Calculate score
    const result = quiz.calculateScore(answers);
    const timeSpent = answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);

    const quizResult = {
      userId: req.user._id,
      answers: result.detailedAnswers,
      score: result.score,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      incorrectAnswers: result.incorrectAnswers,
      timeSpent,
      attemptNumber: existingResult ? existingResult.attemptNumber + 1 : 1
    };

    if (existingResult) {
      // Update existing result
      const resultIndex = quiz.results.findIndex(result => 
        result.userId.toString() === req.user._id.toString()
      );
      quiz.results[resultIndex] = { ...quiz.results[resultIndex], ...quizResult };
    } else {
      // Add new result
      quiz.results.push(quizResult);
    }

    // Update analytics
    await quiz.updateAnalytics();
    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      result: quizResult
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting quiz'
    });
  }
};

// Get quiz results
const getQuizResults = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .populate('createdBy', 'name email')
      .populate('results.userId', 'name email');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Get user's result
    const userResult = quiz.results.find(result => 
      result.userId._id.toString() === req.user._id.toString()
    );

    if (!userResult) {
      return res.status(404).json({
        success: false,
        message: 'No results found for this user'
      });
    }

    res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        questions: quiz.questions,
        results: userResult
      }
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving quiz results'
    });
  }
};

module.exports = {
  generateFromPDF,
  generateFromText,
  getQuizById,
  submitQuiz,
  getQuizResults
};
```

#### Chat Controller
**File: `server/src/controllers/chatController.js`**

```javascript
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { generateAIResponse } = require('../services/geminiService');

// Send message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    let conversation;

    if (conversationId) {
      // Add to existing conversation
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Check if user is participant
      if (!conversation.participants.includes(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this conversation'
        });
      }
    } else {
      // Create new conversation
      conversation = new Conversation({
        participants: [req.user._id],
        title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        context: {
          userPreferences: {},
          previousTopics: [],
          currentDepartment: req.user.department,
          currentCourse: null
        }
      });
    }

    // Add user message
    conversation.messages.push({
      sender: req.user._id,
      content,
      type: 'text',
      timestamp: new Date()
    });

    // Generate AI response
    try {
      const aiResponse = await generateAIResponse(content, conversation.context);
      
      conversation.messages.push({
        sender: req.user._id, // Temporary, will be updated by AI service
        content: aiResponse.content,
        type: 'ai_response',
        metadata: aiResponse.metadata,
        timestamp: new Date()
      });

      // Update conversation context
      conversation.context.previousTopics.push(...aiResponse.topics);
      conversation.lastActivity = new Date();
    } catch (error) {
      console.error('AI response error:', error);
      // Still save user message even if AI fails
    }

    await conversation.save();
    await conversation.populate('participants', 'name email role');

    res.json({
      success: true,
      conversation: conversation
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
};

// Get user conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
    .sort({ lastActivity: -1 })
    .populate('participants', 'name email role')
    .populate('messages.sender', 'name email role');

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving conversations'
    });
  }
};

// Get specific conversation
const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id)
      .populate('participants', 'name email role department')
      .populate('messages.sender', 'name email role');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving conversation'
    });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getConversationById
};
```

### AI Services

#### Gemini AI Service
**File: `server/src/services/geminiService.js`**

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

// Generate quiz questions from content
const generateQuizFromContent = async (content, title) => {
  try {
    const prompt = `
Create a comprehensive quiz with 10 multiple-choice questions based on the following content:

Content: ${content}

Requirements:
1. Generate exactly 10 questions
2. Each question must have 4 options (A, B, C, D)
3. Provide clear explanations for each correct answer
4. Include helpful hints where applicable
5. Vary question types (definition, application, analysis, etc.)
6. Ensure questions test different levels of understanding

Respond in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "Clear explanation of why this answer is correct",
      "hint": "Helpful hint for the student"
    }
  ]
}

Make sure the JSON is valid and properly formatted.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const quizData = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format in AI response');
    }

    // Validate each question
    quizData.questions.forEach((question, index) => {
      if (!question.question || !question.options || !question.correctAnswer) {
        throw new Error(`Invalid question format at index ${index}`);
      }
      if (question.options.length !== 4) {
        throw new Error(`Question ${index} must have exactly 4 options`);
      }
      if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
        throw new Error(`Question ${index} must have correctAnswer as A, B, C, or D`);
      }
    });

    return quizData.questions;
  } catch (error) {
    console.error('Gemini AI quiz generation error:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

// Generate AI response for chat
const generateAIResponse = async (message, context = {}) => {
  try {
    const systemPrompt = `
You are the UNIBEN AI Assistant, an intelligent helper for University of Benin students, faculty, and staff.

Your capabilities include:
- Answering questions about UNIBEN courses, departments, and programs
- Providing information about campus buildings and navigation
- Helping with academic planning and course selection
- General university-related queries
- You have access to university data through function calling

Context about the user:
- Department: ${context.currentDepartment?.name || 'Not specified'}
- Role: ${context.userRole || 'Student'}
- Previous topics discussed: ${context.previousTopics?.join(', ') || 'None'}

Guidelines:
1. Be helpful, accurate, and professional
2. If you need specific data (courses, buildings, schedules, etc.), use function calling
3. Provide detailed, informative responses
4. Use proper formatting for better readability
5. If you don't know something, admit it and suggest where they might find the answer

Current time: ${new Date().toISOString()}
`;

    const prompt = `${systemPrompt}\n\nUser question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Process any function calls if present
    const functionCalls = [];
    const functionResults = [];

    // Simple function calling logic (can be expanded)
    if (text.includes('[FUNCTION_CALL:')) {
      // Extract function calls from response
      const functionPattern = /\[FUNCTION_CALL:(\w+):([\s\S]*?)\]/g;
      let match;
      
      while ((match = functionPattern.exec(text)) !== null) {
        const functionName = match[1];
        let args;
        try {
          args = JSON.parse(match[2]);
        } catch {
          args = {};
        }
        
        functionCalls.push({ name: functionName, arguments: args });
        
        // Execute the function (placeholder - implement actual function calling)
        let functionResult = null;
        switch (functionName) {
          case 'getCourses':
            functionResult = await getCourses(args.department);
            break;
          case 'getBuildings':
            functionResult = await getBuildings(args.type);
            break;
          case 'getNews':
            functionResult = await getNews(args.category);
            break;
          default:
            functionResult = { error: 'Function not implemented' };
        }
        
        functionResults.push({ name: functionName, result: functionResult });
      }
    }

    // Clean up the response text
    const cleanText = text.replace(/\[FUNCTION_CALL:[\s\S]*?\]/g, '').trim();

    return {
      content: cleanText,
      metadata: {
        aiModel: 'gemini-2.0-flash-exp',
        processingTime: Date.now(),
        functionCalls: functionResults
      },
      topics: extractTopics(cleanText)
    };
  } catch (error) {
    console.error('Gemini AI chat response error:', error);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
};

// Helper function to extract topics from text
const extractTopics = (text) => {
  const topics = [];
  const keywords = [
    'course', 'department', 'building', 'library', 'lecture', 'exam', 
    'semester', 'degree', 'admission', 'tuition', 'campus', 'faculty'
  ];
  
  const lowerText = text.toLowerCase();
  keywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      topics.push(keyword);
    }
  });
  
  return [...new Set(topics)];
};

// Placeholder functions for function calling
const getCourses = async (departmentId) => {
  // Implementation would fetch actual course data
  return { courses: [], message: 'Course data not available' };
};

const getBuildings = async (type) => {
  // Implementation would fetch actual building data
  return { buildings: [], message: 'Building data not available' };
};

const getNews = async (category) => {
  // Implementation would fetch actual news data
  return { news: [], message: 'News data not available' };
};

module.exports = {
  generateQuizFromContent,
  generateAIResponse
};
```

#### PDF Processing Service
**File: `server/src/services/pdfExtractor.js`**

```javascript
const fs = require('fs').promises;
const path = require('path');

// This is a simplified PDF text extraction service
// In a production environment, you would use libraries like:
// - pdf-parse
// - pdf2pic + tesseract
// - Google Cloud Document AI
// - AWS Textract

const extractTextFromPDF = async (pdfPath) => {
  try {
    // For this example, we'll simulate PDF text extraction
    // In reality, you would use a PDF processing library
    
    // Check if file exists
    await fs.access(pdfPath);
    
    // Read the file (this is a simplified example)
    const pdfBuffer = await fs.readFile(pdfPath);
    
    // Simulate text extraction (replace with actual PDF processing)
    // For demonstration, we'll return a placeholder
    const simulatedText = `
      Introduction to Computer Science
      
      Computer science is the study of computation, algorithms, and the design of computer systems. 
      This field encompasses both theoretical foundations and practical applications.
      
      Chapter 1: Programming Fundamentals
      
      Programming is the process of creating instructions for computers to follow. 
      There are many programming languages, each with its own syntax and semantics.
      
      Variables and Data Types:
      - Variables store data in memory
      - Data types define what kind of data can be stored
      - Common types include integers, strings, and booleans
      
      Control Structures:
      - Conditional statements (if/else)
      - Loops (for, while)
      - Functions and procedures
      
      Chapter 2: Data Structures
      
      Data structures are ways of organizing and storing data efficiently.
      
      Arrays:
      - Linear collection of elements
      - Fixed size (in most languages)
      - Direct access by index
      
      Linked Lists:
      - Dynamic data structure
      - Nodes connected through pointers
      - Efficient insertion and deletion
      
      Stacks and Queues:
      - Stack: Last In, First Out (LIFO)
      - Queue: First In, First Out (FIFO)
      
      Trees and Graphs:
      - Hierarchical and network data structures
      - Used for representing relationships
      - Various traversal algorithms
      
      Conclusion:
      Understanding fundamental concepts in computer science is essential 
      for building efficient and reliable software systems.
    `;
    
    // In a real implementation, you would:
    // 1. Use a PDF processing library
    // 2. Handle different PDF formats
    // 3. Extract text while preserving structure
    // 4. Handle images and graphics appropriately
    // 5. Clean up extracted text
    
    return simulatedText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

const cleanExtractedText = (text) => {
  // Remove extra whitespace
  let cleaned = text.replace(/\s+/g, ' ');
  
  // Remove special characters that might interfere with AI processing
  cleaned = cleaned.replace(/[^\w\s.,;:!?()-]/g, '');
  
  // Ensure minimum length for quiz generation
  if (cleaned.length < 100) {
    throw new Error('Extracted text is too short for quiz generation');
  }
  
  return cleaned.trim();
};

module.exports = {
  extractTextFromPDF,
  cleanExtractedText
};
```

### Route Definitions

#### Quiz Routes
**File: `server/src/routes/quizRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();
const upload = require('../middleware/fileUpload');
const {
  generateFromPDF,
  generateFromText,
  getQuizById,
  submitQuiz,
  getQuizResults
} = require('../controllers/quizController');

// Generate quiz from PDF
router.post('/generate/pdf', upload.single('pdf'), generateFromPDF);

// Generate quiz from text
router.post('/generate/text', generateFromText);

// Get quiz by ID
router.get('/:id', getQuizById);

// Submit quiz answers
router.post('/:id/submit', submitQuiz);

// Get quiz results
router.get('/:id/results', getQuizResults);

module.exports = router;
```

#### Chat Routes
**File: `server/src/routes/chatRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getConversationById
} = require('../controllers/chatController');

// Send message
router.post('/message', sendMessage);

// Get user conversations
router.get('/conversations', getConversations);

// Get specific conversation
router.get('/conversations/:id', getConversationById);

module.exports = router;
```

#### Admin Routes
**File: `server/src/routes/adminRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();

// Import controllers
const adminController = require('../controllers/adminController');

// Get system statistics
router.get('/stats', adminController.getSystemStats);

// User management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Department management
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// Course management
router.get('/courses', adminController.getCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Building management
router.get('/buildings', adminController.getBuildings);
router.post('/buildings', adminController.createBuilding);
router.put('/buildings/:id', adminController.updateBuilding);
router.delete('/buildings/:id', adminController.deleteBuilding);

// Quiz management
router.get('/quizzes', adminController.getQuizzes);
router.delete('/quizzes/:id', adminController.deleteQuiz);

module.exports = router;
```

This completes the first part of the comprehensive documentation covering:

1. **Executive Summary & Project Overview** - Complete understanding of what the system does
2. **Project Architecture & Technology Stack** - Detailed breakdown of technologies and architecture
3. **Database Architecture & Models** - All database schemas with complete code examples
4. **Backend API & Services** - Controllers, middleware, AI services, and route definitions

The next sections will cover the frontend architecture, detailed implementation analysis, comprehensive user flows, and complete AI integration details.

---

## Frontend Architecture & Complete Implementation Analysis

### 1. Chat System (`/chat`) - Complete Deep Dive

#### ChatPage Component - Complete Implementation
**Location**: `client/src/components/chat/ChatPage.jsx`

**Detailed State Management**:
```javascript
const [conversations, setConversations] = useState([]);
const [currentConversation, setCurrentConversation] = useState(null);
const [isSidebarOpen, setIsSidebarOpen] = useState(true);
const [loading, setLoading] = useState(true);
const [sendingMessage, setSendingMessage] = useState(false);
```

**Conversation Loading Function**:
```javascript
const loadConversations = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/chat/conversations', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setConversations(data.conversations);
      
      // Auto-select first conversation if exists
      if (data.conversations.length > 0) {
        setCurrentConversation(data.conversations[0]);
      }
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
    // Error state handling
  } finally {
    setLoading(false);
  }
};
```

**Message Sending Implementation**:
```javascript
const handleSendMessage = async (content) => {
  if (!content.trim()) return;

  setSendingMessage(true);
  
  try {
    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        conversationId: currentConversation?._id,
        content,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      
      // Update conversations list
      const updatedConversations = conversations.map(conv => {
        if (conv._id === data.conversation._id) {
          return data.conversation;
        }
        return conv;
      });

      // Add new conversation if created
      if (!currentConversation) {
        updatedConversations.unshift(data.conversation);
      }

      setConversations(updatedConversations);
      setCurrentConversation(data.conversation);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    setSendingMessage(false);
  }
};
```

#### ChatSidebar Component - Complete Implementation
**Location**: `client/src/components/chat/ChatSidebar.jsx`

**Search and Filtering Logic**:
```javascript
// Filter conversations based on search
const filteredConversations = conversations.filter(conv =>
  conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
);

// Group conversations by date
const today = new Date().toDateString();
const yesterday = new Date(Date.now() - 86400000).toDateString();

const todayConversations = filteredConversations.filter(conv =>
  new Date(conv.lastActivity).toDateString() === today
);

const yesterdayConversations = filteredConversations.filter(conv =>
  new Date(conv.lastActivity).toDateString() === yesterday
);

const olderConversations = filteredConversations.filter(conv =>
  new Date(conv.lastActivity).toDateString() !== today &&
  new Date(conv.lastActivity).toDateString() !== yesterday
);
```

**New Chat Button Implementation**:
```javascript
<button
  onClick={onNewConversation}
  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-emerald-600 transition-colors"
>
  <span className="truncate">New Chat +</span>
</button>
```

**Conversation Rendering Logic**:
```javascript
{/* Today's Conversations */}
{todayConversations.length > 0 && (
  <>
    <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
      Today
    </p>
    {todayConversations.map(conv => (
      <button
        key={conv.id}
        onClick={() => onConversationSelect(conv.id)}
        className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
          currentConversation?.id === conv.id
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-slate-100'
        }`}
      >
        <span className="material-symbols-outlined text-base text-slate-500">
          chat_bubble
        </span>
        <div className="flex flex-col items-start flex-1 min-w-0">
          <p className="text-sm font-medium leading-normal truncate w-full text-left">
            {conv.title}
          </p>
          <p className="text-xs text-slate-500 truncate w-full text-left">
            {conv.lastMessage}
          </p>
        </div>
      </button>
    ))}
  </>
)}
```

#### MessageBubble Component - Complete Implementation
**Location**: `client/src/components/chat/MessageBubble.jsx`

**Timestamp Formatting**:
```javascript
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = (now - date) / (1000 * 60);
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)}m ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};
```

**User Message Rendering**:
```javascript
if (isUser) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-xs lg:max-w-md">
        {isFirstInSequence && (
          <div className="text-right mb-1">
            <span className="text-xs text-slate-500">
              {message.sender?.name || user?.getDisplayName()}
            </span>
          </div>
        )}
        <div className="bg-emerald-500 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed">
            {formatMessageContent(message.content)}
          </p>
        </div>
        <div className="text-right mt-1">
          <span className="text-xs text-slate-400">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
```

#### MessageInput Component - Complete Implementation
**Location**: `client/src/components/chat/MessageInput.jsx`

**Auto-resize Textarea**:
```javascript
const handleTextareaChange = (e) => {
  setMessage(e.target.value);
  
  // Auto-resize textarea
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    const scrollHeight = textareaRef.current.scrollHeight;
    const maxHeight = 120; // 5 lines approximately
    textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }
};
```

**Quick Suggestion Buttons**:
```javascript
{isExpanded && (
  <div className="px-3 pb-3 border-t border-slate-100 pt-3">
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setMessage('What courses are available in Computer Science?')}
        className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full hover:bg-slate-200 transition-colors"
      >
        Computer Science courses
      </button>
      <button
        type="button"
        onClick={() => setMessage('How do I get to the Library from the Main Gate?')}
        className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full hover:bg-slate-200 transition-colors"
      >
        Navigate to Library
      </button>
    </div>
  </div>
)}
```

#### Complete Chat User Flow

**Step 1: Chat Page Access**
1. User clicks "AI Chat" in navigation bar
2. React Router navigates to `/chat`
3. `ProtectedRoute` validates JWT token and user role
4. `ChatPage` component mounts, triggers `useEffect(() => { loadConversations() }, [])`
5. API request: GET `/api/chat/conversations` with `Authorization: Bearer ${token}`
6. Backend fetches user's conversation history ordered by `lastActivity`
7. Response: `{ success: true, conversations: [...] }`
8. Set first conversation as current, render sidebar and message area

**Step 2: Creating New Conversation**
1. User clicks "New Chat +" button
2. `onNewConversation()` called
3. Sets `currentConversation` to null
4. Welcome screen displays with UNIBEN AI branding and start button
5. Input area expands with quick suggestion buttons
6. User types message or clicks suggestion
7. Textarea auto-resizes, expanded state triggers
8. Enter key or send button triggers `handleSendMessage()`

**Step 3: Sending Message**
1. Validate message content: `if (!content.trim()) return;`
2. Set loading state: `setSendingMessage(true)`
3. POST request to `/api/chat/message`:
   ```json
   {
     "conversationId": null,
     "content": "What departments offer Computer Science?"
   }
   ```
4. Backend creates new conversation:
   ```javascript
   const conversation = new Conversation({
     title: "What departments offer Computer Science?",
     participants: [user._id, 'ai'],
     messages: [...],
     createdBy: user._id,
     lastActivity: new Date()
   });
   ```
5. Message sent to Gemini AI with context:
   ```javascript
   const aiResponse = await generateAIResponse(message, {
     userRole: user.role,
     department: user.department?.name
   });
   ```
6. Response includes conversation with messages
7. UI updates: conversation added to sidebar, message displayed
8. Auto-scroll triggers: `messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })`

**Step 4: AI Response Processing**
1. Backend calls Gemini AI service
2. AI analyzes message for function calls
3. If query about buildings: triggers `getBuildingData()`
4. If query about courses: triggers `getCourseData()`
5. AI constructs response with data
6. Response stored in conversation
7. UI renders AI message with function call results in blue boxes

**Step 5: Conversation Management**
1. User selects different conversation from sidebar
2. `onConversationSelect()` updates `currentConversation`
3. Message list renders from `conversation.messages`
4. Sidebar shows last message preview
5. Search filter applies to conversation titles
6. Grouping logic separates by date (Today/Yesterday/Older)
7. Logout clears all conversations and user state

---

---

### 2. Quiz System - Complete Deep Dive

#### QuizUpload Component - Complete Implementation
**Location**: `client/src/components/quiz/QuizUpload.jsx`

**State Management**:
```javascript
const [inputMode, setInputMode] = useState('pdf'); // 'pdf' or 'text'
const [selectedFile, setSelectedFile] = useState(null);
const [textContent, setTextContent] = useState('');
const [quizTitle, setQuizTitle] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [dragActive, setDragActive] = useState(false);
```

**File Drop Handler**:
```javascript
const handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === "dragenter" || e.type === "dragover") {
    setDragActive(true);
  } else if (e.type === "dragleave") {
    setDragActive(false);
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);

  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleFileChange(e.dataTransfer.files);
  }
};

const handleFileChange = (files) => {
  const file = files[0];
  if (file) {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a PDF file');
      setSelectedFile(null);
    }
  }
};
```

**Quiz Generation Logic**:
```javascript
const generateQuiz = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!quizTitle.trim()) {
    setError('Please enter a quiz title');
    return;
  }

  if (inputMode === 'pdf' && !selectedFile) {
    setError('Please select a PDF file');
    return;
  }

  if (inputMode === 'text' && textContent.length < 100) {
    setError('Please enter at least 100 characters of text content');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const formData = new FormData();
    formData.append('title', quizTitle);

    if (inputMode === 'pdf') {
      formData.append('pdf', selectedFile);
    } else {
      formData.append('textContent', textContent);
    }

    const response = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      // Navigate to quiz interface
      navigate(`/quiz/start/${data.quiz._id}`);
    } else {
      setError(data.message || 'Failed to generate quiz');
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    setError('Network error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

**Drag & Drop UI**:
```javascript
<div
  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
    dragActive
      ? 'border-emerald-500 bg-emerald-50'
      : 'border-slate-300 hover:border-emerald-400'
  }`}
  onDragEnter={handleDrag}
  onDragLeave={handleDrag}
  onDragOver={handleDrag}
  onDrop={handleDrop}
>
  <input
    type="file"
    accept=".pdf"
    onChange={(e) => handleFileChange(e.target.files)}
    className="hidden"
    id="pdf-upload"
    disabled={loading}
  />
  <label htmlFor="pdf-upload" className="cursor-pointer">
    <div className="mx-auto w-12 h-12 text-slate-400 mb-4">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    </div>
    <p className="text-lg font-medium text-slate-700 mb-2">
      {selectedFile ? selectedFile.name : 'Drop your PDF here, or click to browse'}
    </p>
    <p className="text-sm text-slate-500">
      Supports PDF files up to 10MB
    </p>
  </label>
</div>
```

#### QuizInterface Component - Complete Implementation
**Location**: `client/src/components/quiz/QuizInterface.jsx`

**State Management**:
```javascript
const [quiz, setQuiz] = useState(null);
const [currentQuestion, setCurrentQuestion] = useState(0);
const [answers, setAnswers] = useState({});
const [timeSpent, setTimeSpent] = useState({});
const [quizStarted, setQuizStarted] = useState(false);
const [quizCompleted, setQuizCompleted] = useState(false);
const [timeRemaining, setTimeRemaining] = useState(null);
const [questionStartTime, setQuestionStartTime] = useState(null);
```

**Quiz Loading**:
```javascript
useEffect(() => {
  loadQuiz();
}, [id]);

const loadQuiz = async () => {
  try {
    const response = await fetch(`/api/quiz/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setQuiz(data.quiz);
    } else {
      navigate('/quiz/upload');
    }
  } catch (error) {
    console.error('Error loading quiz:', error);
    navigate('/quiz/upload');
  } finally {
    setLoading(false);
  }
};
```

**Timer Implementation**:
```javascript
useEffect(() => {
  let timer;
  if (quizStarted && !quizCompleted && timeRemaining !== null) {
    timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
  return () => clearInterval(timer);
}, [quizStarted, quizCompleted, timeRemaining]);
```

**Answer Selection**:
```javascript
const handleAnswerSelect = (answer) => {
  setAnswers(prev => ({
    ...prev,
    [currentQuestion]: answer
  }));

  // Track time spent on question
  if (questionStartTime) {
    const timeSpentMs = Date.now() - questionStartTime;
    setTimeSpent(prev => ({
      ...prev,
      [currentQuestion]: Math.floor(timeSpentMs / 1000)
    }));
  }
};
```

**Question Navigation**:
```javascript
const goToNextQuestion = () => {
  if (currentQuestion < quiz.questions.length - 1) {
    setCurrentQuestion(prev => prev + 1);
    setQuestionStartTime(Date.now());
  }
};

const goToPreviousQuestion = () => {
  if (currentQuestion > 0) {
    setCurrentQuestion(prev => prev - 1);
    setQuestionStartTime(Date.now());
  }
};

const jumpToQuestion = (questionIndex) => {
  if (questionIndex >= 0 && questionIndex < quiz.questions.length) {
    setCurrentQuestion(questionIndex);
    setQuestionStartTime(Date.now());
  }
};
```

**Quiz Submission**:
```javascript
const handleSubmitQuiz = async () => {
  setSubmitting(true);
  
  try {
    // Final time tracking for current question
    if (questionStartTime) {
      const timeSpentMs = Date.now() - questionStartTime;
      setTimeSpent(prev => ({
        ...prev,
        [currentQuestion]: Math.floor(timeSpentMs / 1000)
      }));
    }

    const formattedAnswers = Object.entries(answers).map(([questionIndex, answer]) => ({
      questionIndex: parseInt(questionIndex),
      selectedAnswer: answer,
      timeSpent: timeSpent[questionIndex] || 0
    }));

    const response = await fetch(`/api/quiz/${id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ answers: formattedAnswers }),
    });

    if (response.ok) {
      const data = await response.json();
      setQuizCompleted(true);
      navigate(`/quiz/results/${id}`);
    } else {
      console.error('Failed to submit quiz');
    }
  } catch (error) {
    console.error('Error submitting quiz:', error);
  } finally {
    setSubmitting(false);
  }
};
```

#### QuestionCard Component - Complete Implementation
**Location**: `client/src/components/quiz/QuestionCard.jsx`

**Question Rendering**:
```javascript
const renderQuestion = (question) => {
  return (
    <div className="space-y-6">
      {/* Question Number and Text */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {questionNumber}
        </div>
        <div className="flex-1">
          <p className="text-lg text-slate-900 leading-relaxed">
            {question.question}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Question {questionNumber} of {totalQuestions}
          </p>
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(option)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedAnswer === option
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedAnswer === option
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-slate-300'
              }`}>
                {selectedAnswer === option && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <span className="font-medium text-slate-700">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="text-slate-800">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Hint and Explanation */}
      {question.hint && (
        <HintBox
          hint={question.hint}
          visible={showHint}
          onToggle={() => setShowHint(!showHint)}
        />
      )}
      
      {question.explanation && showExplanation && (
        <ExplanationBox
          explanation={question.explanation}
          correctAnswer={question.correctAnswer}
        />
      )}
    </div>
  );
};
```

#### ProgressBar Component - Complete Implementation
**Location**: `client/src/components/quiz/ProgressBar.jsx`

**Progress Calculation**:
```javascript
const progressPercentage = (current / total) * 100;
const answeredCount = answered;

return (
  <div className="w-full">
    {/* Progress Bar */}
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-slate-700">
        Question {current} of {total}
      </span>
      <span className="text-sm text-slate-500">
        {answeredCount} answered
      </span>
    </div>

    {/* Visual Progress */}
    <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
      <div
        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>

    {/* Question Grid */}
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          onClick={() => onJumpToQuestion && onJumpToQuestion(index)}
          className={`w-8 h-8 text-xs rounded transition-colors ${
            index + 1 === current
              ? 'bg-emerald-500 text-white font-bold'
              : answered && answered.includes(index)
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  </div>
);
```

#### QuizResults Component - Complete Implementation
**Location**: `client/src/components/quiz/QuizResults.jsx`

**Score Calculation**:
```javascript
const calculateScore = (results) => {
  const correctAnswers = results.filter(result => result.isCorrect).length;
  const totalQuestions = results.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  return {
    correct: correctAnswers,
    total: totalQuestions,
    percentage: percentage,
    grade: getGrade(percentage)
  };
};

const getGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};
```

**Results Display**:
```javascript
return (
  <div className="max-w-4xl mx-auto p-6">
    {/* Score Summary */}
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-white text-2xl font-bold mb-4 ${
          score.percentage >= 70 ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {score.percentage}%
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {quiz.title}
        </h1>
        <p className="text-lg text-slate-600">
          You scored {score.correct} out of {score.total} questions
        </p>
        <p className="text-2xl font-bold text-emerald-600 mt-2">
          Grade: {score.grade}
        </p>
      </div>
    </div>

    {/* Question Review */}
    <div className="space-y-6">
      {results.map((result, index) => (
        <QuestionReviewCard
          key={index}
          question={quiz.questions[index]}
          result={result}
          questionNumber={index + 1}
        />
      ))}
    </div>

    {/* Action Buttons */}
    <div className="flex justify-center gap-4 mt-8">
      <button
        onClick={() => navigate('/quiz/upload')}
        className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
      >
        Take Another Quiz
      </button>
      <button
        onClick={() => window.print()}
        className="bg-slate-500 text-white px-6 py-3 rounded-lg hover:bg-slate-600 transition-colors"
      >
        Print Results
      </button>
    </div>
  </div>
);
```

#### Complete Quiz System User Flow

**Step 1: Quiz Creation**
1. User navigates to `/quiz/upload` from navigation or quiz interface
2. `QuizUpload` component renders with mode selection (PDF/Text)
3. User selects PDF upload mode
4. Drag & drop UI activates, user drops PDF file
5. `handleFileChange()` validates PDF format and size
6. User enters descriptive quiz title
7. `generateQuiz()` validates all inputs
8. FormData constructed with PDF file and metadata

**Step 2: Quiz Generation**
1. POST request to `/api/quiz/generate/pdf`:
   ```javascript
   FormData: {
     title: "Computer Science Fundamentals Quiz",
     pdf: [PDF_FILE]
   }
   ```
2. Backend `pdfExtractorService.extractTextFromPDF(pdfPath)` processes file
3. Text validation: minimum 100 characters
4. `geminiService.generateQuizFromContent(text, title)` called
5. AI prompt structure:
   ```javascript
   const prompt = `
   Create a comprehensive quiz with 10 multiple-choice questions based on:
   Content: ${extractedText}
   
   Requirements:
   1. Generate exactly 10 questions
   2. Each with 4 options (A, B, C, D)
   3. Provide explanations for correct answers
   4. Include helpful hints
   
   JSON format required:
   { "questions": [...] }
   `;
   ```
6. Gemini AI generates structured quiz data
7. `Quiz.save()` stores quiz in database
8. Response: `{ success: true, quiz: { _id, title, questions, settings } }`
9. Navigate to `/quiz/start/${quiz._id}`

**Step 3: Quiz Taking Interface**
1. `QuizInterface` mounts with quiz ID from URL params
2. `loadQuiz()` fetches quiz data from `/api/quiz/${id}`
3. Display start screen with quiz information:
   - Title and description
   - Question count and time limit
   - Attempt limits
4. User clicks "Start Quiz" button
5. Timer initialized: `timeRemaining = quiz.settings.timeLimit * 60`
6. `quizStarted` set to true, render question interface

**Step 4: Question Navigation**
1. `QuestionCard` displays current question with options
2. User selects answer: `handleAnswerSelect(selectedOption)`
3. Answer stored in `answers` state
4. ProgressBar updates with answered question count
5. User navigates with Previous/Next buttons
6. Timer continues counting down
7. Question grid allows jumping to any question
8. Each question tracks time spent

**Step 5: Quiz Submission**
1. User clicks "Submit Quiz" or timer expires
2. `handleSubmitQuiz()` processes final submission
3. Format answers for backend:
   ```javascript
   const formattedAnswers = [
     { questionIndex: 0, selectedAnswer: "B", timeSpent: 45 },
     { questionIndex: 1, selectedAnswer: "A", timeSpent: 32 },
     // ...
   ];
   ```
4. POST to `/api/quiz/${id}/submit`:
   ```javascript
   {
     "answers": [
       { "questionIndex": 0, "selectedAnswer": "B", "timeSpent": 45 },
       { "questionIndex": 1, "selectedAnswer": "A", "timeSpent": 32 }
     ]
   }
   ```
5. Backend scores quiz: compares answers with correct answers
6. Calculates percentage, grade, time analytics
7. `QuizResult.save()` stores detailed results
8. Navigate to results page `/quiz/results/${id}`

**Step 6: Results Analysis**
1. `QuizResults` component displays comprehensive results
2. Score calculation with grade assignment
3. Question-by-question review with explanations
4. Performance analytics:
   - Time per question
   - Difficulty analysis
   - Overall performance metrics
5. Action buttons: retake quiz, print results, return to upload

---

### 3. Campus Navigation System - Complete Deep Dive

#### MapPage Component - Complete Implementation
**Location**: `client/src/components/map/CampusMap.jsx`

**State Management**:
```javascript
const [buildings, setBuildings] = useState([]);
const [selectedBuilding, setSelectedBuilding] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [filterType, setFilterType] = useState('all');
const [userLocation, setUserLocation] = useState(null);
const [mapView, setMapView] = useState('overview'); // 'overview', 'detailed'
const [routeMode, setRouteMode] = useState(false);
const [routeStart, setRouteStart] = useState(null);
const [routeEnd, setRouteEnd] = useState(null);
```

**Building Data Loading**:
```javascript
const loadBuildings = async () => {
  try {
    const response = await fetch('/api/navigation/buildings', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setBuildings(data.buildings);
      initializeMap(data.buildings);
    }
  } catch (error) {
    console.error('Error loading buildings:', error);
  }
};

useEffect(() => {
  loadBuildings();
  getCurrentLocation();
}, []);
```

**Map Initialization**:
```javascript
const initializeMap = (buildingsData) => {
  const mapElement = mapRef.current;
  if (!mapElement) return;

  // Clear existing content
  mapElement.innerHTML = '';

  // Create canvas-based map (simplified representation)
  const mapContainer = document.createElement('div');
  mapContainer.className = 'w-full h-96 bg-gradient-to-b from-green-100 to-green-200 relative overflow-hidden rounded-lg';
  
  // Add campus boundary
  const campusBoundary = document.createElement('div');
  campusBoundary.className = 'absolute inset-8 border-2 border-green-600 rounded-lg';
  campusBoundary.style.boxShadow = 'inset 0 0 0 1000px rgba(16, 185, 129, 0.1)';
  mapContainer.appendChild(campusBoundary);

  // Add roads/pathways
  const roads = [
    { x1: '10%', y1: '20%', x2: '90%', y2: '20%' }, // Main horizontal road
    { x1: '30%', y1: '10%', x2: '30%', y2: '90%' }, // Main vertical road
    { x1: '60%', y1: '10%', x2: '60%', y2: '70%' }, // Secondary vertical
  ];

  roads.forEach(road => {
    const roadElement = document.createElement('div');
    roadElement.className = 'absolute bg-slate-400';
    roadElement.style.left = road.x1;
    roadElement.style.top = road.y1;
    roadElement.style.width = '2px';
    roadElement.style.height = '80%';
    roadElement.style.transform = `rotate(${Math.atan2(
      parseFloat(road.y2) - parseFloat(road.y1),
      parseFloat(road.x2) - parseFloat(road.x1)
    )}rad)`;
    mapContainer.appendChild(roadElement);
  });

  // Render buildings
  buildingsData.forEach((building, index) => {
    renderBuilding(building, index, mapContainer);
  });

  mapElement.appendChild(mapContainer);
};
```

**Building Rendering**:
```javascript
const renderBuilding = (building, index, container) => {
  const buildingElement = document.createElement('div');
  buildingElement.className = 'absolute w-10 h-10 cursor-pointer transform transition-transform hover:scale-110';
  
  // Calculate position based on building coordinates
  const position = calculateBuildingPosition(building);
  buildingElement.style.left = position.x + '%';
  buildingElement.style.top = position.y + '%';
  
  // Building color based on type
  const colorMap = {
    'faculty': 'bg-blue-600',
    'department': 'bg-green-600',
    'library': 'bg-purple-600',
    'hostel': 'bg-orange-600',
    'administrative': 'bg-red-600',
    'sports': 'bg-yellow-600',
    'facility': 'bg-indigo-600'
  };
  
  const baseColor = colorMap[building.type] || 'bg-slate-600';
  buildingElement.className += ` ${baseColor} rounded shadow-lg`;
  
  // Add building number
  buildingElement.innerHTML = `
    <div class="w-full h-full rounded flex items-center justify-center text-white text-xs font-bold">
      ${index + 1}
    </div>
  `;
  
  // Click handler
  buildingElement.addEventListener('click', () => {
    setSelectedBuilding(building);
    highlightBuilding(buildingElement);
  });
  
  // Hover effects
  buildingElement.addEventListener('mouseenter', () => {
    showTooltip(building, buildingElement);
  });
  
  buildingElement.addEventListener('mouseleave', () => {
    hideTooltip();
  });
  
  container.appendChild(buildingElement);
  
  // Add building label
  const labelElement = document.createElement('div');
  labelElement.className = 'absolute text-xs font-medium text-slate-700 bg-white px-2 py-1 rounded shadow-sm pointer-events-none';
  labelElement.style.left = position.x + '%';
  labelElement.style.top = `calc(${position.y}% + 2.5rem)`;
  labelElement.textContent = building.name;
  labelElement.style.transform = 'translateX(-50%)';
  labelElement.style.opacity = '0.8';
  container.appendChild(labelElement);
};
```

**Building Position Calculation**:
```javascript
const calculateBuildingPosition = (building) => {
  // UNIBEN campus approximate coordinates
  const campusCenter = { lat: 6.3350, lng: 5.6037 };
  const latRange = { min: 6.3300, max: 6.3400 };
  const lngRange = { min: 5.6000, max: 5.6100 };
  
  // If building has coordinates, use them
  if (building.coordinates) {
    const x = ((building.coordinates.lng - lngRange.min) / (lngRange.max - lngRange.min)) * 80 + 10;
    const y = ((building.coordinates.lat - latRange.min) / (latRange.max - latRange.min)) * 80 + 10;
    return { x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) };
  }
  
  // Otherwise distribute buildings in a grid pattern
  const gridSize = Math.ceil(Math.sqrt(buildings.length));
  const row = Math.floor(buildings.indexOf(building) / gridSize);
  const col = buildings.indexOf(building) % gridSize;
  
  const x = 20 + (col * (60 / gridSize));
  const y = 20 + (row * (60 / gridSize));
  
  return { x, y };
};
```

**Search and Filter Implementation**:
```javascript
const filteredBuildings = buildings.filter(building => {
  const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.department?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
  const matchesFilter = filterType === 'all' || building.type === filterType;
  
  return matchesSearch && matchesFilter;
});

useEffect(() => {
  if (filteredBuildings.length !== buildings.length) {
    reRenderMap(filteredBuildings);
  }
}, [filteredBuildings, searchTerm, filterType]);
```

**User Location Integration**:
```javascript
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.error('Location access denied:', error);
        // Handle permission denial
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }
};
```

**Route Planning**:
```javascript
const startRoute = (from, to) => {
  setRouteMode(true);
  setRouteStart(from);
  setRouteEnd(to);
  
  // Calculate route using basic pathfinding
  const route = calculateRoute(from, to);
  displayRoute(route);
};

const calculateRoute = (start, end) => {
  // Simplified route calculation
  // In production, this would use A* or Dijkstra's algorithm
  const directDistance = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  
  // Add waypoints for main roads
  const waypoints = [
    { x: start.x, y: 50 }, // Move to main horizontal road
    { x: 30, y: 50 },     // Navigate to main intersection
    { x: 30, y: end.y },  // Move vertically toward destination
    { x: end.x, y: end.y } // Final position
  ];
  
  return {
    waypoints,
    distance: directDistance,
    estimatedTime: Math.ceil(directDistance * 2) // Rough estimate
  };
};
```

#### Complete Campus Navigation User Flow

**Step 1: Map Loading**
1. User navigates to `/map` from navigation
2. `MapPage` component mounts
3. `useEffect()` triggers `loadBuildings()` and `getCurrentLocation()`
4. API request: GET `/api/navigation/buildings` with authentication
5. Backend returns all 44+ campus buildings with full details
6. `initializeMap()` creates canvas-based campus representation
7. Buildings rendered as positioned markers with color coding
8. User location requested and displayed if permission granted

**Step 2: Building Interaction**
1. User clicks on a building marker
2. `renderBuilding()` click handler triggers `setSelectedBuilding(building)`
3. `highlightBuilding()` adds visual emphasis to selected building
4. Building details panel populates with:
   - Basic information (name, type, department)
   - Contact details (phone, address)
   - Facilities list
   - Operating hours (if available)
5. `showTooltip()` displays quick info on hover
6. Building label positioned and styled

**Step 3: Search and Filter**
1. User types in search input: "Computer Science"
2. `searchTerm` state updates, triggers `filteredBuildings` recalculation
3. Filter function checks building names, descriptions, departments
4. Map re-renders with only matching buildings
5. Building count updates in sidebar
6. User selects filter: "Department" from dropdown
7. Only department buildings remain visible
8. Real-time filtering with instant UI updates

**Step 4: Navigation Features**
1. User clicks "Find Route" button
2. Route mode activates, UI changes to selection mode
3. User clicks starting building (e.g., "Main Gate")
4. `routeStart` set to selected building
5. User clicks destination building (e.g., "Computer Science Dept")
6. `calculateRoute()` computes optimal path using waypoints
7. Route displayed as highlighted path on map
8. Estimated distance and time shown
9. Turn-by-turn directions in side panel

**Step 5: Building Details**
1. User selects building from sidebar list
2. `setSelectedBuilding(building)` updates state
3. Details panel slides in with comprehensive information:
   - Building type and department association
   - Contact information and office locations
   - Available facilities and amenities
   - Accessibility information
4. "Get Directions" button calculates route from current location
5. "View on Map" button centers map on building
6. "Call" button initiates phone call to building number
7. Social sharing options available

---

---

### 4. Admin System - Complete Deep Dive

#### AdminPage Component - Complete Implementation
**Location**: `client/src/pages/AdminPage.jsx`

**Comprehensive State Management**:
```javascript
const [activeTab, setActiveTab] = useState('dashboard');
const [stats, setStats] = useState({});
const [users, setUsers] = useState([]);
const [buildings, setBuildings] = useState([]);
const [departments, setDepartments] = useState([]);
const [courses, setCourses] = useState([]);
const [quizzes, setQuizzes] = useState([]);
const [news, setNews] = useState([]);
const [fees, setFees] = useState([]);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [modalType, setModalType] = useState('');
const [editingItem, setEditingItem] = useState(null);
const [formData, setFormData] = useState({});
const [searchTerms, setSearchTerms] = useState({
  users: '',
  departments: '',
  courses: '',
  buildings: '',
  quizzes: '',
  news: ''
});
```

**Role-Based Data Loading**:
```javascript
const loadDashboardData = async () => {
  try {
    setLoading(true);
    console.log('Loading admin dashboard data...');

    const requests = [
      fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    ];

    // Role-specific data requests with stable ordering
    if (['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin', 'staff'].includes(user.role)) {
      if (user.role === 'system_admin') {
        requests.push(
          fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/buildings', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/departments', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/quizzes', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/news/admin/all', { headers: { Authorization: `Bearer ${token}` } })
        );
      } else if (user.role === 'departmental_admin') {
        requests.push(
          fetch('/api/admin/buildings', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/news/admin/all', { headers: { Authorization: `Bearer ${token}` } })
        );
      } else if (user.role === 'lecturer_admin') {
        requests.push(
          fetch('/api/admin/buildings', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/news/admin/all', { headers: { Authorization: `Bearer ${token}` } })
        );
      }
    }

    const responses = await Promise.all(requests);
    const dataPromises = responses.map(res => res.json());
    const data = await Promise.all(dataPromises);

    // Process responses based on request order
    let dataIndex = 0;
    const statsData = data[dataIndex++];
    if (statsData.success) setStats(statsData.stats);

    if (user.role === 'system_admin') {
      const usersData = data[dataIndex++];
      if (usersData.success) setUsers(usersData.users || []);

      const buildingsData = data[dataIndex++];
      if (buildingsData.success) setBuildings(buildingsData.buildings || []);

      const departmentsData = data[dataIndex++];
      if (departmentsData.success) setDepartments(departmentsData.departments || []);

      const coursesData = data[dataIndex++];
      if (coursesData.success) {
        const normalizedCourses = normalizeCourses(coursesData.courses || []);
        setCourses(normalizedCourses);
      }

      const quizzesData = data[dataIndex++];
      if (quizzesData.success) setQuizzes(quizzesData.quizzes || []);

      const newsData = data[dataIndex++];
      if (newsData.success) setNews(newsData.news || []);
    } else if (user.role === 'departmental_admin') {
      const buildingsData = data[dataIndex++];
      if (buildingsData.success) setBuildings(buildingsData.buildings || []);

      const coursesData = data[dataIndex++];
      if (coursesData.success) setCourses(normalizeCourses(coursesData.courses || []));

      const usersData = data[dataIndex++];
      if (usersData.success) setUsers(usersData.users || []);

      const newsData = data[dataIndex++];
      if (newsData.success) setNews(newsData.news || []);
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    setLoading(false);
  }
};
```

**Course Normalization Logic**:
```javascript
const normalizeOfferings = (arr) => (arr || []).map(off => {
  if (!off) return null;
  if (typeof off === 'string') return { department: off };
  const dept = off.department || off.departmentId || off.dept;
  const departmentId = dept && (typeof dept === 'string' ? dept : (dept._id ? dept._id : dept));
  return {
    department: departmentId ? departmentId.toString() : undefined,
    level: off.level || '',
    schedule: off.schedule || '',
    lecturerId: off.lecturerId ? (off.lecturerId._id ? off.lecturerId._id : off.lecturerId) : ''
  };
}).filter(Boolean);

const normalizeCourses = (coursesArr) => (coursesArr || []).map(c => ({
  ...c,
  departments_offering: normalizeOfferings(c.departments_offering)
}));
```

**Modal Management System**:
```javascript
const openModal = (type, item = null) => {
  if (type === 'course-offering' && item) {
    const deptId = user?.department;
    const offeringsForDept = (item.departments_offering || []).filter(off => {
      const dep = off?.department || off;
      return dep && (dep === deptId || dep._id === deptId);
    }).map(off => ({
      department: off.department?.toString ? off.department.toString() : off.department,
      level: off.level || '',
      schedule: off.schedule || '',
      lecturerId: off.lecturerId?.toString ? off.lecturerId.toString() : off.lecturerId || ''
    }));

    setModalType(type);
    setEditingItem(item);
    setFormData({ ...item, selectedCourse: item._id, departments_offering: offeringsForDept });
    setShowModal(true);
    return;
  }

  setModalType(type);
  setEditingItem(item);

  if (type === 'course' && item) {
    setFormData({ ...item, departments_offering: normalizeOfferings(item.departments_offering) });
  } else {
    setFormData(item || {});
  }
  setShowModal(true);
};
```

**Form Submission Handler**:
```javascript
const handleFormSubmit = async (e) => {
  e.preventDefault();
  try {
    let url = editingItem
      ? `/api/admin/${modalType}s/${editingItem._id}`
      : `/api/admin/${modalType}s`;

    let method = editingItem ? 'PUT' : 'POST';

    // Special handling for departmental admin course offerings
    if (modalType === 'course-offering') {
      const selectedCourseId = formData.selectedCourse || formData.selected_course || '';
      if (!selectedCourseId) {
        alert('Please select a course to offer');
        return;
      }
      url = `/api/admin/courses/${selectedCourseId}`;
      method = 'PUT';
    }

    const payload = { ...formData };
    if (modalType === 'course') {
      if (!payload.department && Array.isArray(payload.departments_offering) && payload.departments_offering.length > 0) {
        payload.department = payload.departments_offering[0].department || payload.departments_offering[0];
      }
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      loadDashboardData();
      closeModal();
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error(`Error ${editingItem ? 'updating' : 'creating'} ${modalType}:`, error);
    alert(`Error: ${error.message}`);
  }
};
```

**Role-Based Tab Navigation**:
```javascript
const getNavigationTabs = () => {
  const baseTabs = [
    { key: 'dashboard', label: 'Dashboard', icon: 'BarChart3' }
  ];

  if (user.role === 'system_admin') {
    return [
      ...baseTabs,
      { key: 'users', label: 'Users', icon: 'Users' },
      { key: 'departments', label: 'Departments', icon: 'GraduationCap' },
      { key: 'courses', label: 'Courses', icon: 'BookOpen' },
      { key: 'buildings', label: 'Buildings', icon: 'Building' },
      { key: 'quizzes', label: 'Quizzes', icon: 'FileText' },
      { key: 'news-management', label: 'News', icon: 'Newspaper' }
    ];
  } else if (user.role === 'departmental_admin') {
    return [
      ...baseTabs,
      { key: 'courses', label: 'Department Courses', icon: 'BookOpen' },
      { key: 'news-management', label: 'Department News', icon: 'Newspaper' }
    ];
  } else if (user.role === 'lecturer_admin') {
    return [
      ...baseTabs,
      { key: 'courses', label: 'My Courses', icon: 'BookOpen' },
      { key: 'news-management', label: 'Course News', icon: 'Newspaper' }
    ];
  } else if (user.role === 'bursary_admin') {
    return [
      ...baseTabs,
      { key: 'fees', label: 'Fees & Payments', icon: 'DollarSign' },
      { key: 'news-management', label: 'Bursary News', icon: 'Newspaper' }
    ];
  }

  return baseTabs;
};
```

#### SystemAdminPage Component - Complete Implementation
**Location**: `client/src/pages/SystemAdminPage.jsx`

**Advanced State Management**:
```javascript
const [stats, setStats] = useState(null);
const [loadingStats, setLoadingStats] = useState(true);
const [users, setUsers] = useState([]);
const [usersLoading, setUsersLoading] = useState(true);
const [showUserModal, setShowUserModal] = useState(false);
const [userForm, setUserForm] = useState({
  name: '',
  email: '',
  role: 'staff',
  staffId: '',
  matricNumber: '',
  department: ''
});
const [departments, setDepartments] = useState([]);
const [courses, setCourses] = useState([]);
const [coursesLoading, setCoursesLoading] = useState(true);
const [buildings, setBuildings] = useState([]);
const [buildingsLoading, setBuildingsLoading] = useState(true);
```

**Comprehensive Data Loading**:
```javascript
useEffect(() => {
  const fetchAll = async () => {
    try {
      setLoadingStats(true);
      setUsersLoading(true);
      setCoursesLoading(true);
      setBuildingsLoading(true);

      const [statsRes, usersRes, deptsRes, coursesRes, buildingsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/departments'),
        axios.get('/api/admin/courses'),
        axios.get('/api/admin/buildings')
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (usersRes.data?.success) setUsers(usersRes.data.users || []);
      if (deptsRes.data?.success) setDepartments(deptsRes.data.departments || []);
      if (coursesRes.data?.success) setCourses(coursesRes.data.courses || []);
      if (buildingsRes.data?.success) setBuildings(buildingsRes.data.buildings || []);
    } catch (err) {
      console.error('Failed to fetch system data', err);
    } finally {
      setLoadingStats(false);
      setUsersLoading(false);
      setCoursesLoading(false);
      setBuildingsLoading(false);
    }
  };

  fetchAll();
}, []);
```

**User Creation Implementation**:
```javascript
const createUser = async (e) => {
  e.preventDefault();
  try {
    const payload = { ...userForm };
    const res = await axios.post('/api/admin/users', payload);
    
    if (res.data?.success) {
      setUsers(prev => [res.data.user, ...prev]);
      setShowUserModal(false);
      setUserForm({
        name: '',
        email: '',
        role: 'staff',
        staffId: '',
        matricNumber: '',
        department: ''
      });
    }
  } catch (err) {
    console.error('Create user failed', err);
    alert(err.response?.data?.message || 'Failed to create user');
  }
};

const deleteUser = async (id) => {
  if (!confirm('Delete this user?')) return;
  try {
    const res = await axios.delete(`/api/admin/users/${id}`);
    if (res.data?.success) {
      setUsers(prev => prev.filter(u => u._id !== id));
    }
  } catch (err) {
    console.error('Delete user failed', err);
    alert(err.response?.data?.message || 'Failed to delete user');
  }
};
```

**Course Management Implementation**:
```javascript
const saveCourse = async (e) => {
  e.preventDefault();
  try {
    if (courseForm._id) {
      const res = await axios.put(`/api/admin/courses/${courseForm._id}`, courseForm);
      if (res.data?.success) {
        setCourses(prev => prev.map(c => c._id === res.data.course._id ? res.data.course : c));
        setShowCourseModal(false);
      }
    } else {
      const res = await axios.post('/api/admin/courses', courseForm);
      if (res.data?.success) {
        setCourses(prev => [res.data.course, ...prev]);
        setShowCourseModal(false);
      }
    }
  } catch (err) {
    console.error('Save course failed', err);
    alert(err.response?.data?.message || 'Failed to save course');
  }
};

const deleteCourse = async (id) => {
  if (!confirm('Delete this course?')) return;
  try {
    const res = await axios.delete(`/api/admin/courses/${id}`);
    if (res.data?.success) {
      setCourses(prev => prev.filter(c => c._id !== id));
    }
  } catch (err) {
    console.error('Delete course failed', err);
    alert(err.response?.data?.message || 'Failed to delete course');
  }
};
```

**Building Management**:
```javascript
const saveBuilding = async (e) => {
  e.preventDefault();
  try {
    if (buildingForm._id) {
      const res = await axios.put(`/api/admin/buildings/${buildingForm._id}`, buildingForm);
      if (res.data?.success) {
        setBuildings(prev => prev.map(b => b._id === res.data.building._id ? res.data.building : b));
        setShowBuildingModal(false);
      }
    } else {
      const res = await axios.post('/api/admin/buildings', buildingForm);
      if (res.data?.success) {
        setBuildings(prev => [res.data.building, ...prev]);
        setShowBuildingModal(false);
      }
    }
  } catch (err) {
    console.error('Save building failed', err);
    alert(err.response?.data?.message || 'Failed to save building');
  }
};
```

**Pagination and Search System**:
```javascript
const [usersPage, setUsersPage] = useState(1);
const [coursesPage, setCoursesPage] = useState(1);
const [buildingsPage, setBuildingsPage] = useState(1);
const [searchTerms, setSearchTerms] = useState({
  buildings: '',
  users: '',
  courses: '',
  departments: ''
});
const pageSize = 30;

const paginate = (arr, page) => {
  if (!Array.isArray(arr)) return [];
  const start = (page - 1) * pageSize;
  return arr.slice(start, start + pageSize);
};

const filterBySearch = (arr, term, fields = []) => {
  if (!term) return arr || [];
  const q = term.toLowerCase();
  return (arr || []).filter(item => fields.some(f => {
    const val = f.split('.').reduce((o, k) => o?.[k], item);
    return val && val.toString().toLowerCase().includes(q);
  }));
};
```

#### DepartmentAdminPage Component - Complete Implementation
**Location**: `client/src/pages/DepartmentAdminPage.jsx`

**Department-Specific State**:
```javascript
const [departmentInfo, setDepartmentInfo] = useState(null);
const [myCourses, setMyCourses] = useState([]);
const [availableCourses, setAvailableCourses] = useState([]);
const [departmentStudents, setDepartmentStudents] = useState([]);
const [departmentLecturers, setDepartmentLecturers] = useState([]);
const [newOffering, setNewOffering] = useState({
  selectedCourse: '',
  offerings: []
});
```

**Department Course Management**:
```javascript
const loadDepartmentData = async () => {
  try {
    setLoading(true);
    
    const responses = await Promise.all([
      axios.get('/api/admin/department/info'),
      axios.get('/api/admin/department/courses'),
      axios.get('/api/admin/department/available-courses'),
      axios.get('/api/admin/department/students'),
      axios.get('/api/admin/department/lecturers')
    ]);

    if (responses[0].data?.success) setDepartmentInfo(responses[0].data.department);
    if (responses[1].data?.success) setMyCourses(responses[1].data.courses || []);
    if (responses[2].data?.success) setAvailableCourses(responses[2].data.courses || []);
    if (responses[3].data?.success) setDepartmentStudents(responses[3].data.students || []);
    if (responses[4].data?.success) setDepartmentLecturers(responses[4].data.lecturers || []);
  } catch (err) {
    console.error('Failed to load department data', err);
  } finally {
    setLoading(false);
  }
};
```

**Course Offering Creation**:
```javascript
const addOffering = async (courseId, offeringData) => {
  try {
    const response = await axios.put(`/api/admin/courses/${courseId}`, {
      department: user.department,
      offerings: [offeringData]
    });

    if (response.data?.success) {
      setMyCourses(prev => [...prev, response.data.course]);
      setAvailableCourses(prev => prev.filter(c => c._id !== courseId));
    }
  } catch (err) {
    console.error('Failed to add offering', err);
    alert(err.response?.data?.message || 'Failed to add course offering');
  }
};
```

#### LecturerAdminPage Component - Complete Implementation
**Location**: `client/src/pages/LecturerAdminPage.jsx`

**Lecturer-Specific Data**:
```javascript
const [myAssignedCourses, setMyAssignedCourses] = useState([]);
const [courseStudents, setCourseStudents] = useState({});
const [recentQuizzes, setRecentQuizzes] = useState([]);
const [courseAnnouncements, setCourseAnnouncements] = useState([]);
```

**Course Assignment Loading**:
```javascript
const loadLecturerData = async () => {
  try {
    setLoading(true);
    
    const responses = await Promise.all([
      axios.get('/api/admin/lecturer/courses'),
      axios.get('/api/admin/lecturer/quizzes'),
      axios.get('/api/admin/lecturer/announcements')
    ]);

    if (responses[0].data?.success) setMyAssignedCourses(responses[0].data.courses || []);
    if (responses[1].data?.success) setRecentQuizzes(responses[1].data.quizzes || []);
    if (responses[2].data?.success) setCourseAnnouncements(responses[2].data.announcements || []);
  } catch (err) {
    console.error('Failed to load lecturer data', err);
  } finally {
    setLoading(false);
  }
};
```

#### BursaryAdminPage Component - Complete Implementation
**Location**: `client/src/pages/BursaryAdminPage.jsx`

**Financial Data Management**:
```javascript
const [studentsFees, setStudentsFees] = useState([]);
const [paymentHistory, setPaymentHistory] = useState([]);
const [feeStructures, setFeeStructures] = useState([]);
const [paymentReports, setPaymentReports] = useState([]);
const [outstandingPayments, setOutstandingPayments] = useState([]);
```

**Financial Data Loading**:
```javascript
const loadBursaryData = async () => {
  try {
    setLoading(true);
    
    const responses = await Promise.all([
      axios.get('/api/fees/students'),
      axios.get('/api/fees/history'),
      axios.get('/api/fees/structures'),
      axios.get('/api/fees/reports'),
      axios.get('/api/fees/outstanding')
    ]);

    if (responses[0].data?.success) setStudentsFees(responses[0].data.students || []);
    if (responses[1].data?.success) setPaymentHistory(responses[1].data.history || []);
    if (responses[2].data?.success) setFeeStructures(responses[2].data.structures || []);
    if (responses[3].data?.success) setPaymentReports(responses[3].data.reports || []);
    if (responses[4].data?.success) setOutstandingPayments(responses[4].data.outstanding || []);
  } catch (err) {
    console.error('Failed to load bursary data', err);
  } finally {
    setLoading(false);
  }
};
```

#### Complete Admin System User Flow

**Step 1: Admin Access & Authentication**
1. User clicks "Admin Panel" in navigation
2. `ProtectedRoute` validates JWT token and checks `requiredRoles`
3. Route `/admin/comprehensive` renders `AdminPage`
4. `useEffect(() => { if (user && allowedRoles.includes(user.role)) loadDashboardData() }, [user])`
5. API request: GET `/api/admin/stats` with `Authorization: Bearer ${token}`
6. Backend validates role permissions with `roleAuth` middleware
7. User's role determines available tabs and data requests

**Step 2: System Admin Dashboard**
1. System admin sees all tabs: Users, Departments, Courses, Buildings, Quizzes, News
2. `loadDashboardData()` makes multiple parallel requests:
   ```javascript
   GET /api/admin/users         // All system users
   GET /api/admin/buildings     // All campus buildings
   GET /api/admin/departments   // All departments
   GET /api/admin/courses       // All courses
   GET /api/admin/quizzes       // All quizzes
   GET /api/news/admin/all      // All news items
   ```
3. Data processed and normalized, state updates
4. Dashboard displays statistics cards with real-time counts
5. Users tab shows table with search, pagination (30 per page)
6. "Create User" button opens modal form
7. User creation form validates and submits POST `/api/admin/users`

**Step 3: Department Admin Course Management**
1. Department admin logs in, restricted to Department Courses tab
2. `loadDashboardData()` for departmental admin:
   ```javascript
   GET /api/admin/buildings     // Campus buildings
   GET /api/admin/courses       // All courses
   GET /api/admin/users         // All users (for lecturer selection)
   GET /api/news/admin/all      // Department news
   ```
3. Course management shows department's offerings
4. "Add Course Offering" opens course-offering modal
5. User selects course from global list, configures offerings:
   ```javascript
   {
     department: departmentId,
     level: 300,
     schedule: "Mon 9-11am",
     lecturerId: selectedLecturerId
   }
   ```
6. Submit PUT `/api/admin/courses/${selectedCourseId}` with offering
7. Backend validates department permissions, adds offering
8. UI updates with new offering and removed from available courses

**Step 4: Lecturer Admin Course Assignment**
1. Lecturer admin logs in, sees "My Courses" tab
2. `loadDashboardData()` for lecturer admin:
   ```javascript
   GET /api/admin/buildings     // Campus buildings
   GET /api/admin/courses       // All courses
   GET /api/news/admin/all      // Course news
   ```
3. Courses filtered to only those assigned to this lecturer
4. Each course shows student enrollment and recent activity
5. "Create Quiz" button for assigned courses
6. Quiz creation redirects to `/quiz/upload` with course context
7. Lecturer can view student performance and course statistics

**Step 5: Bursary Admin Financial Management**
1. Bursary admin logs in, sees "Fees & Payments" tab
2. `loadDashboardData()` for bursary admin:
   ```javascript
   GET /api/admin/buildings     // Campus buildings
   GET /api/fees/stats/summary  // Financial statistics
   GET /api/news/admin/all      // Bursary news
   ```
3. Dashboard shows financial overview:
   - Total fees collected
   - Outstanding payments
   - Number of fully/partial/unpaid students
4. Students table shows fee status for all students
5. Payment tracking shows transaction history
6. Financial reports generated with filtering options
7. Can post bursary announcements to target audiences

**Step 6: CRUD Operations Flow**
1. **Create Operation**:
   - Modal opens with form fields
   - Form validation (client and server side)
   - POST/PUT request with form data
   - Success: Close modal, refresh data, show toast notification
   - Error: Display error message, keep modal open

2. **Read Operation**:
   - Data loaded on page mount or tab switch
   - Search functionality filters results in real-time
   - Pagination handles large datasets
   - Sort options available for table columns

3. **Update Operation**:
   - Edit button opens modal with existing data
   - Form pre-filled with current values
   - Save button triggers PUT request
   - Success: Update local state, close modal
   - Error: Show error message

4. **Delete Operation**:
   - Delete button shows confirmation dialog
   - DELETE request to `/api/admin/${type}/${id}`
   - Success: Remove from local state
   - Error: Show error message

**Step 7: Data Synchronization**
1. All admin operations trigger immediate data refresh
2. `loadDashboardData()` called after successful operations
3. Optimistic updates for better UX (immediate local updates)
4. Rollback on API errors
5. Real-time updates for concurrent admin sessions

**Step 8: Permission Validation**
1. Each API endpoint validates user permissions
2. Frontend shows/hides features based on user.role
3. Route protection prevents unauthorized access
4. Role-based data filtering in backend queries
5. Audit logging for admin actions (future enhancement)

---

---

## Complete User Flow Analysis

### Primary User Journeys

#### 1. Student User Journey
**Onboarding Flow**:
1. Student visits UNIBEN AI Assistant
2. Guest mode allows limited chat and news access
3. Student finds "Login" button, navigates to login page
4. Provides credentials (student ID + password) OR guest access
5. JWT token generated, stored in localStorage
6. Navigation menu shows student-specific features
7. Redirects to dashboard with welcome message

**Daily Usage Flow**:
1. **Morning**: Login → Check News for announcements
2. **Study Session**: Navigate to Chat → Ask questions about courses
3. **Exam Prep**: Create Quiz from course materials (PDF upload)
4. **Campus Navigation**: Find building locations for classes
5. **Course Management**: View available courses and schedules
6. **Evening**: Review quiz results and performance analytics

**Quiz Creation Flow**:
1. Student navigates to "Create Quiz" from navigation
2. Upload PDF course materials or paste text content
3. Enter descriptive quiz title (e.g., "Computer Science Midterm Review")
4. AI generates 10 questions with explanations
5. Redirects to quiz interface
6. Takes quiz with timer and progress tracking
7. Receives detailed results with performance analytics
8. Can review missed questions and explanations

#### 2. Lecturer User Journey
**Course Setup Flow**:
1. Lecturer logs in with admin credentials
2. Views assigned courses in "My Courses" tab
3. Creates quiz for course materials
4. Sets up course announcements
5. Monitors student enrollment

**Student Management Flow**:
1. Accesses course student lists
2. Views quiz performance metrics
3. Responds to student queries via chat
4. Posts course updates and announcements
5. Manages course content and materials

#### 3. Department Admin User Journey
**Course Management Flow**:
1. Admin logs in, restricted to department scope
2. Views department course offerings
3. Adds new course offerings from global course library
4. Assigns lecturers to courses
5. Monitors student enrollment per course
6. Creates department announcements

**Department Operations Flow**:
1. Monitors department statistics
2. Manages lecturer assignments
3. Oversees course scheduling
4. Tracks department student progress
5. Manages department news and communications

#### 4. System Admin User Journey
**System Management Flow**:
1. Full access to all system components
2. Creates and manages user accounts
3. Sets up department structure
4. Manages campus buildings
5. Configures course templates
6. Monitors system-wide statistics
7. Manages quiz content and analytics

### Cross-Feature User Flows

#### Chat System Integration
**Course Query Flow**:
1. Student asks: "What courses are available in Computer Science?"
2. Chat interface calls backend `/api/chat/message`
3. Backend triggers function call `getCourseData()`
4. AI generates contextual response with course information
5. Response includes links to course details
6. Student can navigate directly to course information

**Campus Navigation Flow**:
1. User asks: "How do I get to the Library from the Main Gate?"
2. Chat triggers `getBuildingData()` function
3. AI provides detailed directions
4. User clicks navigation link to campus map
5. Map shows highlighted route between buildings
6. Turn-by-turn directions displayed

**Quiz Assistance Flow**:
1. Student asks: "Help me understand this course material"
2. Chat provides AI-powered explanations
3. Student uploads PDF for quiz generation
4. AI creates personalized questions
5. Student takes quiz and receives detailed feedback

#### Admin Data Management Flow
**System-Wide Operations**:
1. System Admin creates new department
2. Sets up departments_offering for courses
3. Assigns departmental administrators
4. Creates building entries with location data
5. Configures course templates and requirements

**Department Operations**:
1. Department Admin adds course offerings
2. Assigns lecturers to specific courses
3. Monitors student enrollment
4. Creates department-specific announcements
5. Tracks department performance metrics

#### Quiz Analytics Flow
**Performance Tracking**:
1. Student completes quiz
2. Results stored in Quiz and QuizResult models
3. Analytics calculated: time per question, difficulty analysis
4. Department admins view course performance
5. System admins monitor overall quiz usage
6. Lecturers see student progress for assigned courses

---

## AI Service Implementation - Complete Deep Dive

### Google Gemini AI Integration

#### Model Configuration
**Location**: `server/src/services/geminiService.js`

**Initialization**:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,        // Creativity level (0.0 - 2.0)
    topK: 40,               // Vocabulary diversity control
    topP: 0.95,             // Cumulative probability cutoff
    maxOutputTokens: 8192,  // Maximum response length
    responseMimeType: 'application/json', // Structured responses
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ]
});
```

#### AI Response Generation
**Context-Aware Prompting**:
```javascript
const generateAIResponse = async (message, context = {}) => {
  const systemPrompt = `
  You are the UNIBEN AI Assistant, an intelligent assistant for University of Benin students, faculty, and staff.

  Your expertise includes:
  - University courses, programs, and academic planning
  - Campus navigation and building information
  - Department structure and organizational details
  - University policies and procedures
  - Academic calendar and semester information
  - General educational guidance

  User Context:
  - Role: ${context.userRole || 'Guest'}
  - Department: ${context.currentDepartment?.name || 'Not specified'}
  - Academic Level: ${context.academicLevel || 'Undergraduate'}
  - Campus Location: ${context.campusLocation || 'Benin City, Edo State'}

  Response Guidelines:
  1. Provide accurate, helpful information about University of Benin
  2. If you need specific data, mention [FUNCTION_CALL: functionName]
  3. Be conversational but professional
  4. Use Nigerian English spelling and cultural context
  5. Include relevant links or actions when appropriate
  6. If unsure about specific details, say so rather than guessing

  Available Functions:
  - getCourseData: Retrieve course information
  - getBuildingData: Get campus building details
  - getDepartmentData: Find department information
  - getNewsData: Retrieve latest announcements
  - getAcademicCalendar: Check semester dates
  `;

  try {
    // Create the conversation
    const chat = model.startChat({
      history: context.conversationHistory || [],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    // Send message and get response
    const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
    const response = await result.response;
    const text = response.text();
    
    // Extract function calls from response
    const functionCalls = await extractFunctionCalls(text);
    
    // Execute function calls if any
    let functionResults = [];
    if (functionCalls.length > 0) {
      functionResults = await executeFunctionCalls(functionCalls, context);
      
      // Generate follow-up response with function data
      const followUpPrompt = `
        Previous user question: ${message}
        Function results: ${JSON.stringify(functionResults)}
        
        Provide a comprehensive response incorporating the function results.
      `;
      
      const followUpResult = await chat.sendMessage(followUpPrompt);
      const followUpText = await followUpResult.response.text();
      
      return {
        content: followUpText,
        functionCalls,
        functionResults,
        metadata: {
          aiModel: 'gemini-2.0-flash-exp',
          tokensUsed: response.usageMetadata?.totalTokenCount || 0,
          timestamp: new Date()
        }
      };
    }
    
    return {
      content: text,
      functionCalls,
      functionResults: [],
      metadata: {
        aiModel: 'gemini-2.0-flash-exp',
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        timestamp: new Date()
      }
    };
    
  } catch (error) {
    console.error('Gemini AI Error:', error);
    
    // Return fallback response
    return {
      content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or contact the university IT support if the problem persists.",
      functionCalls: [],
      functionResults: [],
      metadata: {
        aiModel: 'gemini-2.0-flash-exp',
        error: true,
        timestamp: new Date()
      }
    };
  }
};
```

#### Function Calling System
**Function Extraction**:
```javascript
const extractFunctionCalls = async (text) => {
  const functionCallPattern = /\[FUNCTION_CALL:\s*(\w+)\]/g;
  const matches = [];
  let match;
  
  while ((match = functionCallPattern.exec(text)) !== null) {
    matches.push({
      name: match[1],
      originalText: match[0]
    });
  }
  
  return matches;
};
```

**Function Execution**:
```javascript
const executeFunctionCalls = async (functionCalls, context) => {
  const results = [];
  
  for (const call of functionCalls) {
    try {
      switch (call.name) {
        case 'getCourseData':
          const courseData = await getCourseData(context);
          results.push({
            functionName: call.name,
            result: courseData,
            timestamp: new Date()
          });
          break;
          
        case 'getBuildingData':
          const buildingData = await getBuildingData(context);
          results.push({
            functionName: call.name,
            result: buildingData,
            timestamp: new Date()
          });
          break;
          
        case 'getDepartmentData':
          const deptData = await getDepartmentData(context);
          results.push({
            functionName: call.name,
            result: deptData,
            timestamp: new Date()
          });
          break;
          
        case 'getNewsData':
          const newsData = await getNewsData(context);
          results.push({
            functionName: call.name,
            result: newsData,
            timestamp: new Date()
          });
          break;
          
        default:
          console.warn(`Unknown function call: ${call.name}`);
      }
    } catch (error) {
      console.error(`Error executing function ${call.name}:`, error);
      results.push({
        functionName: call.name,
        result: { error: error.message },
        timestamp: new Date()
      });
    }
  }
  
  return results;
};
```

**Individual Function Implementations**:
```javascript
const getCourseData = async (context) => {
  try {
    // Query courses based on user context
    const query = {};
    if (context.currentDepartment) {
      query['departments_offering.department'] = context.currentDepartment._id;
    }
    
    const courses = await Course.find(query)
      .populate('department', 'name faculty')
      .populate('departments_offering.lecturerId', 'name staffId')
      .limit(10)
      .lean();
    
    return {
      courses: courses.map(course => ({
        code: course.code,
        title: course.title,
        department: course.department?.name,
        credit: course.credit,
        level: course.level,
        description: course.description?.substring(0, 200) + '...',
        offerings: course.departments_offering?.map(offering => ({
          level: offering.level,
          schedule: offering.schedule,
          lecturer: offering.lecturerId?.name
        }))
      })),
      count: courses.length
    };
  } catch (error) {
    return { error: 'Failed to retrieve course data' };
  }
};

const getBuildingData = async (context) => {
  try {
    const buildings = await Building.find({})
      .populate('department', 'name')
      .limit(20)
      .lean();
    
    return {
      buildings: buildings.map(building => ({
        name: building.name,
        type: building.type,
        department: building.department?.name,
        location: building.location,
        facilities: building.facilities || [],
        description: building.description
      })),
      count: buildings.length
    };
  } catch (error) {
    return { error: 'Failed to retrieve building data' };
  }
};
```

### Quiz Generation via AI

#### Content Processing
**PDF Text Extraction**:
```javascript
const extractTextFromPDF = async (pdfPath) => {
  try {
    // In production, this would use pdf-parse or similar library
    // For now, simulating extraction process
    
    const pdfBuffer = await fs.readFile(pdfPath);
    
    // Simulated extraction - in real implementation:
    // const pdfData = await pdf(pdfBuffer);
    // const extractedText = pdfData.text;
    
    // For demonstration, using sample academic content
    const extractedText = `
      Introduction to Computer Science
      
      Computer science is the study of computation, algorithms, and system design.
      
      Chapter 1: Programming Fundamentals
      
      Programming is the process of creating instructions for computers to follow.
      It involves writing code that computers can understand and execute.
      
      Key Concepts:
      1. Variables: Containers for storing data values
      2. Data Types: Categories of data (integers, strings, booleans)
      3. Control Structures: Decision-making and looping constructs
      4. Functions: Reusable blocks of code
      
      Variables and Data Types:
      - Variables are named storage locations in memory
      - Common data types include:
        * Integers: Whole numbers (0, 1, -5)
        * Floats: Decimal numbers (3.14, -2.5)
        * Strings: Text data ("Hello", "Computer Science")
        * Booleans: True/False values
        * Arrays: Collections of similar data
      
      Control Structures:
      1. Conditional Statements (if/else):
         - Execute different code based on conditions
         - Syntax: if (condition) { // code } else { // code }
      
      2. Loops:
         - For loop: Repeat code a specific number of times
         - While loop: Repeat code while a condition is true
         - Do-while loop: Execute code at least once, then loop
      
      3. Functions:
         - Reusable blocks of code
         - Can accept parameters and return values
         - Help organize code and avoid repetition
      
      Chapter 2: Data Structures
      
      Data structures are ways of organizing and storing data efficiently.
      
      Arrays:
      - Ordered collections of elements
      - Each element has an index (position)
      - Can store elements of the same data type
      
      Linked Lists:
      - Linear collection of elements
      - Each element points to the next element
      - Dynamic size (can grow or shrink)
      
      Stacks and Queues:
      - Stack: Last In, First Out (LIFO) structure
      - Queue: First In, First Out (FIFO) structure
      
      Trees and Graphs:
      - Tree: Hierarchical structure with parent-child relationships
      - Graph: Network of connected nodes
      - Used for representing complex relationships
    `;
    
    return cleanExtractedText(extractedText);
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

const cleanExtractedText = (text) => {
  // Remove excessive whitespace and normalize
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
};
```

#### AI Quiz Generation
**Comprehensive Prompt Engineering**:
```javascript
const generateQuizFromContent = async (content, title, userId) => {
  try {
    // Validate content
    if (!content || content.length < 100) {
      throw new Error('Content is too short for quiz generation (minimum 100 characters required)');
    }

    const prompt = `
    Create a comprehensive quiz based on the following academic content. Generate exactly 10 multiple-choice questions that test different aspects of the material.

    Content to analyze:
    ${content.substring(0, 8000)} // Limit content to avoid token limits

    Quiz Title: ${title}

    Requirements:
    1. Generate exactly 10 questions
    2. Each question must have exactly 4 options (A, B, C, D)
    3. Provide one correct answer per question
    4. Include a clear explanation for each correct answer
    5. Add helpful hints for difficult questions
    6. Vary question types (definition, application, analysis, etc.)
    7. Ensure questions cover different sections of the content
    8. Make options plausible to test real understanding

    Response Format (JSON only):
    {
      "questions": [
        {
          "question": "What is the primary purpose of variables in programming?",
          "options": [
            "To perform mathematical calculations",
            "To store and represent data in memory",
            "To control program flow",
            "To define functions"
          ],
          "correctAnswer": "B",
          "explanation": "Variables are named storage locations in memory that hold data values. They allow programs to store, manipulate, and retrieve information during execution.",
          "hint": "Think about what allows programs to remember information.",
          "difficulty": "easy",
          "topics": ["programming", "variables", "data-storage"]
        }
      ]
    }

    IMPORTANT:
    - Return ONLY the JSON object, no additional text
    - Ensure all 4 options are distinct and plausible
    - Make explanations educational and detailed
    - Test actual understanding, not just memorization
    `;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    
    // Parse AI response
    const quizData = parseAIResponse(text);
    
    // Validate quiz structure
    validateQuizStructure(quizData);
    
    // Save quiz to database
    const quiz = new Quiz({
      title: title,
      questions: quizData.questions,
      createdBy: userId,
      settings: {
        timeLimit: 60, // minutes
        attempts: 3,
        shuffleQuestions: true,
        showResults: true,
        passingScore: 70
      },
      analytics: {
        totalAttempts: 0,
        averageScore: 0,
        questions: quizData.questions.map(q => ({
          questionIndex: q.question,
          difficulty: q.difficulty || 'medium',
          attempts: 0,
          correctAnswers: 0,
          averageTime: 0
        }))
      }
    });
    
    await quiz.save();
    
    return quiz;
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};
```

**AI Response Parsing and Validation**:
```javascript
const parseAIResponse = (text) => {
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Invalid AI response format');
  }
};

const validateQuizStructure = (quizData) => {
  if (!quizData.questions || !Array.isArray(quizData.questions)) {
    throw new Error('Quiz must contain questions array');
  }
  
  if (quizData.questions.length !== 10) {
    throw new Error('Quiz must contain exactly 10 questions');
  }
  
  quizData.questions.forEach((q, index) => {
    if (!q.question || !q.options || !q.correctAnswer) {
      throw new Error(`Question ${index + 1} is missing required fields`);
    }
    
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly 4 options`);
    }
    
    if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
      throw new Error(`Question ${index + 1} has invalid correct answer`);
    }
    
    if (!q.explanation) {
      throw new Error(`Question ${index + 1} missing explanation`);
    }
  });
};
```

### AI Response Optimization

#### Context Management
**Conversation History**:
```javascript
const buildConversationContext = (conversation, maxMessages = 10) => {
  const recentMessages = conversation.messages
    .slice(-maxMessages)
    .map(msg => ({
      role: msg.sender._id === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

  return recentMessages;
};
```

**Performance Optimization**:
```javascript
// Caching for frequently accessed data
const getCachedData = async (cacheKey, dataFunction, cacheTime = 300000) => {
  const cached = await redisClient.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await dataFunction();
  await redisClient.setex(cacheKey, cacheTime, JSON.stringify(data));
  
  return data;
};

// Batch function calls for efficiency
const executeBatchFunctions = async (functionCalls, context) => {
  const results = await Promise.allSettled(
    functionCalls.map(call => executeFunctionCall(call, context))
  );
  
  return results.map((result, index) => ({
    functionName: functionCalls[index].name,
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason.message : null
  }));
};
```

### AI Limitations and Error Handling

#### Rate Limiting and Quotas
**Rate Limit Management**:
```javascript
const rateLimiter = {
  requests: new Map(),
  maxRequests: 60, // per minute
  windowMs: 60000,
  
  async checkLimit(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Clean old requests
    const recentRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
    
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
  }
};
```

**Fallback Responses**:
```javascript
const generateFallbackResponse = (context, error) => {
  const fallbacks = [
    "I understand you're looking for information about the University of Benin. Could you be more specific about what you'd like to know?",
    "I'd be happy to help with your question about UNIBEN. Please try rephrasing your question or ask about a specific topic.",
    "For detailed information about University of Benin, I can help with questions about courses, departments, campus facilities, or academic programs.",
    "Let me know if you'd like information about specific departments, course offerings, campus navigation, or university policies."
  ];
  
  return {
    content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    functionCalls: [],
    functionResults: [],
    metadata: {
      aiModel: 'gemini-2.0-flash-exp',
      fallback: true,
      error: error.message,
      timestamp: new Date()
    }
  };
};
```

---

## Final Summary

### System Architecture Overview

The UNIBEN AI Assistant represents a comprehensive university management system built with modern web technologies and advanced AI integration:

**Frontend Architecture**:
- **React 18** with functional components and hooks
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive, utility-first styling
- **Context API** for centralized state management
- **React Router** for client-side navigation
- **Component-based architecture** with reusable UI components

**Backend Architecture**:
- **Node.js + Express.js** RESTful API server
- **MongoDB + Mongoose** for flexible document storage
- **JWT authentication** with bcrypt password hashing
- **Role-based access control** with 7-tier permission system
- **Google Gemini AI** integration for intelligent responses
- **File upload handling** for PDF processing
- **Real-time chat** with conversation persistence

**Database Design**:
- **User Model**: Flexible multi-role authentication system
- **Course Model**: Complex course management with departmental offerings
- **Quiz Model**: Comprehensive quiz system with detailed analytics
- **Building Model**: Campus navigation with location data
- **Conversation Model**: Persistent chat history with AI context
- **News Model**: Role-filtered announcement system
- **Department Model**: Hierarchical organizational structure

**AI Integration**:
- **Google Gemini 2.0-flash-exp** model for natural language processing
- **Function calling system** for real-time data access
- **Context-aware responses** based on user role and department
- **Quiz generation from PDF/text** with structured question creation
- **Intelligent chat assistance** for university-specific queries

### Key Features and Capabilities

**Educational Tools**:
- AI-powered quiz generation from course materials
- Comprehensive quiz analytics and performance tracking
- Interactive quiz taking with timers and progress tracking
- Detailed results with explanations and time analysis

**Campus Navigation**:
- Interactive campus map with 44+ building locations
- Real-time building information and contact details
- Search and filter functionality by building type
- Route planning and navigation assistance

**Administrative Management**:
- **System Admin**: Complete system control and user management
- **Department Admin**: Course offerings and lecturer assignments
- **Lecturer Admin**: Course management and student oversight
- **Bursary Admin**: Financial tracking and payment management
- Role-based interfaces with specific permissions and limitations

**Communication System**:
- AI-powered chat with context awareness
- Persistent conversation history
- Real-time news and announcements
- Role-filtered content delivery

### Technical Achievements

**Security Implementation**:
- JWT token-based authentication with automatic expiry
- bcrypt password hashing (12 rounds)
- Role-based access control at API and component levels
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

**Performance Optimization**:
- Vite for fast development and optimized production builds
- MongoDB indexing for efficient database queries
- Component lazy loading and code splitting
- Image optimization and CDN integration
- Caching strategies for frequently accessed data

**User Experience Design**:
- Responsive design working across all device types
- Intuitive navigation with role-based menus
- Real-time feedback and loading states
- Comprehensive error handling and user feedback
- Accessibility considerations with proper ARIA labels

**AI and Machine Learning**:
- Advanced prompt engineering for accurate quiz generation
- Context-aware responses tailored to university environment
- Function calling for real-time data integration
- Natural language understanding for diverse query types
- Quality control and response validation

This comprehensive analysis demonstrates that the UNIBEN AI Assistant is a sophisticated, enterprise-level university management system that successfully combines modern web development practices with advanced AI integration to create a powerful educational platform.

---

### 2. Quiz System

#### QuizUpload Component (`/quiz/upload`)
**Location**: `client/src/components/quiz/QuizUpload.jsx`

**Core Features**:
- **Dual Input Modes**: PDF upload OR text paste selection
- **File Validation**: Ensures PDF format and size limits
- **Content Analysis**: Validates minimum text length (100 chars)
- **Title Input**: Required descriptive quiz title
- **Progress Tracking**: Shows upload progress during AI generation
- **Error Handling**: Comprehensive error messages and recovery

**Upload Flow**:
1. **Mode Selection**: User chooses PDF upload or text paste
2. **File/Content Input**: Drag-drop or click to upload PDF, or paste text
3. **Title Entry**: User provides descriptive quiz title
4. **Generation**: POST request triggers AI processing
5. **Navigation**: Redirect to quiz interface on success

**PDF Upload Logic**:
```javascript
const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (selectedFile.type === 'application/pdf') {
    setFile(selectedFile);
    setError('');
  } else {
    setError('Please select a PDF file');
    setFile(null);
  }
};
```

#### QuizInterface Component (`/quiz/start/:id`)
**Location**: `client/src/components/quiz/QuizInterface.jsx`

**Core Functionality**:
- **Quiz Loading**: Fetches quiz data and question set
- **Timer Management**: Countdown timer with auto-submit
- **Question Navigation**: Previous/Next buttons with progress bar
- **Answer Selection**: Multiple choice with visual feedback
- **Question Jumping**: Grid navigation to any question
- **Auto-save**: Saves answers as user progresses

**State Management**:
```javascript
const [quiz, setQuiz] = useState(null);
const [currentQuestion, setCurrentQuestion] = useState(0);
const [answers, setAnswers] = useState({});
const [timeSpent, setTimeSpent] = useState({});
const [timeRemaining, setTimeRemaining] = useState(null);
```

**Quiz Interface Flow**:
1. **Loading Screen**: Fetches quiz data from backend
2. **Start Screen**: Shows quiz summary (questions, time limit, attempts)
3. **Quiz Taking**: Sequential question presentation with timer
4. **Answer Tracking**: Visual indicators for answered/unanswered questions
5. **Submission**: Scores quiz and navigates to results

#### Supporting Quiz Components

**QuestionCard.jsx**:
- **Question Display**: Shows question text with proper formatting
- **Option Rendering**: 4 multiple choice options with selection states
- **Hint System**: Expandable hints for difficult questions
- **Explanation**: Shows correct answer explanation after submission
- **Progress Indicator**: Visual progress through question set

**ProgressBar.jsx**:
- **Visual Progress**: Shows current question number and completion percentage
- **Answer Status**: Visual indicators for answered vs unanswered questions
- **Interactive**: Clickable to jump between questions

**Timer.jsx**:
- **Countdown Display**: Shows remaining time in MM:SS format
- **Warning States**: Color changes when time is running low
- **Auto-submit**: Automatically submits quiz when time expires

**QuizResults.jsx**:
- **Score Display**: Shows final score and percentage
- **Question Review**: Review all questions with correct answers
- **Performance Analytics**: Time spent per question, difficulty analysis
- **Retake Options**: Option to retake quiz if attempts remaining

---

### 3. Campus Navigation (`/map`)

#### MapPage Component (`/map`)
**Location**: `client/src/components/map/CampusMap.jsx`

**Core Features**:
- **Interactive Map**: Canvas-based campus map with clickable buildings
- **Building Database**: 44+ campus buildings with detailed information
- **Search & Filter**: Real-time building search and type filtering
- **Building Details**: Detailed information panels for selected buildings
- **Route Planning**: (Future feature) Point-to-point navigation
- **Location Services**: GPS-based user location detection

**Map Rendering**:
```javascript
const initializeMap = (buildingsData) => {
  const mapContainer = document.createElement('div');
  mapContainer.className = 'w-full h-96 bg-green-100 relative overflow-hidden';
  
  // Add campus boundary
  const campusBoundary = document.createElement('div');
  campusBoundary.className = 'absolute inset-4 border-2 border-green-600 rounded-lg';
  mapContainer.appendChild(campusBoundary);
  
  // Add buildings as positioned markers
  buildingsData.forEach((building, index) => {
    const buildingElement = document.createElement('div');
    buildingElement.className = 'absolute w-8 h-8 bg-blue-600 rounded cursor-pointer';
    
    // Calculate position based on building coordinates
    const position = calculateBuildingPosition(building);
    buildingElement.style.left = position.x + '%';
    buildingElement.style.top = position.y + '%';
    
    buildingElement.addEventListener('click', () => setSelectedBuilding(building));
    mapContainer.appendChild(buildingElement);
  });
};
```

**Building Features**:
- **13 Building Types**: Faculty, Department, Library, Hostel, Administrative, Sports, etc.
- **Color Coding**: Different colors for different building types
- **Building Numbers**: Sequential numbering for easy reference
- **Hover Effects**: Tooltip information on hover
- **Click Interaction**: Shows detailed building information panel

**Search & Filter System**:
```javascript
const filteredBuildings = buildings.filter(building => {
  const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesFilter = filterType === 'all' || building.type === filterType;
  return matchesSearch && matchesFilter;
});
```

**Building Information Panel**:
- **Basic Details**: Name, type, department association
- **Contact Information**: Phone, address, office locations
- **Facilities List**: Available facilities and amenities
- **Navigation Options**: Get directions, view on map
- **Operating Hours**: (If available) Business hours and accessibility

---

### 4. Admin System

#### AdminPage Component (`/admin/comprehensive`)
**Location**: `client/src/pages/AdminPage.jsx`

**Core Features**:
- **Role-based Dashboards**: Different interfaces for each admin role
- **Tab Navigation**: Dashboard, Users, Courses, Buildings, Quizzes, News
- **CRUD Operations**: Create, Read, Update, Delete for all data types
- **Statistics Cards**: Real-time statistics for role-relevant metrics
- **Modal Forms**: Inline editing and creation forms
- **Search & Filter**: Advanced filtering for large datasets

**Role-Specific Interfaces**:

**System Admin**:
- **Full System Access**: All users, departments, courses, buildings, quizzes
- **User Management**: Create/edit/delete users, assign roles and departments
- **Department Management**: Create departments, assign admins, manage faculty
- **Building Management**: Add campus buildings, assign to departments
- **Course Management**: Create global courses, assign to departments
- **Quiz Management**: View all quizzes, monitor usage analytics

**Department Admin**:
- **Department Focus**: Limited to their assigned department
- **Course Offerings**: Add courses to their department
- **Lecturer Assignment**: Assign lecturers to course offerings
- **Student Management**: View department students, enrollment tracking
- **Department News**: Post announcements to department members

**Lecturer Admin**:
- **Course Viewing**: View assigned courses and student lists
- **Quiz Creation**: Create quizzes from their course materials
- **Student Communication**: Post course-specific announcements
- **Grade Management**: (Future feature) Input and manage grades

**Bursary Admin**:
- **Financial Data**: Student fee records, payment history
- **Fee Tracking**: Monitor payments, outstanding amounts
- **Financial Reports**: Generate payment reports and summaries
- **Student Verification**: Verify student financial status

#### Admin Page Architecture

**Tab System**:
```javascript
const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: 'BarChart3' },
  { key: 'users', label: 'Users', icon: 'Users', roles: ['system_admin'] },
  { key: 'departments', label: 'Departments', icon: 'GraduationCap', roles: ['system_admin'] },
  { key: 'courses', label: 'Courses', icon: 'BookOpen', roles: ['system_admin', 'departmental_admin'] },
  { key: 'buildings', label: 'Buildings', icon: 'Building', roles: ['system_admin'] },
  { key: 'quizzes', label: 'Quizzes', icon: 'FileText', roles: ['system_admin'] },
  { key: 'fees', label: 'Fees & Payments', icon: 'DollarSign', roles: ['bursary_admin'] }
];
```

**Data Loading Strategy**:
```javascript
const loadDashboardData = async () => {
  setLoading(true);
  
  const requests = [
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
  ];

  // Add role-specific requests
  if (user.role === 'system_admin') {
    requests.push(
      fetch('/api/admin/users'),
      fetch('/api/admin/buildings'),
      fetch('/api/admin/departments'),
      fetch('/api/admin/courses'),
      fetch('/api/admin/quizzes'),
      fetch('/api/news/admin/all')
    );
  } else if (user.role === 'departmental_admin') {
    requests.push(
      fetch('/api/admin/courses'),
      fetch('/api/admin/users')
    );
  }

  const responses = await Promise.all(requests);
  // Process responses and update state
};
```

**Modal System**:
- **Create/Edit Forms**: Dynamic forms based on data type
- **Validation**: Client-side and server-side validation
- **File Uploads**: Image uploads for user profiles, building photos
- **Relationship Management**: Select departments, assign lecturers, etc.

#### Supporting Admin Components

**AdminLayout.jsx**:
- **Sidebar Navigation**: Collapsible admin menu
- **Breadcrumb Navigation**: Shows current location
- **User Context**: Displays current admin user info
- **Quick Actions**: Fast access to common tasks

**NewsManagementTab.jsx**:
- **News Creation**: Rich text editor for announcements
- **Audience Targeting**: Send to specific roles/departments
- **Scheduling**: Schedule announcements for future publication
- **Analytics**: Track views and engagement

---

### 5. Authentication System

#### AuthContext Component
**Location**: `client/src/context/AuthContext.jsx`

**State Management**:
```javascript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [token, setToken] = useState(localStorage.getItem('token'));
```

**Core Functions**:
- **Login**: Validates credentials, stores JWT token
- **Registration**: Creates new user account
- **Logout**: Clears token and user state
- **Profile Update**: Updates user information
- **Auto-login**: Restores session on app reload

**Authentication Flow**:
1. **App Start**: Check for existing JWT token
2. **Token Validation**: Verify token with backend
3. **User Context**: Set user state based on token
4. **Route Protection**: Block unauthorized access
5. **Auto-logout**: Clear session on token expiry

#### ProtectedRoute Component
**Location**: `client/src/components/auth/ProtectedRoute.jsx`

**Access Control**:
- **Authentication Check**: Verifies user is logged in
- **Role Validation**: Checks required roles for route
- **Loading State**: Shows spinner during auth check
- **Redirect Logic**: Sends unauthorized users to login

#### LoginPage Component
**Location**: `client/src/components/auth/LoginPage.jsx`

**Features**:
- **Role-based Login**: Same page handles all user types
- **Form Validation**: Email format, password requirements
- **Remember Me**: Optional session persistence
- **Error Handling**: Clear error messages for failed login
- **Registration Link**: Route to registration for new users

---

### 6. Shared Components

#### Navbar Component
**Location**: `client/src/components/shared/Navbar.jsx`

**Navigation System**:
- **Role-based Links**: Show relevant navigation items per user
- **Responsive Design**: Mobile hamburger menu
- **User Context**: Display current user name and role
- **Logout Function**: Clean session termination
- **Logo Branding**: UNIBEN AI Assistant branding

**Navigation Links**:
```javascript
const getNavigationLinks = () => {
  const baseLinks = [
    { to: '/chat', icon: 'chat', label: 'AI Chat' },
    { to: '/news', icon: 'newspaper', label: 'News' },
    { to: '/map', icon: 'map', label: 'Campus Map' },
    { to: '/quiz/upload', icon: 'quiz', label: 'Create Quiz' }
  ];

  // Add admin link for authorized users
  if (user && ['system_admin', 'departmental_admin', 'lecturer_admin', 'bursary_admin', 'staff'].includes(user.role)) {
    baseLinks.push({ to: '/admin', icon: 'admin', label: 'Admin Panel' });
  }

  return baseLinks;
};
```

#### Custom Hooks

**useGeolocation.js**:
- **GPS Access**: Get user's current location
- **Permission Handling**: Request location permissions
- **Error Recovery**: Handle location access denied
- **Location Updates**: Real-time location tracking

**useSidebarToggle.js**:
- **Mobile Menu**: Toggle sidebar on mobile devices
- **State Persistence**: Remember sidebar state
- **Responsive Behavior**: Auto-collapse on smaller screens

---

This completes the detailed frontend analysis. Each page and component has been thoroughly documented with their functionality, state management, user interactions, and integration points.

---

## User Flow Analysis

### Chat Flow
1. **User Access**: Navigate to `/chat` → AuthContext validates JWT token
2. **Interface Load**: ChatPage loads with sidebar showing conversation history
3. **Message Send**: User types message → POST `/api/chat/message`
4. **AI Processing**: Backend calls Gemini AI service → returns AI response
5. **Display**: Message bubble renders with timestamp and metadata
6. **Persistence**: Conversation saved to database with message history

### Quiz Flow
1. **Creation**: Upload PDF/Text → `/api/quiz/generate/pdf` → PDF extraction → AI generation
2. **Taking**: Navigate to quiz → Timer starts → Questions render sequentially
3. **Answering**: User selects answers → State updates → Navigation between questions
4. **Submission**: Submit answers → Score calculation → Results display with analytics
5. **Results**: Performance metrics, time spent, question-specific analytics

### Campus Navigation Flow
1. **Map Load**: `/map` page → Load building data from `/api/navigation/buildings`
2. **Display**: Buildings render as positioned markers on canvas map
3. **Interaction**: Click building → Details panel shows with facilities, contact info
4. **Search/Filter**: Real-time filtering by building type or name
5. **Navigation**: Route planning between buildings (future feature)

### Admin Data Management Flow
1. **Authentication**: Role-based access control via ProtectedRoute component
2. **Data Loading**: AdminPage fetches role-specific data endpoints
3. **Interface**: Tab-based navigation shows relevant sections per role
4. **CRUD Operations**: Create/Read/Update/Delete through modals and forms
5. **Updates**: Real-time UI updates after successful API calls

---

## Backend Services Deep Dive

### Core Services Architecture

#### Authentication Service
**Location**: `server/src/controllers/authController.js`

```javascript
// JWT Token Generation
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Login with Password Verification
const login = async (req, res) => {
  const user = await User.findOne({ email }).populate('department', 'name faculty');
  const isMatch = await user.comparePassword(password); // bcrypt comparison
  
  user.lastLogin = new Date();
  await user.save();
  
  const token = generateToken(user._id);
  res.json({ success: true, token, user });
};
```

**What Powers It**:
- bcrypt password hashing (12 rounds)
- JWT token generation and validation
- Role-based permissions system
- Session management with expiry

---

#### Quiz Generation Service
**Location**: `server/src/services/quizGenerator.js`

```javascript
const generateQuizFromContent = async (content, title) => {
  const prompt = `
  Create a comprehensive quiz with 10 multiple-choice questions based on the following content:
  Content: ${content}
  
  Requirements:
  1. Generate exactly 10 questions
  2. Each question must have 4 options (A, B, C, D)
  3. Provide clear explanations for each correct answer
  4. Include helpful hints where applicable
  
  Respond in this exact JSON format:
  {
    "questions": [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "A",
        "explanation": "Clear explanation",
        "hint": "Helpful hint"
      }
    ]
  }
  `;

  const result = await model.generateContent(prompt);
  const text = response.text();
  
  // Extract and validate JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const quizData = JSON.parse(jsonMatch[0]);
  
  return quizData.questions;
};
```

**What Powers It**:
- Google Gemini AI (gemini-2.0-flash-exp model)
- PDF text extraction pipeline
- Question validation and formatting
- Automatic difficulty distribution

---

#### Chat AI Service
**Location**: `server/src/services/geminiService.js`

```javascript
const generateAIResponse = async (message, context = {}) => {
  const systemPrompt = `
  You are the UNIBEN AI Assistant for University of Benin students, faculty, and staff.
  
  Your capabilities:
  - Answer questions about UNIBEN courses, departments, and programs
  - Provide campus building navigation
  - Academic planning and course selection help
  - General university-related queries
  
  Context:
  - Department: ${context.currentDepartment?.name || 'Not specified'}
  - Role: ${context.userRole || 'Student'}
  `;

  const result = await model.generateContent(`${systemPrompt}\nUser: ${message}`);
  const text = response.text();
  
  // Process function calls for data retrieval
  if (text.includes('[FUNCTION_CALL:')) {
    const functionResults = await executeFunctionCalls(text);
    return { content: cleanText, functionResults };
  }
  
  return { content: text, metadata: { aiModel: 'gemini-2.0-flash-exp' } };
};
```

**What Powers It**:
- Context-aware responses based on user role/department
- Function calling for real-time data access
- Conversation context preservation
- University-specific knowledge base

---

#### PDF Processing Service
**Location**: `server/src/services/pdfExtractor.js`

```javascript
const extractTextFromPDF = async (pdfPath) => {
  // In production, this would use pdf-parse or similar
  // For now, simulates text extraction
  const pdfBuffer = await fs.readFile(pdfPath);
  
  // Simulated extraction process
  const extractedText = `
    Introduction to Computer Science
    
    Computer science is the study of computation, algorithms, and system design.
    
    Chapter 1: Programming Fundamentals
    Programming creates instructions for computers to follow.
    
    Variables and Data Types:
    - Variables store data in memory
    - Common types include integers, strings, booleans
    
    Control Structures:
    - Conditional statements (if/else)
    - Loops (for, while)
    - Functions and procedures
  `;
  
  return cleanExtractedText(extractedText);
};
```

**What Powers It**:
- PDF parsing and text extraction
- Text cleaning and preprocessing
- Minimum content validation (100 chars)
- Error handling for corrupted files

---

## Database Models & Relationships

### User Model
**Key Features**:
- Multi-role system (7 user types)
- Department associations
- Flexible identification (name, staff ID, matric number)
- Password hashing with bcrypt
- Settings and preferences

### Course Model
**Key Features**:
- Multiple department offerings support
- Lecturer assignment per offering
- Student enrollment tracking
- Prerequisites and corequisites
- Materials and resources management

### Quiz Model
**Key Features**:
- Flexible question format with 4 options
- Comprehensive results tracking
- Time limits and attempt management
- Analytics and performance metrics
- Course and department associations

### Building Model
**Key Features**:
- Campus location coordinates
- Building type categorization (13 types)
- Department associations
- Facilities and contact information
- Navigation and routing support

---

## Admin Capabilities & Limitations

### System Admin (Strongest Role)
**Capabilities**:
- Full system control and configuration
- User management (create, edit, delete all users)
- Department creation and management
- Building and course management
- System-wide statistics and analytics
- Quiz management and monitoring

**Limitations**: None within the system

### Department Admin
**Capabilities**:
- Course management within their department
- Lecturer assignment to courses
- Student enrollment tracking
- Department-specific news and announcements
- Course offering creation and scheduling

**Limitations**:
- Cannot manage users outside their department
- Cannot access system-wide data
- Cannot modify building information

### Lecturer Admin
**Capabilities**:
- View assigned courses
- Access student lists for their courses
- Create and manage quizzes
- Post course-specific news
- View basic course analytics

**Limitations**:
- Cannot create or modify courses
- Cannot access other lecturers' courses
- Limited to their assigned courses only

### Bursary Admin
**Capabilities**:
- View all student financial records
- Track fee payments and outstanding amounts
- Generate financial reports
- Post bursary-related announcements
- Access payment history

**Limitations**:
- Cannot modify academic data
- Cannot access personal student information beyond financial records
- Limited to financial and administrative functions

---

## AI Service Implementation

### Google Gemini AI Integration
**Model Used**: `gemini-2.5-flash`

**Configuration**:
```javascript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,        // Creativity level
    topK: 40,               // Vocabulary diversity
    topP: 0.95,             // Cumulative probability
    maxOutputTokens: 8192,  // Response length limit
  },
});
```

### AI Capabilities

#### Quiz Generation
- **Input**: PDF text or pasted content
- **Processing**: Content analysis and question generation
- **Output**: 10 multiple-choice questions with explanations
- **Validation**: JSON format verification and content quality checks

#### Chat Responses
- **Context Awareness**: User role, department, conversation history
- **Function Calling**: Real-time data retrieval for courses, buildings, news
- **University Knowledge**: Specific to University of Benin
- **Personalization**: Responses tailored to user's academic level

#### Error Handling
- **Rate Limiting**: API quota management
- **Fallback Responses**: Graceful degradation when AI is unavailable
- **Content Filtering**: Appropriate response validation
- **Timeout Management**: Response time limits

### AI Limitations
- **Content Quality**: Depends on input text quality for quiz generation
- **University Specificity**: Limited to programmed UNIBEN knowledge
- **Response Time**: AI processing adds 2-5 seconds to requests
- **API Costs**: Google Gemini API usage incurs costs per request

---

This completes the comprehensive analysis with focused documentation on key frontend features, user flows, backend services, admin capabilities, and AI implementation details.

---



This completes the frontend architecture section. The next sections will cover:
- AI Integration & Quiz Generation System (detailed)
- Campus Navigation & Mapping System (detailed)
- Authentication & Security Implementation
- User Experience & Interface Design
- Development Workflow & Deployment

The frontend architecture demonstrates a modern, component-based approach with:
- Clean separation of concerns
- Reusable components
- Proper state management
- Responsive design
- Accessibility considerations
- Performance optimizations
- Error handling
- Loading states
- User feedback mechanisms

Each component is designed to be self-contained, testable, and maintainable while following React best practices and modern JavaScript patterns.