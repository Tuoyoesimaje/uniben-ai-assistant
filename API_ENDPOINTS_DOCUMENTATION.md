# API Endpoints Documentation - UNIBEN AI Assistant

## 3.6.2 API Design

The RESTful API design follows standard HTTP methods and response formats while incorporating authentication requirements and role-based access control.

## Authentication Endpoints

### POST /api/auth/login/student
**Description**: Authenticate student users using matriculation number.

**Request**:
```json
{
  "matricNumber": "CSC/18/1234"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Welcome back, John Doe! 🎓",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a2b5c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "role": "student",
    "displayId": "CSC/18/1234",
    "email": "john.doe@uniben.edu.ng",
    "department": "64f8a2b5c3d4e5f6g7h8i9j1",
    "courses": ["64f8a2b5c3d4e5f6g7h8i9j2"],
    "lastLogin": "2024-11-04T11:35:00.000Z"
  }
}
```

**Error Response (404)**:
```json
{
  "success": false,
  "message": "Student not found. Please contact your department administrator to register.",
  "code": "STUDENT_NOT_FOUND"
}
```

### POST /api/auth/login/staff
**Description**: Authenticate staff and administrators using staff ID and security verification.

**Request**:
```json
{
  "staffId": "STAFF-1234",
  "securityAnswer": "uniben2024"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Welcome back, Dr. Jane Smith! 👨‍🏫",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a2b5c3d4e5f6g7h8i9j0",
    "name": "Dr. Jane Smith",
    "role": "departmental_admin",
    "displayId": "STAFF-1234",
    "email": "jane.smith@uniben.edu.ng",
    "department": "64f8a2b5c3d4e5f6g7h8i9j1",
    "courses": [],
    "lastLogin": "2024-11-04T11:35:00.000Z"
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "message": "Security verification required for system admin access",
  "requiresSecurity": true
}
```

### POST /api/auth/login/guest
**Description**: Create guest session with limited access.

**Request**:
```json
{}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Welcome, Guest! 👋 You have limited access.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "guest-user",
    "name": "Guest User",
    "role": "guest",
    "isGuest": true
  }
}
```

### GET /api/auth/me
**Description**: Get current authenticated user information.

**Headers**: 
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "user": {
    "id": "64f8a2b5c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "role": "student",
    "displayId": "CSC/18/1234",
    "email": "john.doe@uniben.edu.ng",
    "lastLogin": "2024-11-04T11:35:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /api/auth/verify
**Description**: Verify JWT token validity.

**Headers**: 
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "user": {
    "id": "64f8a2b5c3d4e5f6g7h8i9j0",
    "role": "student",
    "name": "John Doe",
    "displayId": "CSC/18/1234"
  }
}
```

**Error Response (401)**:
```json
{
  "success": false,
  "message": "Token expired"
}
```

## Chat and AI Integration Endpoints

### POST /api/chat/message
**Description**: Send message to AI chatbot with context awareness and function calling.

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request**:
```json
{
  "message": "Where is the Computer Science department located?",
  "conversationId": "64f8a2b5c3d4e5f6g7h8i9j0"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "conversationId": "64f8a2b5c3d4e5f6g7h8i9j0",
  "message": "The Computer Science department is located in the Main Academic Building, Building A. You can find it on the second floor, room 201. The building is approximately 100 meters from the main gate.",
  "hasLocation": true,
  "functionCalls": [
    {
      "name": "queryDatabase",
      "args": {
        "queryType": "building",
        "filters": {
          "department": "Computer Science"
        }
      },
      "response": {
        "name": "Main Academic Building",
        "latitude": 6.335,
        "longitude": 5.611,
        "category": "academic"
      }
    }
  ]
}
```

**Error Response (500)**:
```json
{
  "success": false,
  "message": "AI service is temporarily unavailable. Please contact administrator to configure the API key.",
  "error": "Gemini API key not configured"
}
```

### GET /api/chat/conversations
**Description**: Get user's conversation history.

**Headers**: 
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "conversations": [
    {
      "id": "64f8a2b5c3d4e5f6g7h8i9j0",
      "title": "Where is the Computer Science department?",
      "lastMessage": "The Computer Science department is located in the Main Academic Building...",
      "lastActivity": "2024-11-04T11:35:00.000Z",
      "messageCount": 6
    },
    {
      "id": "64f8a2b5c3d4e5f6g7h8i9j1",
      "title": "How do I register for courses?",
      "lastMessage": "To register for courses, you need to log into the student portal...",
      "lastActivity": "2024-11-03T14:22:00.000Z",
      "messageCount": 4
    }
  ]
}
```

**Response for Guest Users (200)**:
```json
{
  "success": true,
  "conversations": []
}
```

### GET /api/chat/conversation/:id
**Description**: Get specific conversation with all messages.

**Headers**: 
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "conversation": {
    "id": "64f8a2b5c3d4e5f6g7h8i9j0",
    "title": "Where is the Computer Science department?",
    "messages": [
      {
        "role": "user",
        "content": "Where is the Computer Science department located?",
        "timestamp": "2024-11-04T11:30:00.000Z"
      },
      {
        "role": "assistant",
        "content": "The Computer Science department is located in the Main Academic Building...",
        "timestamp": "2024-11-04T11:30:01.000Z",
        "functionCalls": [
          {
            "name": "queryDatabase",
            "args": {
              "queryType": "building",
              "filters": {
                "department": "Computer Science"
              }
            },
            "response": {
              "name": "Main Academic Building",
              "latitude": 6.335,
              "longitude": 5.611
            }
          }
        ]
      }
    ],
    "createdAt": "2024-11-04T11:30:00.000Z",
    "lastActivity": "2024-11-04T11:35:00.000Z"
  }
}
```

**Error Response (404)**:
```json
{
  "success": false,
  "message": "Conversation not found"
}
```

## Administrative Management Endpoints

### GET /api/admin/users
**Description**: Get all users (System Admin only).

**Headers**: 
```
Authorization: Bearer <token>
```

**Role Requirement**: `system_admin`

**Success Response (200)**:
```json
{
  "success": true,
  "users": [
    {
      "_id": "64f8a2b5c3d4e5f6g7h8i9j0",
      "name": "John Doe",
      "matricNumber": "CSC/18/1234",
      "role": "student",
      "email": "john.doe@uniben.edu.ng",
      "department": {
        "_id": "64f8a2b5c3d4e5f6g7h8i9j1",
        "name": "Computer Science"
      },
      "isActive": true,
      "lastLogin": "2024-11-04T11:35:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Response (403)**:
```json
{
  "success": false,
  "message": "Access denied. System admin role required."
}
```

### POST /api/admin/users
**Description**: Create new user (System Admin only).

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Role Requirement**: `system_admin`

**Request**:
```json
{
  "name": "Jane Smith",
  "matricNumber": "CSC/19/5678",
  "role": "student",
  "email": "jane.smith@uniben.edu.ng",
  "department": "64f8a2b5c3d4e5f6g7h8i9j1",
  "courses": ["64f8a2b5c3d4e5f6g7h8i9j2"]
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "user": {
    "_id": "64f8a2b5c3d4e5f6g7h8i9j3",
    "name": "Jane Smith",
    "matricNumber": "CSC/19/5678",
    "role": "student",
    "email": "jane.smith@uniben.edu.ng",
    "department": "64f8a2b5c3d4e5f6g7h8i9j1",
    "courses": ["64f8a2b5c3d4e5f6g7h8i9j2"],
    "isActive": true,
    "createdAt": "2024-11-04T11:35:00.000Z"
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "matricNumber": "Matriculation number is required for students"
  }
}
```

### PUT /api/admin/users/:id
**Description**: Update user information (System Admin only).

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Role Requirement**: `system_admin`

**Request**:
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.smith.updated@uniben.edu.ng",
  "department": "64f8a2b5c3d4e5f6g7h8i9j1"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "user": {
    "_id": "64f8a2b5c3d4e5f6g7h8i9j3",
    "name": "Jane Smith Updated",
    "matricNumber": "CSC/19/5678",
    "role": "student",
    "email": "jane.smith.updated@uniben.edu.ng",
    "department": {
      "_id": "64f8a2b5c3d4e5f6g7h8i9j1",
      "name": "Computer Science"
    }
  }
}
```

### DELETE /api/admin/users/:id
**Description**: Delete user account (System Admin only).

**Headers**: 
```
Authorization: Bearer <token>
```

**Role Requirement**: `system_admin`

**Success Response (200)**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response (403)**:
```json
{
  "success": false,
  "message": "Cannot delete system admin accounts"
}
```

### GET /api/admin/courses
**Description**: Get courses with role-based filtering.

**Headers**: 
```
Authorization: Bearer <token>
```

**Role Requirements**: All authenticated roles (different access levels)

**System Admin Response (200)**:
```json
{
  "success": true,
  "courses": [
    {
      "_id": "64f8a2b5c3d4e5f6g7h8i9j2",
      "code": "CSC 201",
      "title": "Introduction to Programming",
      "description": "Fundamental programming concepts using Python",
      "department": {
        "_id": "64f8a2b5c3d4e5f6g7h8i9j1",
        "name": "Computer Science"
      },
      "departments_offering": [
        {
          "department": {
            "_id": "64f8a2b5c3d4e5f6g7h8i9j1",
            "name": "Computer Science"
          },
          "level": 200,
          "lecturerId": {
            "_id": "64f8a2b5c3d4e5f6g7h8i9j4",
            "name": "Dr. John Lecturer"
          },
          "isActive": true
        }
      ],
      "faculty": "Technology",
      "level": 200,
      "credit": 3,
      "enrollmentCount": 45,
      "isActive": true
    }
  ]
}
```

### POST /api/admin/courses
**Description**: Create new course (System Admin and Bursary Admin only).

**Headers**: 
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Role Requirements**: `system_admin`, `bursary_admin`

**Request**:
```json
{
  "code": "CSC 301",
  "title": "Data Structures and Algorithms",
  "description": "Advanced data structures and algorithm analysis",
  "department": "64f8a2b5c3d4e5f6g7h8i9j1",
  "faculty": "Technology",
  "level": 300,
  "credit": 4,
  "semester": "both",
  "prerequisites": ["CSC 201", "MATH 101"],
  "departments_offering": [
    {
      "department": "64f8a2b5c3d4e5f6g7h8i9j1",
      "level": 300,
      "semester": "both"
    }
  ]
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "course": {
    "_id": "64f8a2b5c3d4e5f6g7h8i9j5",
    "code": "CSC 301",
    "title": "Data Structures and Algorithms",
    "department": {
      "_id": "64f8a2b5c3d4e5f6g7h8i9j1",
      "name": "Computer Science"
    },
    "departments_offering": [
      {
        "department": {
          "_id": "64f8a2b5c3d4e5f6g7h8i9j1",
          "name": "Computer Science"
        },
        "level": 300,
        "semester": "both",
        "isActive": true
      }
    ],
    "level": 300,
    "credit": 4,
    "isActive": true
  }
}
```

### GET /api/admin/buildings
**Description**: Get all buildings for navigation system.

**Headers**: 
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "buildings": [
    {
      "_id": "64f8a2b5c3d4e5f6g7h8i9j6",
      "name": "Main Academic Building",
      "department": "Computer Science",
      "faculty": "Technology",
      "latitude": 6.335,
      "longitude": 5.611,
      "photoURL": "https://example.com/building1.jpg",
      "description": "Main building housing Computer Science and Engineering departments",
      "category": "academic",
      "icon": "🏢",
      "address": "University of Benin, Benin City",
      "phone": "+234-52-123-456",
      "isActive": true
    }
  ]
}
```

### GET /api/admin/stats
**Description**: Get dashboard statistics (role-based data).

**Headers**: 
```
Authorization: Bearer <token>
```

**System Admin Response (200)**:
```json
{
  "success": true,
  "stats": {
    "users": 1250,
    "buildings": 15,
    "departments": 12,
    "courses": 85,
    "quizzes": 23,
    "news": 8
  },
  "userRole": "system_admin"
}
```

**Bursary Admin Response (200)**:
```json
{
  "success": true,
  "stats": {
    "users": 1250,
    "buildings": 15,
    "departments": 12,
    "courses": 85,
    "quizzes": 23,
    "news": 8,
    "feesNote": "Per-student payment metrics have been removed from the API. Use /api/bursary/fees for catalog-level information."
  },
  "userRole": "bursary_admin"
}
```

## Role-Based Access Control (RBAC)

### User Roles and Permissions

1. **system_admin**: Full system access
   - Create/modify/delete all users
   - Manage all departments and courses
   - Access all analytics and reports
   - System configuration

2. **bursary_admin**: Financial data access
   - View user and course information
   - Access fee catalogs
   - Limited administrative functions

3. **departmental_admin**: Department-level management
   - Manage courses within their department
   - View department statistics
   - Assign lecturers to courses

4. **lecturer_admin**: Course-specific management
   - Edit assigned courses
   - Create quizzes for their courses
   - View student enrollment in their courses

5. **staff**: Basic administrative access
   - View courses and departments
   - Limited data access

6. **student**: Limited access
   - View enrolled courses
   - Take quizzes
   - Chat with AI assistant

7. **guest**: Minimal access
   - Chat with AI assistant (no conversation history)
   - View public information only

### Security Features

- **JWT Authentication**: Token-based authentication with role claims
- **Token Expiration**: 7 days for regular users, 24 hours for guests
- **Rate Limiting**: Implemented on authentication endpoints
- **Role Validation**: Server-side role checking for all protected routes
- **Data Filtering**: Results filtered based on user's role and department
- **Input Validation**: Comprehensive validation on all endpoints

### Error Handling

All endpoints follow consistent error response format:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "code": "ERROR_CODE", // Optional error code
  "errors": { // Validation errors (if applicable)
    "fieldName": "Validation error message"
  }
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error