# Multi-Admin System Implementation Plan

## Overview
This document outlines the comprehensive implementation of a role-based access control system for the UNIBEN AI Assistant with multiple admin levels and strict data permissions.

## Current System Analysis
- **User Model**: Currently supports only 'student' and 'staff' roles
- **Admin Panel**: Single admin interface for all staff users
- **AI Tools**: Basic queryDatabase and recommendResources functions
- **Database**: Basic models for User, Department, Course, Building

## Required Changes

### 1. Database Models Updates

#### User Model Changes
- **New Roles**: system_admin, bursary_admin, departmental_admin, lecturer_admin, staff, student, guest
- **New Fields**:
  - `department`: ObjectId reference to Department (for students, lecturers, departmental admins)
  - `courses`: Array of course IDs (for students and lecturers)
  - `permissions`: Optional granular permissions object

#### New Models Required

**News Model**:
```javascript
{
  title: String,
  content: String,
  authorId: ObjectId (User),
  createdAt: Date,
  audience: ['everyone', 'students_only', 'staff_only', 'department_specific', 'course_specific'],
  department: ObjectId (Department), // if department-specific
  course: ObjectId (Course), // if course-specific
  active: Boolean
}
```

**Fees Model**:
```javascript
{
  studentId: ObjectId (User),
  totalFees: Number,
  amountPaid: Number,
  balance: Number,
  paymentHistory: [{
    date: Date,
    amount: Number,
    description: String
  }],
  semester: String,
  session: String,
  lastUpdated: Date
}
```

#### Course Model Updates
- Add `lecturerId`: ObjectId reference to User
- Add `students`: Array of student ObjectIds
- Expand `syllabus` object with more detailed structure
- Add `schedule`: Course schedule information
- Add `announcements`: Array of announcement objects

#### Department Model Updates
- Add `departmentalAdmin`: ObjectId reference to User (departmental admin)

### 2. Role-Based Access Control

#### Admin Hierarchy
1. **System Admin**: Full access to everything
2. **Bursary Admin**: Financial data management only
3. **Departmental Admin**: Department-specific management
4. **Lecturer Admin**: Course-specific management

#### User Permissions
- **Students**: View own fees, department news, course news, general university info
- **Staff**: View all general news, department news, staff announcements
- **Guests**: View only public campus information

### 3. API Middleware Updates

#### New Middleware Functions
- `requireSystemAdmin()`: Only system admins
- `requireBursaryAdmin()`: Only bursary admins
- `requireDepartmentalAdmin()`: Departmental admins (scoped to their department)
- `requireLecturerAdmin()`: Lecturer admins (scoped to their courses)
- `filterDataByRole()`: Filter query results based on user role

### 4. Admin Panel Redesign

#### System Admin Panel
- User management (create/edit all users, assign roles)
- Department management
- Global news management
- System-wide statistics and oversight

#### Bursary Admin Panel
- Student fees management
- Payment recording
- Financial reports
- Bursary news posting

#### Departmental Admin Panel
- Department staff/student management
- Course assignments
- Departmental news
- Department information updates

#### Lecturer Admin Panel
- Course syllabus management
- Student list viewing
- Course-specific news
- Office hours and contact updates

### 5. AI Integration Updates

#### New AI Tools
- `getNews(userId, role)`: Returns filtered news based on user permissions
- `getFinancialInfo(studentId)`: Returns fee information for specific student

#### AI Response Logic
- Check user role from session
- Filter all data responses based on role permissions
- Provide natural, friendly responses without mentioning restrictions

### 6. Frontend Updates

#### Authentication Context
- Support new user roles
- Role-based navigation and feature access

#### Admin Components
- Separate admin panels for each admin type
- Role-based UI rendering
- Permission checks for actions

### 7. Security Implementation

#### Database-Level Security
- All queries include role-based filtering
- Students can only access their own financial data
- Departmental admins scoped to their department
- Lecturers scoped to their courses

#### API Security
- Every endpoint validates user authentication and role
- Guests have minimal access
- Audit logging for sensitive operations

## Implementation Phases

### Phase 1: Database Models
1. Update User model with new roles and fields
2. Create News and Fees models
3. Update Course and Department models

### Phase 2: Backend Security
1. Create role-based middleware
2. Update admin routes with proper permissions
3. Implement data filtering in database queries

### Phase 3: Admin Panels
1. Create separate admin panel components
2. Implement role-based UI logic
3. Add news and financial management interfaces

### Phase 4: AI Integration
1. Add getNews and getFinancialInfo tools
2. Update AI system instructions
3. Test role-based filtering

### Phase 5: Frontend Updates
1. Update authentication handling
2. Implement role-based navigation
3. Test complete user flows

### Phase 6: Testing and Security Audit
1. Test all role permissions
2. Security testing
3. Performance optimization

## Success Criteria
- All admin types can access only their authorized data
- Students see personalized, relevant information
- AI responses respect all permission boundaries
- System is secure and scalable
- User experience feels natural and intuitive