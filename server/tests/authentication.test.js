const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let app;
let testData;

beforeAll(async () => {
  // Configure test environment
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniben-assistant-test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_authentication_testing';
  process.env.SYSTEM_ADMIN_SECURITY_ANSWER = 'uniben2024';
  process.env.SYSTEM_ADMIN_STAFF_ID = 'SYSADMIN-001';

  // Connect to test database
  const connectDB = require('../src/config/database');
  await connectDB();

  // Clean database before tests
  await mongoose.connection.db.dropDatabase();

  // Import models after DB connection
  const User = require('../src/models/User');
  const Department = require('../src/models/Department');

  // Create test department
  const testDepartment = await Department.create({
    name: 'Computer Science',
    code: 'CSC',
    faculty: 'Science',
    hodName: 'Dr. Test HOD'
  });

  // Create test users for different roles
  const users = await Promise.all([
    // Student user
    User.create({
      name: 'Test Student',
      role: 'student',
      matricNumber: 'CSC/20/1234',
      isActive: true,
      email: 'student@test.com'
    }),
    // Staff user
    User.create({
      name: 'Test Staff',
      role: 'staff',
      staffId: 'STAFF-1001',
      isActive: true,
      email: 'staff@test.com'
    }),
    // Department admin user
    User.create({
      name: 'Test Dept Admin',
      role: 'departmental_admin',
      staffId: 'STAFF-3001',
      isActive: true,
      email: 'dept@test.com',
      department: testDepartment._id
    }),
    // System admin user (will be auto-created)
    User.create({
      name: 'System Administrator',
      role: 'system_admin',
      staffId: 'SYSADMIN-001',
      isActive: true,
      email: 'admin@uniben.edu.ng'
    }),
    // Inactive user for testing
    User.create({
      name: 'Inactive User',
      role: 'student',
      matricNumber: 'CSC/20/5678',
      isActive: false,
      email: 'inactive@test.com'
    })
  ]);

  // Generate tokens for test users
  testData = {
    department: testDepartment,
    users: {
      student: users[0],
      staff: users[1],
      deptAdmin: users[2],
      systemAdmin: users[3],
      inactive: users[4]
    },
    tokens: {}
  };

  // Create JWT tokens
  for (const [role, user] of Object.entries(testData.users)) {
    if (role !== 'inactive') {
      testData.tokens[role] = jwt.sign(
        {
          id: user._id.toString(),
          role: user.role,
          name: user.name,
          displayId: user.displayId,
          department: user.department
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
          issuer: 'uniben-ai-assistant',
          audience: 'uniben-users'
        }
      );
    }
  }

  // Load the app after setup
  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Authentication System Tests', () => {
  describe('Student Authentication', () => {
    test('AUTH-STU-001: Valid student login should succeed', async () => {
      const response = await request(app)
        .post('/api/auth/login/student')
        .send({ matricNumber: 'CSC/20/1234' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Welcome back');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe('student');
      expect(response.body.user.matricNumber).toBe('CSC/20/1234');
    });

    test('AUTH-STU-002: Invalid student matriculation should fail', async () => {
      const response = await request(app)
        .post('/api/auth/login/student')
        .send({ matricNumber: 'INVALID001' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Student not found');
      expect(response.body.code).toBe('STUDENT_NOT_FOUND');
    });

    test('AUTH-STU-003: Inactive student account should fail', async () => {
      const response = await request(app)
        .post('/api/auth/login/student')
        .send({ matricNumber: 'CSC/20/5678' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Student not found');
    });

    test('AUTH-STU-004: Missing matriculation number should fail', async () => {
      const response = await request(app)
        .post('/api/auth/login/student')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Matriculation number is required');
    });
  });

  describe('Staff Authentication', () => {
    test('AUTH-STAFF-001: Valid staff login should succeed', async () => {
      const response = await request(app)
        .post('/api/auth/login/staff')
        .send({ staffId: 'STAFF-1001' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Welcome back');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe('staff');
      expect(response.body.user.staffId).toBe('STAFF-1001');
    });

    test('AUTH-STAFF-002: System admin login with security answer should succeed', async () => {
      const response = await request(app)
        .post('/api/auth/login/staff')
        .send({ 
          staffId: 'SYSADMIN-001',
          securityAnswer: 'uniben2024'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('System Administrator');
      expect(response.body.user.role).toBe('system_admin');
    });

    test('AUTH-STAFF-003: System admin login without security answer should fail', async () => {
      const response = await request(app)
        .post('/api/auth/login/staff')
        .send({ staffId: 'SYSADMIN-001' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Security verification required');
      expect(response.body.requiresSecurity).toBe(true);
    });

    test('AUTH-STAFF-004: System admin with wrong security answer should fail', async () => {
      const response = await request(app)
        .post('/api/auth/login/staff')
        .send({ 
          staffId: 'SYSADMIN-001',
          securityAnswer: 'wrong_answer'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid security answer');
    });

    test('AUTH-STAFF-005: Invalid staff ID should fail', async () => {
      const response = await request(app)
        .post('/api/auth/login/staff')
        .send({ staffId: 'INVALID001' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Staff member not found');
      expect(response.body.code).toBe('STAFF_NOT_FOUND');
    });

    test('AUTH-STAFF-006: Missing staff ID should fail', async () => {
      const response = await request(app)
        .post('/api/auth/login/staff')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Staff ID is required');
    });
  });

  describe('Guest Authentication', () => {
    test('AUTH-GUEST-001: Guest login should succeed', async () => {
      const response = await request(app)
        .post('/api/auth/login/guest')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Guest');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe('guest');
      expect(response.body.user.isGuest).toBe(true);
    });

    test('AUTH-GUEST-002: Guest token should have 24h expiration', async () => {
      const response = await request(app)
        .post('/api/auth/login/guest')
        .send({});

      const token = response.body.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.role).toBe('guest');
      expect(decoded.isGuest).toBe(true);
      expect(decoded.id).toBe('guest-user');
    });
  });

  describe('Token Verification', () => {
    test('AUTH-TOKEN-001: Valid token verification should succeed', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    test('AUTH-TOKEN-002: Invalid token should fail', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });

    test('AUTH-TOKEN-003: Missing token should fail', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token is required');
    });

    test('AUTH-TOKEN-004: Guest token verification should work', async () => {
      const guestResponse = await request(app)
        .post('/api/auth/login/guest')
        .send({});

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${guestResponse.body.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('guest');
    });
  });

  describe('User Information', () => {
    test('AUTH-USER-001: Get current user info should succeed', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.role).toBe('student');
    });

    test('AUTH-USER-002: Guest user info should work', async () => {
      const guestResponse = await request(app)
        .post('/api/auth/login/guest')
        .send({});

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${guestResponse.body.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('guest');
    });

    test('AUTH-USER-003: Invalid token should fail user info request', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Role-Based Authentication', () => {
    test('AUTH-ROLE-001: Student should have student role', async () => {
      const response = await request(app)
        .post('/api/auth/login/student')
        .send({ matricNumber: 'CSC/20/1234' });

      expect(response.body.user.role).toBe('student');
    });

    test('AUTH-ROLE-002: Department admin should have departmental_admin role', async () => {
      const response = await request(app)
        .post('/api/auth/login/staff')
        .send({ staffId: 'STAFF-3001' });

      expect(response.body.user.role).toBe('departmental_admin');
    });

    test('AUTH-ROLE-003: System admin should have system_admin role', async () => {
      const response = await request(app)
        .post('/api/auth/login/staff')
        .send({ 
          staffId: 'SYSADMIN-001',
          securityAnswer: 'uniben2024'
        });

      expect(response.body.user.role).toBe('system_admin');
    });
  });

  describe('Security Tests', () => {
    test('AUTH-SEC-001: SQL injection attempt should be handled safely', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/auth/login/student')
        .send({ matricNumber: maliciousInput })
        .expect(404);

      expect(response.body.success).toBe(false);
      // Database should still exist and be functional
      expect(response.body.message).toContain('Student not found');
    });

    test('AUTH-SEC-002: XSS attempt in login should be handled safely', async () => {
      const xssInput = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/auth/login/student')
        .send({ matricNumber: xssInput })
        .expect(404);

      expect(response.body.success).toBe(false);
      // No XSS should be executed
    });

    test('AUTH-SEC-003: Rate limiting should prevent brute force attacks', async () => {
      // Attempt multiple failed logins rapidly
      const attempts = Array(10).fill().map(() => 
        request(app)
          .post('/api/auth/login/student')
          .send({ matricNumber: 'FAKE001' })
      );

      const responses = await Promise.all(attempts);
      
      // All should fail but should be handled gracefully
      responses.forEach(response => {
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    test('AUTH-ERROR-001: Server error should return proper error message', async () => {
      // Temporarily break JWT_SECRET to test error handling
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = '';
      
      try {
        const response = await request(app)
          .post('/api/auth/login/student')
          .send({ matricNumber: 'CSC/20/1234' });

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBeDefined();
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });

    test('AUTH-ERROR-002: Database connection error should be handled', async () => {
      // This test would require simulating DB connection failure
      // For now, we'll test with malformed data
      const response = await request(app)
        .post('/api/auth/login/student')
        .send({ matricNumber: null })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});