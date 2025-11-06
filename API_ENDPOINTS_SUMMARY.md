# API Endpoints Summary - UNIBEN AI Assistant

## 3.6.2 API Design

The RESTful API implements role-based access control with JWT authentication for all endpoints.

## Authentication Endpoints

| Method | Endpoint | Description | Required Fields |
|--------|----------|-------------|----------------|
| POST | `/api/auth/login/student` | Student authentication | `matricNumber` |
| POST | `/api/auth/login/staff` | Staff/admin authentication | `staffId`, `securityAnswer` (system admin) |
| POST | `/api/auth/login/guest` | Guest session creation | None |
| GET | `/api/auth/me` | Get current user info | Bearer token |
| GET | `/api/auth/verify` | Validate JWT token | Bearer token |

**Response Format**:
```json
{
  "success": true/false,
  "message": "Status message",
  "token": "JWT token",
  "user": { "id", "name", "role", "displayId", "email" }
}
```

## Chat and AI Integration Endpoints

| Method | Endpoint | Description | Function Calls |
|--------|----------|-------------|----------------|
| POST | `/api/chat/message` | Send message to AI | `queryDatabase`, `resourceTool` |
| GET | `/api/chat/conversations` | Get conversation history | N/A |
| GET | `/api/chat/conversation/:id` | Get specific conversation | N/A |

**Function Calling Examples**:
- `queryDatabase`: Building locations, course information, department data
- `resourceTool`: PDF processing, document extraction
- Location detection: Automatic building identification from queries

## Administrative Management Endpoints

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/admin/users` | system_admin | List all users |
| POST | `/api/admin/users` | system_admin | Create user account |
| PUT | `/api/admin/users/:id` | system_admin | Update user info |
| DELETE | `/api/admin/users/:id` | system_admin | Delete user account |
| GET | `/api/admin/courses` | All roles* | List courses (filtered by role) |
| POST | `/api/admin/courses` | system_admin, bursary_admin | Create new course |
| PUT | `/api/admin/courses/:id` | system_admin, lecturer_admin | Update course details |
| GET | `/api/admin/buildings` | All roles | List campus buildings |
| GET | `/api/admin/stats` | All roles** | Dashboard statistics |

*Different access levels for each role
**Role-specific statistics and data filtering

## Role-Based Access Control

| Role | Permissions | Data Access |
|------|-------------|-------------|
| system_admin | Full system access | All users, departments, courses |
| bursary_admin | Financial data access | User info, fee catalogs |
| departmental_admin | Department management | Own department data |
| lecturer_admin | Course management | Assigned courses only |
| staff | Basic admin access | Limited data access |
| student | Limited access | Own courses, enrolled content |
| guest | Minimal access | Public info only |

## Security Features

- **JWT Authentication**: Token expiration (7d users, 24h guests)
- **Role Validation**: Server-side permission checking
- **Input Validation**: Comprehensive field validation
- **Rate Limiting**: Authentication endpoint protection
- **Error Handling**: Consistent error responses

## API Response Standards

**Success Response**:
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

**Common Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Validation Error
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Server Error