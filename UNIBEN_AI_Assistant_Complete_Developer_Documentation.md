# UNIBEN AI Assistant - Complete Developer Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Backend AI Services & Implementation](#backend-ai-services--implementation)
4. [Database Schema & MongoDB Models](#database-schema--mongodb-models)
5. [User Flow Documentation](#user-flow-documentation)
6. [Frontend Architecture & Navigation](#frontend-architecture--navigation)
7. [Information System Implementation](#information-system-implementation)
8. [Navigation System Details](#navigation-system-details)
9. [Quiz Generation System](#quiz-generation-system)
10. [API Documentation](#api-documentation)
11. [Security & Authentication](#security--authentication)
12. [Deployment Guide](#deployment-guide)

---

## 1. System Overview

### Project Vision
The UNIBEN AI Assistant is a comprehensive web-based information system designed to solve the fragmented information problem in large universities. As outlined in the project requirements, this system addresses:

- **Primary Goal**: Centralize institutional information through an AI-powered chatbot
- **Core Problem Solved**: Fragmented information across departments, noticeboards, and informal networks
- **Target Environment**: University of Benin (UNIBEN) as a case study for large campus management
- **Technology Approach**: Cloud-hosted generative AI with mobile-first web delivery

### System Capabilities
1. **AI Chatbot**: Intelligent conversational interface for institutional queries
2. **Campus Navigation**: GPS-based building location and routing system  
3. **Quiz Generation**: PDF-to-quiz conversion for practice materials
4. **Administrative Dashboard**: Role-based management interface
5. **News Distribution**: Targeted information delivery system
6. **Course Management**: Academic program and offering management

### Target Users
- **Students**: Course information, navigation, quiz generation, news access
- **Staff**: Administrative functions, course management, system oversight
- **Administrators**: System management, user oversight, content management
- **Guests**: Basic navigation and public information access

---

## 2. Architecture & Technology Stack

### Overall System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React)                     │
├─────────────────────────────────────────────────────────────┤
│  Chat Interface  │  Admin Dashboard  │  Navigation Map     │
│  Quiz System     │  News Management  │  Authentication     │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTPS/REST
                              │
┌─────────────────────────────────────────────────────────────┐
│                  API GATEWAY (Express.js)                    │
├─────────────────────────────────────────────────────────────┤
│  Authentication  │  Routing Logic  │  Request Validation   │
│  Role Middleware │  Error Handling │  Response Formatting  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 SERVICE LAYER (Business Logic)               │
├─────────────────────────────────────────────────────────────┤
│  AI Service     │  Quiz Service    │  News Service        │
│  Navigation     │  User Service    │  Course Service      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 DATA LAYER (MongoDB)                         │
├─────────────────────────────────────────────────────────────┤
│  Users & Auth   │  Courses & Depts │  Buildings & Maps    │
│  Conversations  │  Quizzes & Results│  News & Announcements│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────┤
│  Google Gemini AI │  Mapbox API    │  PDF Processing      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Details

**Frontend Technologies:**
- **React 18**: Modern functional components with hooks
- **Vite**: Fast development server and build tool
- **React Router**: Client-side routing with protected routes
- **Tailwind CSS**: Utility-first styling framework
- **Axios**: HTTP client with interceptors
- **Mapbox GL JS**: Interactive mapping library

**Backend Technologies:**
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL document database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Token authentication
- **Multer**: File upload middleware

**AI & External Services:**
- **Google Gemini AI**: Conversational AI and function calling
- **Mapbox API**: Geocoding and routing services
- **PDF Processing**: Text extraction from uploaded documents

---

## 3. Backend AI Services & Implementation

### 3.1 Google Gemini AI Integration

The AI service is the core component that powers the intelligent chatbot functionality.

#### 3.1.1 Service Configuration

**File: `server/src/services/geminiService.js`**

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the generative model
const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});

// Function calling definitions for AI
const functionDeclarations = [
  {
    name: "getUserCourses",
    description: "Get courses for a specific user",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "string" }
      },
      required: ["userId"]
    }
  },
  {
    name: "recommendResources", 
    description: "Recommend study resources for a course",
    parameters: {
      type: "object", 
      properties: {
        courseId: { type: "string" },
        topic: { type: "string" }
      },
      required: ["courseId"]
    }
  },
  {
    name: "findBuilding",
    description: "Find campus buildings by name or type",
    parameters: {
      type: "object",
      properties: {
        buildingName: { type: "string" },
        buildingType: { type: "string" }
      }
    }
  },
  {
    name: "getUserDepartment",
    description: "Get user's department information",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "string" }
      }
    }
  },
  {
    name: "searchCourses",
    description: "Search for courses by code or title",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        department: { type: "string" }
      }
    }
  }
];
```

#### 3.1.2 AI Response Generation

**Core AI Processing Function:**

```javascript
async function generateResponseWithGemini(userMessage, conversationHistory, functionDeclarations, functionResults = []) {
  try {
    // Build context-aware system prompt
    const systemPrompt = buildContextPrompt(userMessage, conversationHistory);
    
    // Prepare chat history for context
    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      tools: [{
        functionDeclarations: functionDeclarations
      }]
    });

    // Generate response with function calling
    let result;
    if (functionResults.length > 0) {
      // Send function results back to AI for final response
      result = await chat.sendMessage(userMessage);
      result = await chat.sendMessage(`Here are the function results: ${JSON.stringify(functionResults)}`);
    } else {
      result = await chat.sendMessage(userMessage);
    }

    return result.response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return 'I apologize, but I\'m having trouble processing your request right now. Please try again.';
  }
}

// Role-aware system prompt builder
function buildContextPrompt(userMessage, conversationHistory) {
  const systemPrompt = `
    You are the UNIBEN AI Assistant, an intelligent chatbot for the University of Benin.
    
    Your role: Provide accurate, helpful information about UNIBEN's academic programs, 
    administrative procedures, campus navigation, and general university information.
    
    Capabilities:
    1. Answer questions about courses, departments, and academic programs
    2. Provide campus navigation and building information
    3. Assist with administrative procedures and requirements
    4. Generate practice quizzes from course materials
    5. Share relevant university news and announcements
    
    Guidelines:
    - Be accurate and professional
    - If you don't know something, admit it and suggest contacting relevant offices
    - Use function calling to access database information when appropriate
    - Provide helpful, context-aware responses
    - Consider user's role and permissions when sharing information
  `;
  
  return systemPrompt;
}
```

#### 3.1.3 Function Calling Execution

**Function Execution Handler:**

```javascript
async function executeFunctionCall(functionCall) {
  try {
    const { name, arguments: args } = functionCall;
    
    switch (name) {
      case 'getUserCourses':
        return await getUserCourses(args.userId);
      
      case 'recommendResources':
        return await recommendResources(args.courseId, args.topic);
      
      case 'findBuilding':
        return await findBuilding(args.buildingName, args.buildingType);
      
      case 'getUserDepartment':
        return await getUserDepartment(args.userId);
      
      case 'searchCourses':
        return await searchCourses(args.query, args.department);
      
      default:
        throw new Error(`Unknown function: ${name}`);
    }
  } catch (error) {
    console.error('Function execution error:', error);
    return { error: error.message };
  }
}

// Example function implementation
async function getUserCourses(userId) {
  const User = require('../models/User');
  const Course = require('../models/Course');
  
  const user = await User.findById(userId).populate('courses');
  if (!user) {
    return { error: 'User not found' };
  }
  
  return {
    courses: user.courses.map(course => ({
      id: course._id,
      code: course.code,
      title: course.title,
      department: course.department?.name,
      credit: course.credit,
      level: course.level
    }))
  };
}
```

### 3.2 Chat Controller Implementation

**File: `server/src/controllers/chatController.js`**

```javascript
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { generateResponseWithGemini } = require('../services/geminiService');
const { executeFunctionCall } = require('../services/geminiService');

// Main chat message handler
async function handleChatMessage(req, res) {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
    } else {
      conversation = new Conversation({
        userId: userId,
        messages: []
      });
    }

    // Add user message to conversation
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    conversation.messages.push(userMessage);

    // Prepare conversation history for AI context
    const conversationHistory = conversation.messages
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

    // Get user context for role-aware responses
    const user = await User.findById(userId).populate('department');
    
    // Generate AI response with function calling
    const functionDeclarations = [
      // ... (function declarations from geminiService)
    ];

    let aiResponse = await generateResponseWithGemini(
      message,
      conversationHistory,
      functionDeclarations
    );

    // Add AI response to conversation
    const aiMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    conversation.messages.push(aiMessage);

    // Save conversation
    await conversation.save();

    // Return response
    res.json({
      success: true,
      message: aiResponse,
      conversationId: conversation._id,
      timestamp: aiMessage.timestamp
    });

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
}

// Get conversation history
async function getConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: userId
    }).populate('userId', 'name email role');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation: conversation
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
}

// Get user's conversation history
async function getConversations(req, res) {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({ userId: userId })
      .sort({ updatedAt: -1 })
      .limit(20) // Limit to last 20 conversations
      .select('_id title createdAt updatedAt messages');

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => ({
      id: conv._id,
      title: conv.messages.length > 0 ? 
        conv.messages[0].content.substring(0, 50) + '...' : 
        'New Conversation',
      lastMessage: conv.messages.length > 0 ?
        conv.messages[conv.messages.length - 1].content.substring(0, 100) + '...' :
        '',
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv.messages.length
    }));

    res.json({
      success: true,
      conversations: formattedConversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
}

module.exports = {
  handleChatMessage,
  getConversation,
  getConversations
};
```

---

## 4. Database Schema & MongoDB Models

### 4.1 User Management Schema

**File: `server/src/models/User.js`**

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Personal information
  name: {
    type: String,
    required: true,
    trim: true
  },
  staffId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true
  },
  matricNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  
  // Role-based access control
  role: {
    type: String,
    enum: [
      'system_admin',
      'departmental_admin', 
      'bursary_admin',
      'lecturer_admin',
      'staff',
      'student',
      'guest'
    ],
    default: 'guest'
  },
  
  // Relationships
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  
  // User preferences and AI context
  tags: [{
    type: String,
    lowercase: true
  }],
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ staffId: 1 });
userSchema.index({ matricNumber: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we have max attempts and no lock, set lock
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Static method to find user by credentials
userSchema.statics.getAuthenticated = async function(email, password) {
  const user = await this.findOne({ email: email.toLowerCase(), isActive: true });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (user.isLocked) {
    await user.incLoginAttempts();
    throw new Error('Account is locked');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (isMatch) {
    // If successful, update last login and reset attempts
    user.lastLogin = new Date();
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }
    await user.save();
    return user;
  }
  
  // Password failed, increment attempts
  await user.incLoginAttempts();
  throw new Error('Invalid credentials');
};

module.exports = mongoose.model('User', userSchema);
```

### 4.2 Course Management Schema

**File: `server/src/models/Course.js`**

```javascript
const mongoose = require('mongoose');

const offeringSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 100,
    max: 900
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
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  schedule: {
    dayOfWeek: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }],
    startTime: String, // Format: "09:00"
    endTime: String,   // Format: "11:00"
    venue: String,
    isLab: { type: Boolean, default: false }
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  offeredAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const courseSchema = new mongoose.Schema({
  // Basic course information
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Academic information
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
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
    max: 900
  },
  
  // Course relationships
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  corequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  
  // Department offerings (multiple departments can offer same course)
  departments_offering: [offeringSchema],
  
  // Course content and resources
  syllabus: {
    objectives: [String],
    topics: [{
      week: Number,
      title: String,
      description: String,
      readings: [String]
    }],
    assessment: [{
      type: String,
      weight: Number, // Percentage
      description: String
    }],
    resources: [{
      type: String,
      title: String,
      url: String,
      description: String
    }]
  },
  
  // Announcements and updates
  announcements: [{
    title: String,
    content: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    postedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Metadata
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

// Indexes for performance
courseSchema.index({ code: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ 'departments_offering.department': 1 });
courseSchema.index({ 'departments_offering.lecturerId': 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ isActive: 1 });

// Virtual for getting all students enrolled in the course
courseSchema.virtual('totalEnrolledStudents').get(function() {
  return this.departments_offering.reduce((total, offering) => {
    return total + (offering.students ? offering.students.length : 0);
  }, 0);
});

// Method to check if user can enroll
courseSchema.methods.canUserEnroll = function(userId) {
  // Check prerequisites
  if (this.prerequisites && this.prerequisites.length > 0) {
    // This would need to be implemented based on user's completed courses
    // For now, return true
    return true;
  }
  
  // Check if user is already enrolled
  for (let offering of this.departments_offering) {
    if (offering.students && offering.students.includes(userId)) {
      return false; // Already enrolled
    }
  }
  
  return true;
};

// Method to get active offerings
courseSchema.methods.getActiveOfferings = function() {
  return this.departments_offering.filter(offering => offering.isActive);
};

// Static method to find courses by department
courseSchema.statics.findByDepartment = function(departmentId, options = {}) {
  let query = {
    $or: [
      { department: departmentId },
      { 'departments_offering.department': departmentId }
    ],
    isActive: true
  };
  
  if (options.level) {
    query.level = options.level;
  }
  
  return this.find(query).populate('department', 'name code');
};

// Static method to search courses
courseSchema.statics.searchCourses = function(searchTerm, filters = {}) {
  let query = {
    isActive: true,
    $or: [
      { code: { $regex: searchTerm, $options: 'i' } },
      { title: { $regex: searchTerm, $options: 'i' } }
    ]
  };
  
  if (filters.department) {
    query.department = filters.department;
  }
  
  if (filters.level) {
    query.level = filters.level;
  }
  
  return this.find(query)
    .populate('department', 'name code')
    .limit(filters.limit || 20);
};

module.exports = mongoose.model('Course', courseSchema);
```

### 4.3 Building & Navigation Schema

**File: `server/src/models/Building.js`**

```javascript
const mongoose = require('mongoose');
const { Point } = require('mongoose').Types;

const buildingSchema = new mongoose.Schema({
  // Basic information
  name: {
    type: String,
    required: true,
    trim: true
  },
  shortName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Location information
  location: {
    type: String,
    trim: true // Address or descriptive location
  },
  coordinates: {
    type: Point,
    required: true,
    index: '2dsphere' // Enable geospatial queries
  },
  
  // Categorization
  type: {
    type: String,
    enum: [
      'faculty',     // Faculty building
      'department',  // Specific department
      'administrative', // Admin offices
      'library',     // Library or study area
      'laboratory',  // Labs or workshops
      'auditorium',  // Lecture halls
      'hostel',      // Student accommodation
      'sports',      // Sports facilities
      'commercial',  // Shops, cafeteria
      'gate',        // Campus entrances
      'facility'     // Other facilities
    ],
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'administrative', 'facility', 'residential'],
    required: true
  },
  
  // Department association
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  
  // Building details
  floors: {
    type: Number,
    min: 1
  },
  facilities: [{
    type: String,
    enum: [
      'elevator', 'ramp', 'restroom', 'parking', 
      'cafeteria', 'wifi', 'air_conditioning', 'generator'
    ]
  }],
  
  // Operating hours
  operatingHours: {
    weekdays: {
      open: String, // Format: "08:00"
      close: String  // Format: "17:00"
    },
    weekends: {
      open: String,
      close: String
    },
    holidays: {
      open: String,
      close: String
    }
  },
  
  // Contact information
  contact: {
    phone: String,
    email: String,
    officeHours: String
  },
  
  // Media
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  virtualTour: String, // URL to virtual tour if available
  
  // Accessibility
  accessibility: {
    wheelchairAccessible: { type: Boolean, default: false },
    hasRamp: { type: Boolean, default: false },
    hasElevator: { type: Boolean, default: false }
  },
  
  // Status and metadata
  isActive: {
    type: Boolean,
    default: true
  },
  constructionYear: Number,
  lastRenovation: Date,
  
  // For navigation routing
  entrances: [{
    coordinates: {
      type: Point
    },
    description: String,
    isMain: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Indexes for geospatial queries
buildingSchema.index({ coordinates: '2dsphere' });
buildingSchema.index({ type: 1, category: 1 });
buildingSchema.index({ department: 1 });
buildingSchema.index({ name: 'text', description: 'text' }); // Text search index

// Virtual for formatted coordinates
buildingSchema.virtual('formattedCoordinates').get(function() {
  if (this.coordinates && this.coordinates.coordinates) {
    const [lng, lat] = this.coordinates.coordinates;
    return `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
  }
  return null;
});

// Method to calculate distance from point
buildingSchema.methods.distanceFrom = function(longitude, latitude) {
  if (!this.coordinates || !this.coordinates.coordinates) {
    return null;
  }
  
  const [buildingLng, buildingLat] = this.coordinates.coordinates;
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = latitude * Math.PI / 180;
  const φ2 = buildingLat * Math.PI / 180;
  const Δφ = (buildingLat - latitude) * Math.PI / 180;
  const Δλ = (buildingLng - longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Static method to find nearby buildings
buildingSchema.statics.findNearby = function(longitude, latitude, maxDistance = 1000) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Static method to search buildings
buildingSchema.statics.searchBuildings = function(searchTerm, filters = {}) {
  let query = {
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { location: { $regex: searchTerm, $options: 'i' } }
    ]
  };
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.department) {
    query.department = filters.department;
  }
  
  return this.find(query)
    .populate('department', 'name code')
    .limit(filters.limit || 20);
};

// Pre-save middleware to ensure coordinates is a Point
buildingSchema.pre('save', function(next) {
  if (this.coordinates && !this.coordinates.type) {
    this.coordinates = {
      type: 'Point',
      coordinates: this.coordinates
    };
  }
  next();
});

module.exports = mongoose.model('Building', buildingSchema);
```

### 4.4 Quiz System Schema

**File: `server/src/models/Quiz.js`**

```javascript
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3 // Assuming 4 options maximum
  },
  explanation: {
    type: String,
    required: true
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
  hints: [String],
  tags: [String]
});

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean,
    timeSpent: Number // in seconds
  }],
  score: {
    correct: Number,
    total: Number,
    percentage: Number
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  timeSpent: Number, // Total time in seconds
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  }
}, {
  timestamps: true
});

const quizSchema = new mongoose.Schema({
  // Basic quiz information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Associations
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Quiz content
  questions: [questionSchema],
  
  // Quiz settings
  settings: {
    timeLimit: {
      type: Number, // in minutes
      default: 30
    },
    allowReview: {
      type: Boolean,
      default: true
    },
    randomizeQuestions: {
      type: Boolean,
      default: false
    },
    randomizeOptions: {
      type: Boolean,
      default: false
    },
    showResults: {
      type: String,
      enum: ['immediate', 'after_completion', 'manual'],
      default: 'immediate'
    },
    passingScore: {
      type: Number,
      default: 50 // percentage
    }
  },
  
  // Availability
  availability: {
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    allowLateSubmission: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['manual', 'ai_generated', 'imported'],
    default: 'manual'
  },
  sourceDocument: {
    filename: String,
    uploadDate: Date,
    textExtracted: String
  },
  
  // Analytics
  analytics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageTimeSpent: {
      type: Number,
      default: 0
    }
  },
  
  // Tags for organization
  tags: [String],
  category: String
}, {
  timestamps: true
});

// Virtual for quiz statistics
quizSchema.virtual('statistics').get(function() {
  if (this.attempts && this.attempts.length > 0) {
    const completedAttempts = this.attempts.filter(attempt => attempt.status === 'completed');
    if (completedAttempts.length === 0) return null;
    
    const totalScore = completedAttempts.reduce((sum, attempt) => sum + attempt.score.percentage, 0);
    const averageScore = totalScore / completedAttempts.length;
    
    const totalTime = completedAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
    const averageTimeSpent = totalTime / completedAttempts.length;
    
    return {
      totalAttempts: this.attempts.length,
      completedAttempts: completedAttempts.length,
      averageScore: Math.round(averageScore * 100) / 100,
      completionRate: Math.round((completedAttempts.length / this.attempts.length) * 100),
      averageTimeSpent: Math.round(averageTimeSpent)
    };
  }
  return null;
});

// Method to check if quiz is available
quizSchema.methods.isAvailable = function() {
  const now = new Date();
  
  if (!this.availability.isActive) return false;
  if (this.availability.startDate && now < this.availability.startDate) return false;
  if (this.availability.endDate && now > this.availability.endDate) return false;
  
  return true;
};

// Method to get user's best attempt
quizSchema.methods.getUserBestAttempt = function(userId) {
  const userAttempts = this.attempts.filter(attempt => 
    attempt.userId.toString() === userId.toString() && 
    attempt.status === 'completed'
  );
  
  if (userAttempts.length === 0) return null;
  
  return userAttempts.reduce((best, current) => 
    current.score.percentage > best.score.percentage ? current : best
  );
};

// Method to check if user can attempt quiz
quizSchema.methods.canUserAttempt = function(userId) {
  // Check if quiz is available
  if (!this.isAvailable()) return { allowed: false, reason: 'Quiz not available' };
  
  // Check attempt limits
  const userAttempts = this.attempts.filter(attempt => 
    attempt.userId.toString() === userId.toString()
  );
  
  if (userAttempts.length >= this.availability.maxAttempts) {
    return { allowed: false, reason: 'Maximum attempts exceeded' };
  }
  
  return { allowed: true };
};

// Static method to find quizzes by course
quizSchema.statics.findByCourse = function(courseId, userId = null) {
  let query = { 
    course: courseId,
    'availability.isActive': true
  };
  
  if (userId) {
    query.createdBy = userId; // Show only user's quizzes unless admin
  }
  
  return this.find(query)
    .populate('course', 'code title')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to search quizzes
quizSchema.statics.searchQuizzes = function(searchTerm, filters = {}) {
  let query = {
    'availability.isActive': true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };
  
  if (filters.course) {
    query.course = filters.course;
  }
  
  if (filters.difficulty) {
    query.questions = {
      $elemMatch: { difficulty: filters.difficulty }
    };
  }
  
  if (filters.source) {
    query.source = filters.source;
  }
  
  return this.find(query)
    .populate('course', 'code title department')
    .limit(filters.limit || 20);
};

module.exports = mongoose.model('Quiz', quizSchema);
```

### 4.5 News Distribution Schema

**File: `server/src/models/News.js`**

```javascript
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: String,
  size: Number,
  url: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const recipientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveredAt: Date,
  readAt: Date,
  acknowledged: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const newsSchema = new mongoose.Schema({
  // Content
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    maxlength: 200
  },
  
  // Author and metadata
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Audience targeting
  audience: {
    type: String,
    enum: [
      'everyone',          // All users
      'students_only',     // Students only
      'staff_only',        // Staff only  
      'department_specific', // Specific department
      'course_specific'    // Specific course(s)
    ],
    required: true
  },
  
  // Targeting details
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  
  // Content management
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [String],
  
  // Timing
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  
  // Attachments
  attachments: [attachmentSchema],
  
  // Status and moderation
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  recipients: [recipientSchema],
  
  // Category for organization
  category: {
    type: String,
    enum: [
      'academic',      // Academic announcements
      'administrative', // Administrative notices
      'event',        // Events and activities
      'deadline',     // Important deadlines
      'maintenance',  // System maintenance
      'emergency',    // Emergency notifications
      'general'       // General news
    ],
    default: 'general'
  }
}, {
  timestamps: true
});

// Indexes for performance
newsSchema.index({ audience: 1, status: 1 });
newsSchema.index({ publishDate: -1 });
newsSchema.index({ 'recipients.userId': 1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ title: 'text', content: 'text', tags: 'text' }); // Text search

// Virtual for checking if news is expired
newsSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if news is currently active
newsSchema.virtual('isCurrentlyActive').get(function() {
  return this.isActive && 
         this.status === 'published' &&
         !this.isExpired &&
         (!this.publishDate || this.publishDate <= new Date());
});

// Method to check if user can view this news
newsSchema.methods.canUserView = function(user) {
  if (!this.isCurrentlyActive) return false;
  
  switch (this.audience) {
    case 'everyone':
      return true;
      
    case 'students_only':
      return ['student', 'system_admin', 'departmental_admin'].includes(user.role);
      
    case 'staff_only':
      return ['staff', 'system_admin', 'departmental_admin', 'bursary_admin'].includes(user.role);
      
    case 'department_specific':
      return user.department && 
             this.department && 
             user.department.toString() === this.department.toString();
             
    case 'course_specific':
      if (user.role === 'lecturer_admin') {
        // Check if user teaches any of the targeted courses
        return this.courses.some(courseId => 
          user.courses && user.courses.includes(courseId)
        );
      }
      return true; // Admins can view all course-specific news
      
    default:
      return false;
  }
};

// Method to record view
newsSchema.methods.recordView = function(userId) {
  // Add to recipients if not already present
  const existingRecipient = this.recipients.find(r => 
    r.userId.toString() === userId.toString()
  );
  
  if (!existingRecipient) {
    this.recipients.push({
      userId: userId,
      deliveredAt: new Date(),
      readAt: new Date(),
      acknowledged: false
    });
  } else {
    existingRecipient.readAt = new Date();
  }
  
  this.viewCount += 1;
  return this.save();
};

// Static method to get news for user
newsSchema.statics.getNewsForUser = async function(userId, userRole, departmentId, courseIds = [], userTags = []) {
  const query = {
    status: 'published',
    isActive: true,
    $or: [
      { publishDate: { $exists: false } },
      { publishDate: { $lte: new Date() } }
    ],
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  };
  
  // Build audience filter based on user role
  const audienceConditions = [{ audience: 'everyone' }];
  
  if (['student', 'system_admin', 'departmental_admin'].includes(userRole)) {
    audienceConditions.push({ audience: 'students_only' });
  }
  
  if (['staff', 'system_admin', 'departmental_admin', 'bursary_admin'].includes(userRole)) {
    audienceConditions.push({ audience: 'staff_only' });
  }
  
  if (departmentId) {
    audienceConditions.push({ 
      audience: 'department_specific',
      department: departmentId
    });
  }
  
  if (courseIds.length > 0) {
    audienceConditions.push({
      audience: 'course_specific',
      courses: { $in: courseIds }
    });
  }
  
  query.$or = [...query.$or, ...audienceConditions];
  
  // Add tag-based filtering
  if (userTags.length > 0) {
    query.$or.push({ tags: { $in: userTags } });
  }
  
  return this.find(query)
    .populate('authorId', 'name role')
    .populate('department', 'name')
    .populate('courses', 'code title')
    .sort({ priority: -1, publishDate: -1 });
};

// Static method to search news
newsSchema.statics.searchNews = function(searchTerm, filters = {}) {
  let query = {
    status: 'published',
    isActive: true,
    $or: [
      { publishDate: { $exists: false } },
      { publishDate: { $lte: new Date() } }
    ],
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  };
  
  // Text search
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  // Apply filters
  if (filters.audience) {
    query.audience = filters.audience;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.department) {
    query.department = filters.department;
  }
  
  if (filters.author) {
    query.authorId = filters.author;
  }
  
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  return this.find(query)
    .populate('authorId', 'name role')
    .populate('department', 'name')
    .populate('courses', 'code title')
    .sort({ priority: -1, publishDate: -1 })
    .limit(filters.limit || 20);
};

module.exports = mongoose.model('News', newsSchema);
```

---

## 5. User Flow Documentation

### 5.1 Student User Journey

```mermaid
graph TD
    A[Landing Page] --> B{Authenticated?}
    B -->|No| C[Login Page]
    B -->|Yes| D[Role-based Dashboard]
    

## 5. User Flow Documentation

### 5.1 Student User Journey

```
Student Journey Flow:
1. Landing Page → Authentication Check
2. If not authenticated → Login Page
3. If authenticated → Role-based Dashboard
4. Dashboard Options:
   - AI Chat Interface (primary feature)
   - Campus Navigation
   - Quiz Generation/Taking
   - News & Announcements
   - Course Information
```

#### 5.1.1 Student Chat Flow
```
Chat Interaction Process:
1. User opens chat interface
2. System loads conversation history
3. User types question
4. Request sent to /api/chat/message
5. Backend processes with AI:
   - Query database for relevant info
   - AI generates contextual response
   - Return response with function results
6. Display response with rich content
7. Save conversation to database
```

#### 5.1.2 Quiz Generation Flow
```
AI Quiz Creation Process:
1. Student uploads PDF document
2. Client validates file type/size
3. Send to /api/quiz/upload
4. Backend extracts text from PDF
5. Send extracted text to Gemini AI
6. AI generates structured quiz questions
7. Save quiz to database
8. Return quiz to student interface
9. Student can take quiz immediately
```

### 5.2 Administrator User Journey

#### 5.2.1 System Administrator Flow
```
Admin Dashboard Flow:
1. Login → Role validation
2. System Admin Dashboard
3. Management Sections:
   - User Management (create/edit users)
   - Department Management
   - Course Management
   - Building Management
   - System Statistics
4. Each section has CRUD operations
5. Role-based data filtering
6. Audit trail logging
```

#### 5.2.2 Department Admin Flow
```
Department Admin Process:
1. Authenticated → Department Admin Page
2. Department-specific data only
3. Manage:
   - Department courses and offerings
   - Department staff and students
   - Department-specific news
   - Course announcements
4. View department statistics
5. Export department reports
```

### 5.3 Guest User Journey

```
Guest User Flow:
1. Landing Page → No authentication required
2. Limited features:
   - Basic campus navigation
   - Public information only
   - No chat history saved
   - No quiz generation
3. Can access:
   - Building locations
   - Public fees information
   - Basic campus map
4. Encouraged to register for full features
```

---

## 6. Frontend Architecture & Navigation

### 6.1 React Application Structure

**File: `client/src/App.jsx`**

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import ChatPage from './components/chat/ChatPage';
import MapPage from './pages/MapPage';
import NewsPage from './pages/NewsPage';
import FeesPage from './pages/FeesPage';
import AdminRedirect from './pages/AdminRedirect';
import SystemAdminPage from './pages/SystemAdminPage';
import DepartmentAdminPage from './pages/DepartmentAdminPage';
import BursaryAdminPage from './pages/BursaryAdminPage';
import LecturerAdminPage from './pages/LecturerAdminPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
            
            <Route path="/map" element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            } />
            
            <Route path="/news" element={
              <ProtectedRoute>
                <NewsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/fees" element={<FeesPage />} />
            
            {/* Role-based Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRedirect />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/system" element={
              <ProtectedRoute roles={['system_admin']}>
                <SystemAdminPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/department" element={
              <ProtectedRoute roles={['departmental_admin']}>
                <DepartmentAdminPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/bursary" element={
              <ProtectedRoute roles={['bursary_admin']}>
                <BursaryAdminPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/lecturer" element={
              <ProtectedRoute roles={['lecturer_admin']}>
                <LecturerAdminPage />
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

### 6.2 Authentication Context

**File: `client/src/context/AuthContext.jsx`**

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

  // Setup axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check for existing session on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 6.3 Protected Route Component

**File: `client/src/components/auth/ProtectedRoute.jsx`**

```javascript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to appropriate admin page or deny access
    switch (user.role) {
      case 'system_admin':
        return <Navigate to="/admin/system" replace />;
      case 'departmental_admin':
        return <Navigate to="/admin/department" replace />;
      case 'bursary_admin':
        return <Navigate to="/admin/bursary" replace />;
      case 'lecturer_admin':
        return <Navigate to="/admin/lecturer" replace />;
      default:
        return <Navigate to="/chat" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
```

### 6.4 Navigation Components

#### 6.4.1 Shared Navbar

**File: `client/src/components/shared/Navbar.jsx`**

```javascript
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageCircle, 
  Map, 
  Newspaper, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/chat',
      icon: MessageCircle,
      label: 'AI Assistant',
      roles: ['student', 'staff', 'system_admin', 'departmental_admin', 'bursary_admin', 'lecturer_admin']
    },
    {
      path: '/map',
      icon: Map,
      label: 'Campus Map',
      roles: ['student', 'staff', 'system_admin', 'departmental_admin', 'bursary_admin', 'lecturer_admin', 'guest']
    },
    {
      path: '/news',
      icon: Newspaper,
      label: 'News',
      roles: ['student', 'staff', 'system_admin', 'departmental_admin', 'bursary_admin', 'lecturer_admin']
    },
    {
      path: '/fees',
      icon: CreditCard,
      label: 'Fees',
      roles: ['student', 'staff', 'system_admin', 'departmental_admin', 'bursary_admin', 'lecturer_admin', 'guest']
    }
  ];

  const adminItems = [
    {
      path: '/admin/system',
      label: 'System Admin',
      roles: ['system_admin']
    },
    {
      path: '/admin/department',
      label: 'Department Admin',
      roles: ['departmental_admin']
    },
    {
      path: '/admin/bursary',
      label: 'Bursary Admin',
      roles: ['bursary_admin']
    },
    {
      path: '/admin/lecturer',
      label: 'Lecturer Admin',
      roles: ['lecturer_admin']
    }
  ];

  const visibleNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const visibleAdminItems = adminItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/chat" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UN</span>
            </div>
            <span className="text-xl font-bold text-slate-800 hidden sm:block">
              UNIBEN AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Admin Links */}
            {visibleAdminItems.length > 0 && (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                  <Settings size={16} />
                  <span>Admin</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {visibleAdminItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500 capitalize">
                    {user.role.replace('_', ' ')}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-100 py-4">
            {/* Main Navigation */}
            <div className="space-y-2 mb-4">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Admin Navigation */}
            {visibleAdminItems.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Administration
                </div>
                {visibleAdminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* User Info & Logout */}
            {user && (
              <div className="border-t border-emerald-100 pt-4">
                <div className="px-4 py-2">
                  <div className="text-sm font-medium text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500 capitalize">
                    {user.role.replace('_', ' ')}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
```

---

## 7. Information System Implementation

### 7.1 AI Chat Interface

#### 7.1.1 Main Chat Component

**File: `client/src/components/chat/ChatPage.jsx`**

```javascript
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../shared/Navbar';
import ChatSidebar from './ChatSidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import useSidebarToggle, { TOP_NAV_HEIGHT } from '../../hooks/useSidebarToggle';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [topNews, setTopNews] = useState([]);
  
  const { isOpen, isMobile, toggle } = useSidebarToggle();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    loadConversations();
    loadTopNews();
  }, [user]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await axios.get('/api/chat/conversations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadTopNews = async () => {
    if (!user) return;

    try {
      const response = await axios.get('/api/news', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Get top 3 high-priority news items
        const highPriorityNews = response.data.news
          .filter(item => item.priority === 'high')
          .slice(0, 3);

        setTopNews(highPriorityNews);
      }
    } catch (error) {
      console.error('Failed to load top news:', error);
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await axios.get(`/api/chat/conversation/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setCurrentConversation(response.data.conversation);
        setMessages(response.data.conversation.messages);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    setIsLoading(true);

    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('/api/chat/message', {
        message,
        conversationId: currentConversation?.id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Add AI response
        const aiMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString(),
          hasLocation: response.data.hasLocation,
          functionCalls: response.data.functionCalls
        };

        setMessages(prev => [...prev, aiMessage]);

        // Update current conversation or create new one
        if (response.data.conversationId) {
          setCurrentConversation({ id: response.data.conversationId });
          loadConversations(); // Refresh conversations list
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-100 overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex relative overflow-hidden" 
           style={{ height: `calc(100vh - ${TOP_NAV_HEIGHT}px)` }}>
        
        {/* Mobile Backdrop */}
        {isMobile && isOpen && (
          <div
            onClick={toggle}
            className="fixed inset-0 bg-black/40 z-40"
            style={{ top: `${TOP_NAV_HEIGHT}px` }}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          ${isMobile ? 'fixed' : 'relative flex-shrink-0'}
          h-full bg-white border-r z-40 overflow-hidden
          transition-all duration-300 ease-in-out
        `}
        style={{
          top: isMobile ? `${TOP_NAV_HEIGHT}px` : undefined,
          width: isMobile ? (isOpen ? '80vw' : '0') : (isOpen ? '320px' : '0')
        }}>
          <ChatSidebar
            conversations={conversations}
            currentConversation={currentConversation}
            onConversationSelect={loadConversation}
            onNewConversation={startNewConversation}
            isOpen={isOpen}
            onToggle={toggle}
          />
        </aside>

        {/* Toggle Button */}
        <button
          onClick={toggle}
          className={`
            fixed bg-white rounded-full shadow-lg
            flex items-center justify-center
            transition-all duration-300 hover:shadow-xl
            ${isMobile ? 'w-10 left-4' : 'w-8'}
            ${isMobile ? '' : (isOpen ? 'left-[304px]' : 'left-2')}
          `}
          style={{
            top: isMobile ? `${TOP_NAV_HEIGHT + 16}px` : '50%',
            transform: isMobile ? 'none' : 'translateY(-50%)',
            zIndex: 45,
            width: isMobile ? 40 : 32,
            height: isMobile ? 40 : 32
          }}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-3xl flex flex-col gap-6">
              {messages.length === 0 ? (
                <div className="space-y-6">
                  {/* Welcome Message */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg">
                      🤖
                    </div>
                    <div className="flex flex-col gap-1 items-start">
                      <p className="text-base font-normal leading-relaxed message-bubble-ai px-4 py-3 bg-white text-slate-800">
                        {getWelcomeMessage(user)}
                      </p>
                      <p className="text-xs font-normal text-slate-500 pl-1">Just now</p>
                    </div>
                  </div>

                  {/* Top News Section */}
                  {topNews.length > 0 && user?.role !== 'guest' && (
                    <NewsSection news={topNews} />
                  )}
                </div>
              ) : (
                <MessageList messages={messages} />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="px-4 md:px-6 lg:px-8 py-3 bg-white/50 backdrop-blur-sm">
            <div className="mx-auto max-w-3xl flex items-end gap-3">
              <MessageInput
                onSendMessage={sendMessage}
                disabled={isLoading}
                placeholder={getPlaceholder(user)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getWelcomeMessage(user) {
  if (user?.role === 'guest') {
    return '👋 Welcome, Guest! I\'m the UNIBEN AI Assistant. I can help you find buildings and navigate the campus. For full features like quizzes and personalized help, please log in as a student or staff member.';
  } else if (user?.role === 'student') {
    return `🎓 Hello, ${user.name}! Welcome to UNIBEN AI Assistant. I can help you with course information, find buildings, get study resources, and even create quizzes to test your knowledge. What would you like to know?`;
  } else if (user?.role === 'staff') {
    return `👨‍🏫 Welcome back, ${user.name}! As a staff member, you have full access to all features. I can help you with department information, course details, building locations, and administrative tasks. How can I assist you today?`;
  } else {
    return 'Hello! I am the UNIBEN AI Assistant. How can I help you today? You can ask me about departments, courses, and much more.';
  }
}

function NewsSection({ news }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
        📰
      </div>
      <div className="flex flex-col gap-3 items-start flex-1">
        <div className="message-bubble-ai px-4 py-3 bg-white text-slate-800 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-600">Latest University News</span>
          </div>
          <div className="space-y-2">
            {news.map((newsItem, index) => (
              <div key={newsItem.id} className="border-l-2 border-blue-200 pl-3">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold text-sm">{index + 1}️⃣</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{newsItem.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {newsItem.content.length > 100
                        ? `${newsItem.content.substring(0, 100)}...`
                        : newsItem.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => window.location.href = '/news'}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all news →
            </button>
          </div>
        </div>
        <p className="text-xs font-normal text-slate-500 pl-1">Just now</p>
      </div>
    </div>
  );
}

function getPlaceholder(user) {
  if (user?.role === 'guest') {
    return "Ask about buildings and campus navigation...";
  } else if (user?.role === 'student') {
    return "Ask about courses, buildings, or create quizzes...";
  } else if (user?.role === 'staff') {
    return "Ask about departments, courses, or administrative tasks...";
  } else {
    return "Type your message or ask about departments, courses, etc.";
  }
}
```

#### 7.1.2 Message Components

**File: `client/src/components/chat/MessageBubble.jsx`**

```javascript
export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg">
          🤖
        </div>
      )}
      
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 text-white font-bold text-sm ml-auto">
          ME
        </div>
      )}
      
      {/* Message Content */}
      <div className={`flex flex-col gap-1 items-start ${isUser ? 'ml-auto' : ''}`}>
        <div className={`
          px-4 py-3 rounded-2xl max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl
          ${isUser 
            ? 'bg-emerald-500 text-white rounded-br-md' 
            : 'bg-white text-slate-800 rounded-bl-md shadow-sm'
          }
          ${message.isError ? 'border border-red-300 bg-red-50 text-red-800' : ''}
        `}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {/* Error indicator */}
          {message.isError && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <span>⚠️</span>
              <span>There was an error processing your message</span>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <p className={`text-xs font-normal text-slate-500 ${isUser ? 'pr-1' : 'pl-1'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
}
```

### 7.2 News Management System

#### 7.2.1 News Display Page

**File: `client/src/pages/NewsPage.jsx`**

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/shared/Navbar';
import { Search, Filter, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';

const NewsPage = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, searchTerm, priorityFilter, categoryFilter]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/news', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setNews(response.data.news);
      }
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = [...news];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.content.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredNews(filtered);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'academic': return '📚';
      case 'administrative': return '🏢';
      case 'event': return '📅';
      case 'deadline': return '⏰';
      case 'maintenance': return '🔧';
      case 'emergency': return '🚨';
      default: return '📰';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📰</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">University News</h1>
              <p className="text-slate-600">Stay updated with the latest announcements and information</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            >
              <option value="all">All Categories</option>
              <option value="academic">Academic</option>
              <option value="administrative">Administrative</option>
              <option value="event">Events</option>
              <option value="deadline">Deadlines</option>
              <option value="maintenance">Maintenance</option>
              <option value="emergency">Emergency</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        {/* News List */}
        <div className="space-y-4">
          {filteredNews.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📰</span>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No news found</h3>
              <p className="text-slate-600">
                {searchTerm || priorityFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No news items are available at the moment'}
              </p>
            </div>
          ) : (
            filteredNews.map((item) => (
              <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-200">
                {/* News Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getCategoryIcon(item.category)}</span>
                        <h2 className="text-xl font-semibold text-slate-800 leading-tight">
                          {item.title}
                        </h2>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>{formatDate(item.createdAt)}</span>
                        {item.author && (
                          <>
                            <span>•</span>
                            <span>by {item.author.name}</span>
                          </>
                        )}
                        {item.department && (
                          <>
                            <span>•</span>
                            <span>{item.department.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Priority Badge */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                      {item.priority === 'high' && <AlertCircle size={12} className="mr-1" />}
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                    </span>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* News Content */}
                <div className="px-6 pb-6">
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </div>

                  {/* Attachments */}
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="text-sm font-medium text-slate-800 mb-2">Attachments</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                          >
                            📎 {attachment.originalName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
```

---

## 8. Navigation System Details

### 8.1 Campus Map Implementation

**File: `client/src/components/map/CampusMap.jsx`**

```javascript
import { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import { Search, Navigation, X, ChevronLeft, ChevronRight } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';

const CampusMap = ({ userLocation, onLocationSelect }) => {
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState({
    longitude: 5.615267,
    latitude: 6.401964,
    zoom: 15
  });

  const [buildings, setBuildings] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchedLocations, setSearchedLocations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [route, setRoute] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const { location: userLoc, error: locationError } = useGeolocation();

  // Sample building data - in real app, this would come from API
  useEffect(() => {
    const sampleBuildings = [
      {
        id: 1,
        name: "Faculty of Engineering",
        description: "Main engineering faculty building with departments",
        type: "faculty",
        category: "academic",
        coordinates: "5.615267, 6.401964",
        faculty: "Engineering"
      },
      {
        id: 2,
        name: "Main Library",
        description: "Central university library with study spaces",
        type: "library",
        category: "academic",
        coordinates: "5.615500, 6.401500",
        faculty: "General"
      },
      {
        id: 3,
        name: "Administration Block",
        description: "Main administrative offices and registrar",
        type: "administrative",
        category: "administrative",
        coordinates: "5.614800, 6.401300",
        faculty: "Administration"
      }
    ];
    setBuildings(sampleBuildings);
    setFilteredBuildings(sampleBuildings);
  }, []);

  // Filter buildings based on search and category
  useEffect(() => {
    let filtered = buildings;

    if (searchTerm) {
      filtered = filtered.filter(building =>
        building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        building.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(building => building.category === selectedCategory);
    }

    setFilteredBuildings(filtered);
  }, [searchTerm, selectedCategory, buildings]);

  // Update user location
  useEffect(() => {
    if (userLoc) {
      onLocationSelect?.(userLoc);
    }
  }, [userLoc, onLocationSelect]);

  const categories = [
    { id: 'all', label: 'All Buildings', icon: '🏢' },
    { id: 'academic', label: 'Academic', icon: '📚' },
    { id: 'administrative', label: 'Administrative', icon: '🏛️' },
    { id: 'facility', label: 'Facilities', icon: '🔧' },
    { id: 'residential', label: 'Residential', icon: '🏠' }
  ];

  const getIconForBuilding = (type) => {
    const icons = {
      faculty: '🏛️',
      department: '🏢',
      administrative: '🏛️',
      library: '📚',
      laboratory: '🧪',
      auditorium: '🎭',
      hostel: '🏠',
      sports: '⚽',
      commercial: '🏪',
      gate: '🚪',
      facility: '🔧'
    };
    return icons[type] || '🏢';
  };

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building);
    
    // Center map on building
    const [lng, lat] = building.coordinates.split(', ').map(Number);
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 17,
      duration: 1000
    });
  };

  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat;
    // Handle map click for setting navigation start point
  };

  const startNavigation = (destination) => {
    if (!userLoc) {
      alert('Please enable location access to use navigation');
      return;
    }

    setRoute({
      destination,
      distance: '500m',
      duration: '5 min',
      steps: [
        {
          maneuver: {
            instruction: 'Head north towards the destination',
            type: 'depart'
          },
          distance: 100
        },
        {
          maneuver: {
            instruction: 'Turn right at the intersection',
            type: 'turn right'
          },
          distance: 200
        },
        {
          maneuver: {
            instruction: 'Destination will be on your left',
            type: 'arrive'
          },
          distance: 200
        }
      ]
    });
    
    setIsNavigating(true);
    setCurrentStepIndex(0);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setRoute(null);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (route && currentStepIndex < route.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const calculateDistance = (point1, point2) => {
    const [lng1, lat1] = point1.coordinates.split(', ').map(Number);
    const [lng2, lat2] = point2.coordinates.split(', ').map(Number);
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-100 overflow-hidden">
      <div className="flex-1 flex h-full">
        {/* Sidebar */}
        <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-emerald-200 overflow-y-auto">
          <div className="p-4 border-b border-emerald-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🗺️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Campus Map</h1>
                <p className="text-sm text-slate-600">Navigate UNIBEN campus</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search buildings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-sm"
              />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-700'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{category.icon}</div>
                    <div className="text-xs">{category.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Buildings List */}
          <div className="p-4">
            {selectedCategory === 'all' && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-emerald-600 uppercase mb-3 flex items-center gap-2">
                  <span>🏢</span>
                  Campus Buildings
                </h3>
                <div className="space-y-3">
                  {filteredBuildings.map((building) => (
                    <div
                      key={building.id}
                      onClick={() => handleBuildingClick(building)}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedBuilding?.id === building.id
                          ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 shadow-lg'
                          : 'bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg backdrop-blur-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getIconForBuilding(building.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{building.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{building.description}</p>
                          <p className="text-xs text-emerald-600 mt-1 font-medium">{building.faculty}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory !== 'all' && (
              <div className="space-y-3">
                {filteredBuildings.map((building) => (
                  <div
                    key={building.id}
                    onClick={() => handleBuildingClick(building)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedBuilding?.id === building.id
                        ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 shadow-lg'
                        : 'bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg backdrop-blur-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getIconForBuilding(building.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{building.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{building.description}</p>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">{building.faculty}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchedLocations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-emerald-600 uppercase mb-3 flex items-center gap-2">
                  <Search size={16} />
                  Searched Locations
                </h3>
                <div className="space-y-3">
                  {searchedLocations.map((location) => (
                    <div
                      key={location.id}
                      onClick={() => handleBuildingClick(location)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedBuilding?.id === location.id
                          ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-500 shadow-lg'
                          : 'bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg backdrop-blur-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getIconForBuilding(location.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{location.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{location.description}</p>
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full mt-1 font-medium">Searched</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSearching && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                  <span className="text-sm text-gray-600">Searching...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative h-full">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            onClick={handleMapClick}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
          >
            <NavigationControl position="top-right" />
            <GeolocateControl
              position="top-right"
              onGeolocate={(position) => {
                // Handle geolocation
              }}
            />

            {/* Building Markers */}
            {filteredBuildings.map((building) => {
              const [lng, lat] = building.coordinates.split(', ').map(Number);
              return (
                <Marker
                  key={building.id}
                  longitude={lng}
                  latitude={lat}
                  onClick={() => handleBuildingClick(building)}
                >
                  <div className={`building-marker ${selectedBuilding?.id === building.id ? 'active' : ''}`}>
                    <div className="marker-pulse"></div>
                    <div className="marker-icon">{getIconForBuilding(building.type)}</div>
                  </div>
                </Marker>
              );
            })}

            {/* Building Popup */}
            {selectedBuilding && (() => {
              const [lng, lat] = selectedBuilding.coordinates.split(', ').map(Number);
              return (
                <Popup
                  longitude={lng}
                  latitude={lat}
                  onClose={() => setSelectedBuilding(null)}
                  closeButton={false}
                  closeOnClick={false}
                  anchor="bottom"
                  offset={[0, -24]}
                >
                  <div className="custom-popup flex items-start gap-3 p-3 bg-white rounded-lg shadow-lg" style={{minWidth: 240, maxWidth: 320}}>
                    <div className="w-20 h-20 bg-emerald-50 rounded-md flex items-center justify-center text-2xl flex-shrink-0">{getIconForBuilding(selectedBuilding.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{selectedBuilding.name}</h4>
                          <p className="text-xs text-gray-500 truncate mt-1">{selectedBuilding.description}</p>
                          <p className="text-xs text-emerald-600 mt-1 font-medium">{selectedBuilding.faculty}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startNavigation(selectedBuilding)}
                            className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors"
                            title="Start navigation"
                          >
                            <Navigation size={16} className="text-white" />
                          </button>
                          <button onClick={() => setSelectedBuilding(null)} className="text-gray-400 hover:text-gray-600 ml-2 text-sm">✕</button>
                        </div>
                      </div>
                      {userLoc && (
                        <div className="mt-2 text-xs text-gray-500">
                          {Math.round(calculateDistance(userLoc, selectedBuilding))}m away
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              );
            })()}
          </Map>

          {/* Compact Navigation Bar */}
          {isNavigating && route && (
            <div className="absolute bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Navigation size={16} className="text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">Navigating to</h4>
                        <p className="text-xs text-gray-600 truncate">{route.destination.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={stopNavigation}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">Step {currentStepIndex + 1} of {route.steps?.length || 0}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentStepIndex + 1) / (route.steps?.length || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-500">{route.distance}</div>
                      <div className="text-xs text-gray-500">{route.duration}</div>
                    </div>
                  </div>

                  {route.steps && route.steps[currentStepIndex] && (
                    <div className="bg-emerald-50 rounded-xl p-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {currentStepIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 font-medium leading-relaxed">
                            {route.steps[currentStepIndex].maneuver.instruction}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {route.steps[currentStepIndex].distance >= 1000
                              ? `${(route.steps[currentStepIndex].distance / 1000).toFixed(1)}km`
                              : `${Math.round(route.steps[currentStepIndex].distance)}m`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={previousStep}
                      disabled={currentStepIndex === 0}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={!route.steps || currentStepIndex >= route.steps.length - 1}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Styles */}
      <style>{`
        .building-marker {
          cursor: pointer;
          position: relative;
          width: 44px;
          height: 44px;
        }
        
        .marker-pulse {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.25);
          animation: pulse 2s infinite;
          top: 0;
          left: 0;
        }
        
        .marker-pulse.active {
          background: rgba(16, 185, 129, 0.5);
        }
        
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        
        .marker-icon {
          position: relative;
          z-index: 1;
          font-size: 22px;
          background: white;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          border: 3px solid rgba(255,255,255,0.9);
          transition: transform 0.2s ease;
        }
        
        .marker-icon:hover {
          transform: scale(1.1);
        }
        
        .custom-popup {
          width: 288px;
          box-shadow: 0 10px 30px rgba(2,6,23,0.12);
          border: 1px solid rgba(0,0,0,0.04);
        }
      `}</style>
    </div>
  );
};

export default CampusMap;
```

---

This documentation continues with more sections covering Quiz Generation, API Documentation, Security, and Deployment. The file structure demonstrates the comprehensive nature of this AI-powered university information system, designed to solve the fragmented information problem through intelligent automation and mobile-first delivery.

---

## 9. Administrative System & Role-Based Management

### 9.1 Admin Interface Architecture

The administrative system is built around role-based access control, where each user role has access to specific administrative functions tailored to their responsibilities within the university hierarchy.

#### 9.1.1 Role Hierarchy & Permissions

```
System Admin (system_admin)
├── Full system access
├── User management across all departments
├── Department creation and management
├── Building and campus management
├── Course oversight and management
├── System statistics and analytics
└── Cross-departmental reporting

Department Admin (departmental_admin)
├── Department-specific management
├── Staff and student oversight within department
├── Course offerings within department
├── Department-level reporting
└── Department news management

Bursary Admin (bursary_admin)
├── Financial data management
├── Fee structure administration
├── Payment tracking and reporting
├── Budget oversight
└── Financial announcements

Lecturer Admin (lecturer_admin)
├── Course content management
├── Student assignment oversight
├── Quiz and assessment creation
├── Course-specific communications
└── Student performance tracking

Staff (staff)
├── Limited administrative functions
├── Department information access
├── Basic reporting capabilities
└── Course information management

Student (student)
├── Personal information management
├── Course enrollment status
├── Academic record access
└── Personal reporting features

Guest (guest)
├── Limited public information access
├── Basic campus navigation
└── Public fees information
```

#### 9.1.2 Admin Dashboard Structure

All admin interfaces follow a consistent layout pattern:

**File: `client/src/components/admin/AdminLayout.jsx`**

```javascript
const AdminLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar />
      <div className="w-full px-4 py-6 max-w-7xl mx-auto">
        {/* Page Header */}
        {title && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
              <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
            </div>
          </div>
        )}
        
        <main className="animate-slide-up">
          {children}
        </main>
      </div>
    </div>
  );
};
```

### 9.2 System Administration Interface

**File: `client/src/pages/SystemAdminPage.jsx`**

#### 9.2.1 System Admin Workflow

```
System Admin Access Flow:
1. Login → Role Validation (system_admin)
2. Redirect to /admin/system
3. System Admin Dashboard Display
4. Tab-based Navigation:
   - Dashboard (System Overview)
   - Users (All Users Management)
   - Departments (All Departments)
   - Courses (All Course Management)
   - Buildings (All Campus Buildings)
   - Statistics (System Analytics)
```

#### 9.2.2 User Management Functionality

The System Admin has complete user management capabilities:

**Key Features:**
- **Create Users**: Add new users across all roles and departments
- **Edit Users**: Modify user information, roles, and department assignments
- **Delete Users**: Remove users from the system
- **Role Assignment**: Assign and change user roles
- **Department Assignment**: Assign users to specific departments
- **Password Management**: Reset passwords and manage account status

**User Creation Process:**
```
1. Click "Create User" Button
2. User Form Modal Opens
3. Fill Required Fields:
   - Full Name (required)
   - Email (unique identifier)
   - Role Selection (dropdown with all roles)
   - Staff ID (optional, for staff)
   - Matric Number (optional, for students)
   - Department (dropdown of all departments)
4. Submit Form
5. Backend Validation & User Creation
6. Success Response & UI Update
7. User Can Now Login
```

#### 9.2.3 Department Management

**Department Creation & Management:**
- **Create Departments**: Add new academic departments
- **Edit Departments**: Modify department names, codes, and details
- **Assign Heads**: Assign departmental administrators
- **View Statistics**: See user counts, course offerings, etc.

**Department Workflow:**
```
1. Navigate to Departments Tab
2. View All Departments Table
3. Click "Create Department" Button
4. Fill Department Form:
   - Department Name (required)
   - Department Code (e.g., "CSC", "ENG")
5. Save Department
6. Department Appears in List
7. Can Edit/Delete as Needed
```

#### 9.2.4 Building Management

**Campus Building Administration:**
- **Add Buildings**: Create new campus buildings
- **Edit Buildings**: Modify building details and location
- **Assign Coordinates**: Set GPS coordinates for navigation
- **Category Management**: Organize buildings by type
- **Department Assignment**: Associate buildings with departments

**Building Creation Process:**
```
1. Navigate to Buildings Tab
2. Click "Add Building" Button
3. Building Form Modal:
   - Building Name (required)
   - Location/Address
   - Building Type (dropdown)
   - Department Assignment (optional)
   - GPS Coordinates (optional)
4. Save Building
5. Building Appears on Campus Map
```

### 9.3 Department Admin Interface

**File: `client/src/pages/DepartmentAdminPage.jsx`**

#### 9.3.1 Department Admin Workflow

```
Department Admin Access Flow:
1. Login → Role Validation (departmental_admin)
2. Redirect to /admin/department
3. Department-Specific Dashboard
4. Scope: Limited to assigned department only
5. Tab-based Navigation:
   - Dashboard (Department Overview)
   - Staff (Department Staff Management)
   - Students (Department Students)
   - Courses (Department Courses)
   - News (Department Announcements)
```

#### 9.3.2 Department-Scoped Features

**Staff Management (Within Department):**
- View department staff only
- Assign roles to department staff
- Manage staff course assignments
- Department-level reporting

**Student Management:**
- View department students only
- Course enrollment oversight
- Academic progress tracking
- Student communication

**Course Management (Department Only):**
- Create courses for department
- Assign lecturers to courses
- Manage course schedules
- Department course catalog

**News Management (Department Focus):**
- Post department-specific announcements
- Target specific student groups
- Faculty-wide communications
- Event announcements

#### 9.3.3 Department Admin Limitations

Department Admins have **scoped access**:
- ❌ Cannot access users from other departments
- ❌ Cannot modify system-wide settings
- ❌ Cannot create departments
- ❌ Cannot manage buildings
- ✅ Can only manage their assigned department
- ✅ Can only view department-specific data
- ✅ Can only post news to their department

### 9.4 Bursary Admin Interface

**File: `client/src/pages/BursaryAdminPage.jsx`**

#### 9.4.1 Bursary Admin Workflow

```
Bursary Admin Access Flow:
1. Login → Role Validation (bursary_admin)
2. Redirect to /admin/bursary
3. Bursary Admin Dashboard
4. Financial Management Interface
5. Tab-based Navigation:
   - Dashboard (Financial Overview)
   - Fees (Fee Structure Management)
   - Payments (Payment Tracking)
   - Reports (Financial Reports)
   - News (Financial Announcements)
```

#### 9.4.2 Financial Management Features

**Fee Structure Management:**
- **Create Fee Catalogs**: Define fees for different levels and sessions
- **Edit Fee Structures**: Modify existing fee amounts
- **Category Management**: Organize fees by type (tuition, accommodation, etc.)
- **Academic Session Control**: Set fees for specific academic years

**Payment Tracking:**
- **Student Payment Status**: Track which students have paid
- **Outstanding Balances**: Identify students with unpaid fees
- **Payment History**: View historical payment records
- **Receipt Generation**: Generate payment receipts

**Financial Reporting:**
- **Revenue Reports**: Track incoming payments
- **Outstanding Reports**: Monitor unpaid balances
- **Department Reports**: Fees collected by department
- **Session Reports**: Financial data by academic session

#### 9.4.3 Public Fee Display

**File: `client/src/pages/FeesPage.jsx`**

The Bursary Admin also manages the public-facing fee information:

```
Public Fee Access:
1. Guest/User accesses /fees page
2. Filters available:
   - Academic Level (100-900)
   - Academic Session
   - Program Type
3. Fee structure displayed:
   - Tuition fees
   - Accommodation fees
   - Other charges
4. Payment instructions
5. Contact information for payment
```

### 9.5 Lecturer Admin Interface

**File: `client/src/pages/LecturerAdminPage.jsx`**

#### 9.5.1 Lecturer Admin Workflow

```
Lecturer Admin Access Flow:
1. Login → Role Validation (lecturer_admin)
2. Redirect to /admin/lecturer
3. Lecturer Dashboard
4. Course and Student Management
5. Tab-based Navigation:
   - Dashboard (Teaching Overview)
   - Courses (Assigned Courses)
   - Students (Course Enrollments)
   - Quizzes (Quiz Management)
   - Announcements (Course Communications)
```

#### 9.5.2 Course Management Features

**Assigned Courses Management:**
- View only courses assigned to the lecturer
- Course content management
- Student enrollment oversight
- Course schedule management

**Student Management:**
- View students enrolled in lecturer's courses
- Student progress tracking
- Grade management capabilities
- Student communication tools

**Quiz and Assessment Management:**
- **Create Quizzes**: Generate quizzes from course materials
- **Manage Questions**: Edit and organize quiz questions
- **Set Timers**: Configure quiz time limits
- **Grade Quizzes**: View and manage student results
- **Analytics**: Quiz performance statistics

#### 9.5.3 News Management (Course-Specific)

Lecturer Admins can post course-specific communications:
- **Target Specific Courses**: Send announcements to enrolled students
- **Assignment Updates**: Inform students about homework
- **Exam Notifications**: Share exam information
- **Resource Sharing**: Distribute study materials

### 9.6 News Management System

**File: `client/src/components/news/NewsManagementTab.jsx`**

#### 9.6.1 Role-Based News Creation

Each role has specific news creation capabilities:

**System Admin:**
- ✅ Post to everyone (university-wide)
- ✅ Post to students only
- ✅ Post to staff only
- ✅ Post to specific departments
- ✅ Post to specific courses

**Department Admin:**
- ❌ Cannot post to everyone
- ❌ Cannot post to other departments
- ✅ Post to students in their department
- ✅ Post to staff in their department
- ✅ Post to their department specifically
- ✅ Post to courses in their department

**Bursary Admin:**
- ✅ Post to everyone (university-wide)
- ✅ Post to students only
- ✅ Post to staff only
- ✅ Focus on financial announcements

**Lecturer Admin:**
- ❌ Cannot post to everyone
- ❌ Cannot post department-wide
- ✅ Post to specific courses they teach
- ✅ Target their enrolled students

#### 9.6.2 News Targeting System

The news system implements sophisticated targeting:

```
News Targeting Flow:
1. Author selects audience type
2. System validates author permissions
3. Additional selection appears:
   - If "department_specific": Department dropdown
   - If "course_specific": Course dropdown(s)
4. Priority level selection
5. Content and scheduling options
6. Distribution to targeted users
7. Analytics and tracking
```

#### 9.6.3 News Form Implementation

**File: `client/src/components/news/NewsForm.jsx`**

The news creation form includes:
- **Audience Selection**: Dynamic based on user role
- **Content Editor**: Rich text for announcements
- **Priority Levels**: High, Medium, Low
- **Expiration Dates**: Optional news expiry
- **File Attachments**: Support for documents and images
- **Tag System**: Categorization and search
- **Preview Function**: See how news will appear

---

## 10. User Flow Documentation

### 10.1 Complete User Journey Flows

#### 10.1.1 Student User Flow

```
Student Journey - Complete Flow:

1. REGISTRATION/LOGIN
   ├── Landing Page
   ├── Click "Login" 
   ├── Enter Credentials
   ├── Role Validation (student)
   └── Redirect to Student Dashboard

2. DAILY INTERACTIONS
   ├── AI Chat Interface (Primary Feature)
   │   ├── Ask questions about courses
   │   ├── Request building directions
   │   ├── Get study recommendations
   │   ├── Generate practice quizzes
   │   └── View personalized responses
   │
   ├── Campus Navigation
   │   ├── Search for buildings
   │   ├── Get directions
   │   ├── View building information
   │   └── GPS-based routing
   │
   ├── News & Announcements
   │   ├── View department news
   │   ├── Read university announcements
   │   ├── Check deadlines
   │   └── View event information
   │
   └── Quiz System
       ├── Take generated quizzes
       ├── View results and explanations
       ├── Track progress over time
       └── Download practice materials

3. ACADEMIC TASKS
   ├── Course Information
   │   ├── View enrolled courses
   │   ├── Check schedules
   │   ├── Access course materials
   │   └── View lecturer information
   │
   ├── Fees Information
   │   ├── View fee structure
   │   ├── Check payment status
   │   ├── Access payment instructions
   │   └── Download receipts
   │
   └── Academic Records
       ├── View grades
       ├── Check academic progress
       ├── Generate transcripts
       └── Track achievements
```

#### 10.1.2 Administrative User Flows

##### System Admin Flow

```
System Administrator Complete Flow:

1. LOGIN & DASHBOARD
   ├── Login with admin credentials
   ├── Role validation (system_admin)
   ├── Redirect to /admin/system
   └── System overview dashboard

2. USER MANAGEMENT
   ├── Navigate to Users tab
   ├── View all system users
   ├── Create new user:
   │   ├── Click "Create User"
   │   ├── Fill user form
   │   ├── Assign role and department
   │   └── Save user
   ├── Edit existing users
   ├── Delete users
   └── Reset passwords

3. DEPARTMENT MANAGEMENT
   ├── Navigate to Departments tab
   ├── View all departments
   ├── Create new department
   ├── Edit department details
   ├── Assign department heads
   └── Manage department relationships

4. COURSE MANAGEMENT
   ├── Navigate to Courses tab
   ├── View all system courses
   ├── Create courses across departments
   ├── Assign lecturers to courses
   ├── Manage course schedules
   └── Cross-department oversight

5. BUILDING MANAGEMENT
   ├── Navigate to Buildings tab
   ├── Add new campus buildings
   ├── Set GPS coordinates
   ├── Assign buildings to departments
   ├── Manage building categories
   └── Update facility information

6. SYSTEM ANALYTICS
   ├── View system statistics
   ├── Generate reports
   ├── Monitor usage patterns
   ├── Track user engagement
   └── Export data for analysis
```

##### Department Admin Flow

```
Department Administrator Flow:

1. LOGIN & SCOPED DASHBOARD
   ├── Login with departmental credentials
   ├── Role validation (departmental_admin)
   ├── Redirect to /admin/department
   └── Department-specific overview

2. DEPARTMENT STAFF MANAGEMENT
   ├── View department staff only
   ├── Assign roles to staff
   ├── Manage staff course assignments
   ├── Coordinate department activities
   └── Staff performance tracking

3. STUDENT MANAGEMENT (Department Scoped)
   ├── View department students only
   ├── Monitor student enrollment
   ├── Track academic progress
   ├── Manage student communications
   └── Generate department reports

4. COURSE MANAGEMENT (Department Focus)
   ├── Create courses for department
   ├── Assign lecturers to department courses
   ├── Manage course schedules
   ├── Monitor course offerings
   └── Department course catalog

5. DEPARTMENT NEWS
   ├── Post department announcements
   ├── Target specific student groups
   ├── Share faculty updates
   ├── Communicate with staff
   └── Event announcements

6. REPORTING (Department Level)
   ├── Department statistics
   ├── Student enrollment reports
   ├── Course performance data
   ├── Faculty workload analysis
   └── Export department data
```

##### Bursary Admin Flow

```
Bursary Administrator Flow:

1. LOGIN & FINANCIAL DASHBOARD
   ├── Login with bursary credentials
   ├── Role validation (bursary_admin)
   ├── Redirect to /admin/bursary
   └── Financial overview dashboard

2. FEE STRUCTURE MANAGEMENT
   ├── Navigate to Fees tab
   ├── Create fee catalogs
   ├── Set fees by academic level
   ├── Configure session-based fees
   ├── Manage fee categories
   └── Update payment policies

3. PAYMENT TRACKING
   ├── Monitor student payments
   ├── Track outstanding balances
   ├── Generate payment reports
   ├── Process payment confirmations
   └── Manage refund requests

4. FINANCIAL REPORTING
   ├── Revenue analysis
   ├── Outstanding debt reports
   ├── Department-wise collections
   ├── Session financial summaries
   └── Export financial data

5. PUBLIC FEE MANAGEMENT
   ├── Update public fee information
   ├── Manage fee display on /fees page
   ├── Coordinate with IT for website updates
   └── Handle fee-related inquiries

6. FINANCIAL NEWS & ANNOUNCEMENTS
   ├── Post fee-related announcements
   ├── Payment deadline reminders
   ├── Scholarship information
   └── Financial aid updates
```

##### Lecturer Admin Flow

```
Lecturer Administrator Flow:

1. LOGIN & TEACHING DASHBOARD
   ├── Login with lecturer credentials
   ├── Role validation (lecturer_admin)
   ├── Redirect to /admin/lecturer
   └── Teaching overview dashboard

2. ASSIGNED COURSES MANAGEMENT
   ├── View assigned courses only
   ├── Manage course content
   ├── Update course materials
   ├── Coordinate with department admin
   └── Monitor course enrollment

3. STUDENT OVERSIGHT
   ├── View enrolled students
   ├── Track student progress
   ├── Monitor attendance
   ├── Provide academic guidance
   └── Generate student reports

4. QUIZ & ASSESSMENT MANAGEMENT
   ├── Create quizzes from course materials
   ├── Upload PDF documents for quiz generation
   ├── Manage quiz questions
   ├── Set quiz parameters (time, attempts)
   ├── Grade quizzes and provide feedback
   └── Track student performance

5. COURSE-SPECIFIC COMMUNICATIONS
   ├── Post announcements to enrolled students
   ├── Share assignment updates
   ├── Distribute study materials
   ├── Communicate exam information
   └── Send deadline reminders

6. ACADEMIC REPORTING
   ├── Student performance analytics
   ├── Course completion rates
   ├── Quiz effectiveness metrics
   └── Teaching effectiveness data
```

#### 10.1.3 Guest User Flow

```
Guest User Flow (Limited Access):

1. LANDING PAGE ACCESS
   ├── Direct access to system
   ├── No authentication required
   ├── Limited feature set available
   └── Encouragement to register

2. AVAILABLE FEATURES
   ├── Basic Campus Navigation
   │   ├── Search buildings
   │   ├── View building information
   │   ├── Basic campus map
   │   └── Public facility locations
   │
   ├── Public Information
   │   ├── View public fees structure
   │   ├── General university information
   │   ├── Contact information
   │   └── Basic academic programs
   │
   └── Registration Encouragement
       ├── Prompt to create account
       ├── Feature comparison (guest vs. registered)
       ├── Registration benefits explanation
       └── Smooth registration process

3. REGISTRATION CONVERSION
   ├── Click "Sign Up" button
   ├── Registration form completion
   ├── Role selection (student/staff)
   ├── Department selection
   ├── Email verification
   └── Full system access activation
```

### 10.2 AI Chat Flow (Detailed)

```
AI Chat Interaction Flow:

1. USER INITIATES CHAT
   ├── User types message in chat interface
   ├── Client-side validation
   ├── Show user message immediately
   └── Send to backend API

2. BACKEND PROCESSING
   ├── Authentication verification
   ├── Message stored in conversation
   ├── Context preparation for AI
   └── AI service invocation

3. AI PROCESSING PIPELINE
   ├── Build conversation context
   ├── Apply role-based system prompt
   ├── Check available function calls
   └── Generate AI response with function calls

4. FUNCTION EXECUTION
   ├── AI requests database information
   ├── Backend executes function calls
   ├── Database queries performed
   ├── Results returned to AI

5. FINAL RESPONSE GENERATION
   ├── AI receives function results
   ├── Contextual response generation
   ├── Role-aware response formatting
   └── Response delivered to user

6. CONVERSATION MANAGEMENT
   ├── Save AI response to database
   ├── Update conversation timestamp
   ├── Return conversation ID
   └── Update chat history
```

### 10.3 Quiz Generation Flow (Complete)

```
Quiz Generation Workflow:

1. STUDENT INITIATES QUIZ GENERATION
   ├── Access quiz interface
   ├── Click "Generate Quiz"
   ├── Upload PDF document
   ├── Select quiz parameters
   └── Submit generation request

2. BACKEND PDF PROCESSING
   ├── File validation (type, size)
   ├── PDF text extraction
   ├── Content cleaning and formatting
   └── Text preparation for AI

3. AI QUIZ GENERATION
   ├── Send extracted text to Gemini AI
   ├── AI analyzes content
   ├── Generate structured questions
   ├── Create multiple choice options
   └── Provide explanations and hints

4. QUIZ STRUCTURE CREATION
   ├── Format questions for database
   ├── Set quiz metadata
   ├── Configure quiz settings
   └── Save quiz to database

5. STUDENT INTERFACE UPDATE
   ├── Display generated quiz
   ├── Show quiz parameters
   ├── Enable quiz taking
   └── Provide immediate feedback options

6. QUIZ TAKING PROCESS
   ├── Student starts quiz
   ├── Timer activation
   ├── Question-by-question progression
   ├── Real-time scoring
   └── Results display
```

This enhanced documentation now properly covers the administrative system functionality, role-based interfaces, and detailed user flows without excessive code examples, focusing on the user experience and system behavior as requested.
