# MongoDB Schemas Summary - UNIBEN AI Assistant

## 1. User Collection Schema
```javascript
{
  _id: ObjectId,
  name: String (required, max 100 chars),
  email: String (unique, lowercase, regex validated),
  role: Enum ['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin', 'staff', 'student', 'guest'],
  department: ObjectId (ref: Department),
  courses: [ObjectId] (ref: Course),
  staffId: String (unique, uppercase, regex: STAFF-\d{4,6}|SYSADMIN-\d{3}),
  matricNumber: String (unique, uppercase, regex: [A-Z]{3}/\d{2}/\d{4,5}),
  studentLevel: Number (100-800),
  permissions: Object (default: {}),
  isActive: Boolean (default: true),
  lastLogin: Date,
  tags: [String],
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```
**Key Features**: Dual ID system (staffId/matricNumber), role-based validation, department/course relationships

## 2. Department Collection Schema
```javascript
{
  _id: ObjectId,
  name: String (required, unique, max 100 chars),
  faculty: String (required, max 100 chars),
  description: String (max 1000 chars),
  hodName: String (required, max 100 chars),
  hodContact: String (phone regex),
  hodEmail: String (email regex),
  location: String (max 200 chars),
  building: ObjectId (ref: Building),
  phone: String (phone regex),
  email: String (email regex),
  website: String (URL regex),
  establishedYear: Number (1950-current),
  studentCount: Number (min: 0),
  staffCount: Number (min: 0),
  courses: [ObjectId] (ref: Course),
  departmentalAdmin: ObjectId (ref: User),
  isActive: Boolean (default: true),
  tags: [String],
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```
**Key Features**: Faculty hierarchy, HOD contact info, building relationships, administrative oversight

## 3. Course Collection Schema
```javascript
{
  _id: ObjectId,
  code: String (required, unique, uppercase, regex: [A-Z]{2,4}\s?\d{3,4}[A-Z]?),
  title: String (required, max 200 chars),
  description: String (max 1000 chars),
  department: ObjectId (ref: Department, required),
  departments_offering: [{
    department: ObjectId (ref: Department, required),
    level: Number (100-800, required),
    lecturerId: ObjectId (ref: User),
    schedule: { days: [String], time: String },
    semester: Enum ['first', 'second', 'both'],
    maxStudents: Number,
    assignedBy: ObjectId (ref: User),
    offeredAt: Date,
    isActive: Boolean (default: true)
  }],
  faculty: String (required),
  level: Number (100-800, required),
  credit: Number (1-6, required),
  semester: Enum ['first', 'second', 'both'],
  prerequisites: [String],
  corequisites: [String],
  lecturerId: ObjectId (ref: User),
  lecturer: {
    name: String (max 100 chars),
    email: String (email regex),
    phone: String (phone regex),
    office: String (max 100 chars),
    officeHours: String (max 200 chars)
  },
  students: [ObjectId] (ref: User),
  syllabus: {
    objectives: [String],
    topics: [String],
    textbooks: [{ title: String, author: String, isbn: String }],
    assessment: String (max 500 chars),
    gradingScheme: String (max 500 chars)
  },
  schedule: String (max 500 chars),
  announcements: [{
    title: String (max 200 chars),
    content: String (max 1000 chars),
    createdAt: Date (default: now),
    createdBy: ObjectId (ref: User)
  }],
  resources: [{
    title: String,
    type: Enum ['video', 'article', 'book', 'website', 'tutorial'],
    url: String (URL regex),
    description: String,
    rating: Number (1-5)
  }],
  difficulty: Enum ['beginner', 'intermediate', 'advanced'],
  tags: [String],
  isActive: Boolean (default: true),
  enrollmentCount: Number (default: 0),
  baseCourseId: ObjectId (ref: Course),
  venue: String (max 100 chars),
  maxStudents: Number,
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```
**Key Features**: Multi-department offerings, comprehensive course metadata, student enrollment tracking, resource management

## 4. Building Collection Schema (Knowledge Base - Navigation)
```javascript
{
  _id: ObjectId,
  name: String (required, max 100 chars),
  department: String (max 100 chars),
  faculty: String (max 100 chars),
  latitude: Number (required, -90 to 90),
  longitude: Number (required, -180 to 180),
  photoURL: String (required),
  description: String (max 500 chars),
  category: Enum ['academic', 'administrative', 'facility', 'hostel', 'library', 'sports', 'dining'],
  icon: String (default: '🏢', max 10 chars),
  address: String (max 200 chars),
  phone: String (phone regex),
  email: String (email regex),
  website: String (URL regex),
  openingHours: String (max 100 chars),
  isActive: Boolean (default: true),
  tags: [String],
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```
**Key Features**: Geolocation support, building categorization, contact information, photo integration

## 5. News Collection Schema (Administrative Procedures & FAQ)
```javascript
{
  _id: ObjectId,
  title: String (required, max 200 chars),
  content: String (required, max 5000 chars),
  authorId: ObjectId (ref: User, required),
  createdAt: Date (default: now),
  audience: Enum ['everyone', 'students_only', 'staff_only', 'department_specific', 'course_specific'],
  department: ObjectId (ref: Department),
  courses: [ObjectId] (ref: Course),
  active: Boolean (default: true),
  priority: Enum ['high', 'medium', 'low'],
  expiresAt: Date,
  tags: [String],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: Date (default: now)
  }],
  updatedAt: Date (default: now)
}
```
**Key Features**: Role-based audience targeting, file attachments, expiration dates, priority levels

## 6. Conversation Collection Schema (Message History & Analytics)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  title: String (max 200 chars),
  messages: [{
    role: Enum ['user', 'assistant', 'system'],
    content: String (required, max 5000 chars),
    timestamp: Date (default: now),
    functionCalls: [{
      name: String,
      args: Mixed,
      response: Mixed
    }],
    metadata: Mixed (default: {})
  }],
  isActive: Boolean (default: true),
  lastActivity: Date (default: now),
  messageCount: Number (default: 0),
  userMessageCount: Number (default: 0),
  assistantMessageCount: Number (default: 0),
  functionCallCount: Number (default: 0),
  averageResponseTime: Number (default: 0),
  topics: [String],
  category: Enum ['general', 'academic', 'navigation', 'course_info', 'department_info', 'building_info', 'other'],
  rating: Number (1-5),
  feedback: String (max 500 chars),
  sessionId: String (max 100 chars),
  userAgent: String,
  ipAddress: String,
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```
**Key Features**: Message threading, function call tracking, user feedback, analytics, topic categorization

## 7. Quiz Collection Schema (Quiz Attempts & Results)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  title: String (required, max 200 chars),
  description: String (max 500 chars),
  course: ObjectId (ref: Course),
  department: ObjectId (ref: Department),
  source: Enum ['pdf', 'text', 'manual', 'generated'],
  questions: [{
    question: String (required, max 500 chars),
    options: [String] (required, exactly 4),
    correctAnswer: Enum ['A', 'B', 'C', 'D'],
    hint: String (max 200 chars),
    explanation: String (required, max 1000 chars),
    difficulty: Enum ['easy', 'medium', 'hard'],
    topic: String (max 100 chars),
    points: Number (default: 1)
  }],
  timeLimit: Number (seconds, default: 1200),
  difficulty: Enum ['easy', 'medium', 'hard', 'mixed'],
  tags: [String],
  isPublic: Boolean (default: false),
  isActive: Boolean (default: true),
  results: [{
    userId: ObjectId (ref: User, required),
    score: Number (required, min: 0),
    percentage: Number (required, 0-100),
    totalQuestions: Number (required),
    correctAnswers: Number (required, min: 0),
    incorrectAnswers: Number (required, min: 0),
    timeSpent: Number (required, min: 0),
    answers: [{
      questionIndex: Number (required),
      selectedAnswer: Enum ['A', 'B', 'C', 'D'],
      isCorrect: Boolean (required),
      attempts: Number (default: 1),
      timeSpent: Number (default: 0)
    }],
    hintsUsed: Number (default: 0),
    explanationsUsed: Number (default: 0),
    completedAt: Date (default: now),
    grade: Enum ['A', 'B', 'C', 'D', 'F']
  }],
  totalAttempts: Number (default: 0),
  averageScore: Number (default: 0, 0-100),
  averageTime: Number (default: 0),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```
**Key Features**: Question metadata, detailed result tracking, analytics aggregation, grade calculation

## 8. FeesCatalog Collection Schema (Contact Information & Administrative Data)
```javascript
{
  _id: ObjectId,
  level: String (required, indexed),
  session: String (required, indexed),
  currency: String (default: 'NGN'),
  effectiveFrom: Date (required),
  items: [{
    name: String (required),
    amount: Number (required, min: 0)
  }],
  notes: String,
  isActive: Boolean (default: true),
  isNew: Boolean (default: true, indexed),
  createdBy: ObjectId (ref: User),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```
**Key Features**: Level/session-based cataloging, fee item breakdown, temporal versioning

## Key Relationships Summary
- **Users ↔ Departments**: Users belong to departments, departments have admins
- **Courses ↔ Departments**: Courses owned by departments, offered by multiple departments
- **Users ↔ Courses**: Students enroll, lecturers teach
- **Buildings ↔ Departments**: Buildings house departments
- **Conversations ↔ Users**: Each conversation belongs to one user
- **Quizzes ↔ Users/Courses**: Created by users, optionally linked to courses
- **News ↔ Users/Departments/Courses**: Targeted announcements
- **FeesCatalogs**: Standalone collection for fee structures

## Indexing Strategy
- Text indexes for search functionality
- Compound indexes for common queries
- Geospatial indexes for building locations
- TTL indexes for conversation cleanup
- Partial indexes for active records only