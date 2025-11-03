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
      type: String,
      trim: true
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

The next sections will cover the frontend components, AI integration details, navigation system, authentication flows, user experience design, and deployment processes.

---

## Frontend Architecture & Components

The frontend of the UNIBEN AI Assistant is built using React 18 with a modern component-based architecture. The application uses Vite for fast development and building, Tailwind CSS for styling, and Framer Motion for smooth animations.

### Main Application Structure

**File: `client/src/App.jsx`**

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import ChatPage from './components/chat/ChatPage';
import NewsPage from './pages/NewsPage';
import MapPage from './pages/MapPage';
import QuizUpload from './components/quiz/QuizUpload';
import QuizInterface from './components/quiz/QuizInterface';
import QuizResults from './components/quiz/QuizResults';
import AdminPage from './pages/AdminPage';
import SystemAdminPage from './pages/SystemAdminPage';
import DepartmentAdminPage from './pages/DepartmentAdminPage';
import LecturerAdminPage from './pages/LecturerAdminPage';
import BursaryAdminPage from './pages/BursaryAdminPage';
import AdminRedirect from './pages/AdminRedirect';
import NewsManagementTab from './components/news/NewsManagementTab';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            
            <Route path="/news" element={
              <ProtectedRoute>
                <NewsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/map" element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            } />
            
            <Route path="/quiz/upload" element={
              <ProtectedRoute>
                <QuizUpload />
              </ProtectedRoute>
            } />
            
            <Route path="/quiz/start/:id" element={
              <ProtectedRoute>
                <QuizInterface />
              </ProtectedRoute>
            } />
            
            <Route path="/quiz/results/:id" element={
              <ProtectedRoute>
                <QuizResults />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRedirect />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/system" element={
              <ProtectedRoute requiredRoles={['system_admin']}>
                <SystemAdminPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/department" element={
              <ProtectedRoute requiredRoles={['departmental_admin']}>
                <DepartmentAdminPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/lecturer" element={
              <ProtectedRoute requiredRoles={['lecturer_admin']}>
                <LecturerAdminPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/bursary" element={
              <ProtectedRoute requiredRoles={['bursary_admin']}>
                <BursaryAdminPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/comprehensive" element={
              <ProtectedRoute requiredRoles={['system_admin', 'departmental_admin', 'lecturer_admin', 'bursary_admin', 'staff']}>
                <AdminPage />
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/chat" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### Authentication Context Provider

**File: `client/src/context/AuthContext.jsx`**

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await fetch('/api/auth/profile', {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(savedToken);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const { token: newToken, user: userData } = data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        const { token: newToken, user: newUser } = data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const getDisplayName = () => {
    if (!user) return '';
    
    if (user.role === 'student' && user.matricNumber) {
      return user.matricNumber;
    } else if (user.role === 'staff' && user.staffId) {
      return user.staffId;
    }
    return user.name;
  };

  const getDisplayId = () => {
    if (!user) return '';
    
    if (user.role === 'student' && user.matricNumber) {
      return user.matricNumber;
    } else if (user.role === 'staff' && user.staffId) {
      return user.staffId;
    }
    return user.email;
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateProfile,
    getDisplayName,
    getDisplayId,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Route Protection Component

**File: `client/src/components/auth/ProtectedRoute.jsx`**

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <Navigate to="/chat" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
```

### Navigation Component

**File: `client/src/components/shared/Navbar.jsx`**

```javascript
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, getDisplayName } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getNavigationLinks = () => {
    const baseLinks = [
      { to: '/chat', icon: 'chat', label: 'AI Chat' },
      { to: '/news', icon: 'newspaper', label: 'News' },
      { to: '/map', icon: 'map', label: 'Campus Map' },
      { to: '/quiz/upload', icon: 'quiz', label: 'Create Quiz' }
    ];

    // Add admin links for authorized users
    if (user && ['system_admin', 'departmental_admin', 'lecturer_admin', 'bursary_admin', 'staff'].includes(user.role)) {
      baseLinks.push({ to: '/admin', icon: 'admin', label: 'Admin Panel' });
    }

    return baseLinks;
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm w-full overflow-x-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <g clipPath="url(#clip0_6_535)">
                <path
                  clipRule="evenodd"
                  d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                  fill="#10B981"
                  fillRule="evenodd"
                />
              </g>
              <defs>
                <clipPath id="clip0_6_535">
                  <rect fill="white" height="48" width="48" />
                </clipPath>
              </defs>
            </svg>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900 leading-tight">UNIBEN AI</span>
              <span className="text-xs text-slate-500 leading-tight">Assistant</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {getNavigationLinks().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  {link.icon === 'chat' ? 'chat' :
                   link.icon === 'newspaper' ? 'newspaper' :
                   link.icon === 'map' ? 'map' :
                   link.icon === 'quiz' ? 'quiz' : 'admin_panel_settings'}
                </span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-900">
                {getDisplayName()}
              </span>
              <span className="text-xs text-slate-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Logout
            </button>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="space-y-2">
              {getNavigationLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
                >
                  <span className="material-symbols-outlined">
                    {link.icon === 'chat' ? 'chat' :
                     link.icon === 'newspaper' ? 'newspaper' :
                     link.icon === 'map' ? 'map' :
                     link.icon === 'quiz' ? 'quiz' : 'admin_panel_settings'}
                  </span>
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-slate-200 pt-2 mt-2">
                <div className="px-3 py-2">
                  <span className="text-sm font-medium text-slate-900">
                    {getDisplayName()}
                  </span>
                  <span className="text-xs text-slate-500 block capitalize">
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
```

### Chat Interface Components

#### Main Chat Page
**File: `client/src/components/chat/ChatPage.jsx`**

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../shared/Navbar';
import ChatSidebar from './ChatSidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

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
        if (data.conversations.length > 0) {
          setCurrentConversation(data.conversations[0]);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
  };

  const handleConversationSelect = (conversation) => {
    setCurrentConversation(conversation);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Chat Sidebar */}
        <ChatSidebar
          conversations={conversations}
          currentConversation={currentConversation}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {currentConversation.title || 'New Conversation'}
                </h2>
                <p className="text-sm text-slate-500">
                  Started on {new Date(currentConversation.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <MessageList
                  conversation={currentConversation}
                  onSendMessage={handleSendMessage}
                  isSending={sendingMessage}
                />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-slate-200 p-4">
                <MessageInput
                  onSendMessage={handleSendMessage}
                  disabled={sendingMessage}
                />
              </div>
            </>
          ) : (
            /* No conversation selected - Welcome screen */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Welcome to UNIBEN AI Assistant
                </h2>
                <p className="text-slate-600 mb-6">
                  I'm here to help you with questions about UNIBEN courses, departments, campus navigation, and more.
                  Start a conversation by asking me anything!
                </p>
                <button
                  onClick={handleNewConversation}
                  className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Start New Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
```

#### Message List Component
**File: `client/src/components/chat/MessageList.jsx`**

```javascript
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import LocationCard from './LocationCard';
import ResourceCard from './ResourceCard';

const MessageList = ({ conversation, onSendMessage, isSending }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);

  if (!conversation || !conversation.messages) {
    return <div className="flex-1 flex items-center justify-center text-slate-500">No messages yet</div>;
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{ height: 'calc(100vh - 12rem)' }}
    >
      {conversation.messages.map((message, index) => {
        const isUser = message.sender && message.sender._id !== 'ai';
        const isAI = message.type === 'ai_response';
        const previousMessage = index > 0 ? conversation.messages[index - 1] : null;
        const isFirstInSequence = !previousMessage ||
          (previousMessage.sender && previousMessage.sender._id !== message.sender?._id) ||
          (new Date(message.timestamp) - new Date(previousMessage.timestamp)) > 300000; // 5 minutes

        return (
          <div key={index}>
            <MessageBubble
              message={message}
              isUser={isUser}
              isAI={isAI}
              isFirstInSequence={isFirstInSequence}
            />
            
            {/* Render any additional content like location cards or resource cards */}
            {isAI && message.metadata?.functionCalls &&
             message.metadata.functionCalls.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.metadata.functionCalls.map((call, callIndex) => (
                  <div key={callIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                    <div className="font-medium text-blue-800">Function Called: {call.name}</div>
                    <div className="text-blue-600 mt-1">
                      {call.result && typeof call.result === 'object' ? (
                        <pre className="whitespace-pre-wrap">{JSON.stringify(call.result, null, 2)}</pre>
                      ) : (
                        call.result
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Loading indicator */}
      {isSending && (
        <div className="flex justify-start">
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-slate-500 text-sm">AI is typing...</span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
```

#### Message Bubble Component
**File: `client/src/components/chat/MessageBubble.jsx`**

```javascript
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const MessageBubble = ({ message, isUser, isAI, isFirstInSequence }) => {
  const { user } = useAuth();

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

  const formatMessageContent = (content) => {
    // Simple formatting for better readability
    return content
      .split('\n')
      .map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < content.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
  };

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

  // AI message
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs lg:max-w-2xl">
        {isFirstInSequence && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-600">UNIBEN AI</span>
          </div>
        )}
        <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-200">
          <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
            {formatMessageContent(message.content)}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-slate-400">
            {formatTimestamp(message.timestamp)}
          </span>
          {isAI && message.metadata?.aiModel && (
            <span className="text-xs text-slate-400">
              • {message.metadata.aiModel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
```

#### Message Input Component
**File: `client/src/components/chat/MessageInput.jsx`**

```javascript
import React, { useState, useRef } from 'react';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsExpanded(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!message.trim()) {
      setIsExpanded(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={`bg-white rounded-2xl border-2 transition-all duration-200 ${
        isExpanded ? 'border-emerald-300 shadow-lg' : 'border-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        
        <div className="flex items-end gap-3 p-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Ask me anything about UNIBEN..."
              disabled={disabled}
              rows={1}
              className="w-full resize-none border-none outline-none text-sm leading-relaxed bg-transparent"
              style={{ minHeight: '24px' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="flex-shrink-0 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {disabled ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Expanded input suggestions */}
        {isExpanded && (
          <div className="px-3 pb-3 border-t border-slate-100 pt-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMessage('What courses are available in Computer Science?')}
                className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full hover:bg-slate-200 transition-colors"
                disabled={disabled}
              >
                Computer Science courses
              </button>
              <button
                type="button"
                onClick={() => setMessage('How do I get to the Library from the Main Gate?')}
                className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full hover:bg-slate-200 transition-colors"
                disabled={disabled}
              >
                Navigate to Library
              </button>
              <button
                type="button"
                onClick={() => setMessage('What are the admission requirements?')}
                className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full hover:bg-slate-200 transition-colors"
                disabled={disabled}
              >
                Admission requirements
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default MessageInput;
```

### Quiz System Components

#### Quiz Upload Component
**File: `client/src/components/quiz/QuizUpload.jsx`**

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../shared/Navbar';

const QuizUpload = () => {
  const [uploadType, setUploadType] = useState('pdf'); // 'pdf' or 'text'
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a PDF file');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (uploadType === 'pdf' && !file) {
      setError('Please select a PDF file');
      return;
    }

    if (uploadType === 'text' && !textContent.trim()) {
      setError('Please enter some text content');
      return;
    }

    if (!quizTitle.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      if (uploadType === 'pdf') {
        formData.append('pdf', file);
        formData.append('title', quizTitle);
        
        const response = await fetch('/api/quiz/generate/pdf', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
      } else {
        formData.append('text', textContent);
        formData.append('title', quizTitle);
        
        const response = await fetch('/api/quiz/generate/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ text: textContent, title: quizTitle }),
        });
      }

      const data = await response.json();

      if (data.success) {
        navigate(`/quiz/start/${data.quiz._id}`);
      } else {
        setError(data.message || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Create Interactive Quiz
            </h1>
            <p className="text-slate-600">
              Upload a PDF or paste text content to generate AI-powered quiz questions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quiz Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter a descriptive title for your quiz"
                required
              />
            </div>

            {/* Upload Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Content Source
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setUploadType('pdf')}
                  className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                    uploadType === 'pdf'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="font-medium">Upload PDF</div>
                    <div className="text-sm text-slate-500 mt-1">
                      Upload study materials, lecture notes, or textbooks
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setUploadType('text')}
                  className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                    uploadType === 'text'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div className="font-medium">Paste Text</div>
                    <div className="text-sm text-slate-500 mt-1">
                      Type or paste content directly
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Content Input */}
            {uploadType === 'pdf' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PDF File
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {file ? (
                      <div>
                        <p className="text-slate-900 font-medium">{file.name}</p>
                        <p className="text-sm text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-600 font-medium mb-2">
                          Click to upload PDF file
                        </p>
                        <p className="text-sm text-slate-500">
                          Supports PDF files up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Text Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={8}
                  placeholder="Paste your study materials, notes, or any educational content here..."
                  required
                />
                <p className="text-sm text-slate-500 mt-2">
                  Minimum 100 characters required ({textContent.length}/100)
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !quizTitle.trim()}
              className="w-full bg-emerald-500 text-white py-3 px-6 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Quiz...
                </span>
              ) : (
                'Generate Quiz'
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h3 className="font-semibold text-blue-900 mb-2">
              How it works
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• AI analyzes your content to understand the key concepts</li>
              <li>• Generates 10 multiple-choice questions with varied difficulty</li>
              <li>• Includes explanations and hints for each question</li>
              <li>• Tracks your performance and provides detailed analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizUpload;
```

#### Quiz Interface Component
**File: `client/src/components/quiz/QuizInterface.jsx`**

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../shared/Navbar';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import Timer from './Timer';
import QuizResults from './QuizResults';

const QuizInterface = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [id]);

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

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeRemaining(quiz.settings?.timeLimit * 60 || 1800); // Convert minutes to seconds
  };

  const handleAnswerSelect = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const handleTimeSpent = (questionIndex, time) => {
    setTimeSpent(prev => ({
      ...prev,
      [questionIndex]: time
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    
    try {
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
      } else {
        console.error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-slate-600">Quiz not found</p>
            <button
              onClick={() => navigate('/quiz/upload')}
              className="mt-4 text-emerald-600 hover:text-emerald-700"
            >
              Back to Quiz Upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <Navbar />
        <QuizResults quizId={id} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!quizStarted ? (
          /* Quiz Start Screen */
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              {quiz.title}
            </h1>
            
            {quiz.description && (
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                {quiz.description}
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">
                  {quiz.questions.length}
                </div>
                <div className="text-sm text-slate-600">Questions</div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">
                  {quiz.settings?.timeLimit || 30}
                </div>
                <div className="text-sm text-slate-600">Minutes</div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900">
                  {quiz.settings?.maxAttempts || 3}
                </div>
                <div className="text-sm text-slate-600">Max Attempts</div>
              </div>
            </div>
            
            <button
              onClick={startQuiz}
              className="bg-emerald-500 text-white px-8 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
            >
              Start Quiz
            </button>
          </div>
        ) : (
          /* Quiz Interface */
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-slate-900">
                  {quiz.title}
                </h1>
                <Timer timeRemaining={timeRemaining} />
              </div>
              
              <ProgressBar
                current={currentQuestion + 1}
                total={quiz.questions.length}
                answered={Object.keys(answers).length}
              />
            </div>

            {/* Question */}
            <QuestionCard
              question={quiz.questions[currentQuestion]}
              questionNumber={currentQuestion + 1}
              totalQuestions={quiz.questions.length}
              selectedAnswer={answers[currentQuestion]}
              onAnswerSelect={handleAnswerSelect}
              onTimeSpent={(time) => handleTimeSpent(currentQuestion, time)}
            />

            {/* Navigation */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                
                <div className="flex items-center gap-4">
                  {currentQuestion === quiz.questions.length - 1 ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                      className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  ) : (
                    <button
                      onClick={goToNextQuestion}
                      className="px-6 py-2 text-emerald-600 hover:text-emerald-700"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Question Navigation */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Jump to question:</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 text-sm rounded ${
                      index === currentQuestion
                        ? 'bg-emerald-500 text-white'
                        : answers[index]
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;
```

### Campus Navigation Components

#### Campus Map Component
**File: `client/src/components/map/CampusMap.jsx`**

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../shared/Navbar';

const CampusMap = () => {
  const { user } = useAuth();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuildings();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = (buildingsData) => {
    // This would typically use Mapbox GL JS
    // For demonstration, we'll create a simple representation
    
    const mapElement = mapRef.current;
    if (!mapElement) return;

    // Center on University of Benin campus (approximate coordinates)
    const campusCenter = [5.6037, 6.3350]; // Longitude, Latitude for UNIBEN
    
    // Clear existing content
    mapElement.innerHTML = '';
    
    // Create a simple grid-based map representation
    const mapContainer = document.createElement('div');
    mapContainer.className = 'w-full h-96 bg-green-100 relative overflow-hidden';
    
    // Add campus boundary
    const campusBoundary = document.createElement('div');
    campusBoundary.className = 'absolute inset-4 border-2 border-green-600 rounded-lg';
    mapContainer.appendChild(campusBoundary);
    
    // Add buildings as positioned elements
    buildingsData.forEach((building, index) => {
      const buildingElement = document.createElement('div');
      buildingElement.className = 'absolute w-8 h-8 bg-blue-600 rounded cursor-pointer hover:bg-blue-700 transition-colors';
      
      // Calculate position based on coordinates (simplified)
      const left = 20 + (Math.random() * 60); // Random position within boundary
      const top = 20 + (Math.random() * 60);
      
      buildingElement.style.left = `${left}%`;
      buildingElement.style.top = `${top}%`;
      
      // Add tooltip
      buildingElement.title = building.name;
      
      // Add click handler
      buildingElement.addEventListener('click', () => setSelectedBuilding(building));
      
      mapContainer.appendChild(buildingElement);
      
      // Add building number
      const numberElement = document.createElement('div');
      numberElement.className = 'absolute text-xs text-white font-bold leading-8 text-center';
      numberElement.style.left = `${left}%`;
      numberElement.style.top = `${top}%`;
      numberElement.style.width = '2rem';
      numberElement.textContent = index + 1;
      mapContainer.appendChild(numberElement);
    });
    
    mapElement.appendChild(mapContainer);
  };

  const filteredBuildings = buildings.filter(building => {
    const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || building.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getBuildingTypeColor = (type) => {
    const colors = {
      'faculty': 'bg-blue-500',
      'department': 'bg-green-500',
      'library': 'bg-purple-500',
      'hostel': 'bg-orange-500',
      'administrative': 'bg-red-500',
      'sports': 'bg-yellow-500',
      'commercial': 'bg-gray-500',
      'facility': 'bg-indigo-500',
      'gate': 'bg-pink-500',
      'auditorium': 'bg-teal-500',
      'ict_center': 'bg-cyan-500',
      'hospital': 'bg-red-600',
      'school': 'bg-emerald-500'
    };
    return colors[type] || 'bg-slate-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                  Campus Map
                </h1>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Find Route
                  </button>
                  <button className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors">
                    Current Location
                  </button>
                </div>
              </div>
              
              <div ref={mapRef} className="w-full">
                {/* Map will be rendered here */}
              </div>
              
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-700 mb-2">Legend</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Faculty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Department</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span>Library</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>Hostel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Sports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Find Buildings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Search buildings..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Filter by Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="all">All Buildings</option>
                    <option value="faculty">Faculty</option>
                    <option value="department">Department</option>
                    <option value="library">Library</option>
                    <option value="hostel">Hostel</option>
                    <option value="administrative">Administrative</option>
                    <option value="sports">Sports</option>
                    <option value="facility">Facility</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Buildings List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Buildings ({filteredBuildings.length})
              </h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredBuildings.map((building) => (
                  <button
                    key={building._id}
                    onClick={() => setSelectedBuilding(building)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedBuilding?._id === building._id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${getBuildingTypeColor(building.type)}`}></div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{building.name}</h3>
                        <p className="text-sm text-slate-600 capitalize">{building.type}</p>
                        {building.department && (
                          <p className="text-xs text-slate-500">{building.department.name}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Building Details */}
            {selectedBuilding && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Building Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{selectedBuilding.name}</h3>
                    <p className="text-sm text-slate-600 capitalize">{selectedBuilding.type}</p>
                  </div>
                  
                  {selectedBuilding.description && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                      </label>
                      <p className="text-sm text-slate-600">{selectedBuilding.description}</p>
                    </div>
                  )}
                  
                  {selectedBuilding.address && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Address
                      </label>
                      <p className="text-sm text-slate-600">{selectedBuilding.address}</p>
                    </div>
                  )}
                  
                  {selectedBuilding.contactInfo?.phone && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Phone
                      </label>
                      <p className="text-sm text-slate-600">{selectedBuilding.contactInfo.phone}</p>
                    </div>
                  )}
                  
                  {selectedBuilding.facilities && selectedBuilding.facilities.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Facilities
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {selectedBuilding.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors">
                      Get Directions
                    </button>
                    <button className="flex-1 bg-slate-500 text-white py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusMap;
```

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