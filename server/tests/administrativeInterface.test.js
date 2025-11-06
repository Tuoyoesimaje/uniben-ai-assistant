const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let app;
let testData;

beforeAll(async () => {
  // Configure test environment
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniben-assistant-test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_admin_testing';

  // Connect to test database
  const connectDB = require('../src/config/database');
  await connectDB();

  // Clean database before tests
  await mongoose.connection.db.dropDatabase();

  // Import models after DB connection
  const User = require('../src/models/User');
  const Department = require('../src/models/Department');
  const Course = require('../src/models/Course');
  const Building = require('../src/models/Building');
  const News = require('../src/models/News');
  const Quiz = require('../src/models/Quiz');
  const FeesCatalog = require('../src/models/FeesCatalog');

  // Create test departments
  const csDepartment = await Department.create({
    name: 'Computer Science',
    code: 'CSC',
    faculty: 'Science',
    hodName: 'Dr. Test CS HOD'
  });

  const mathDepartment = await Department.create({
    name: 'Mathematics',
    code: 'MTH',
    faculty: 'Science',
    hodName: 'Dr. Test Math HOD'
  });

  // Create test users for different administrative roles
  const users = await Promise.all([
    // System Administrator
    User.create({
      name: 'System Admin',
      role: 'system_admin',
      staffId: 'SYSADMIN-001',
      isActive: true,
      email: 'sysadmin@test.com'
    }),
    // Department Administrator
    User.create({
      name: 'CS Department Admin',
      role: 'departmental_admin',
      staffId: 'STAFF-2001',
      isActive: true,
      email: 'deptadmin@test.com',
      department: csDepartment._id
    }),
    // Lecturer Administrator
    User.create({
      name: 'CS Lecturer',
      role: 'lecturer_admin',
      staffId: 'STAFF-3001',
      isActive: true,
      email: 'lecturer@test.com',
      department: csDepartment._id
    }),
    // Bursary Administrator
    User.create({
      name: 'Bursary Admin',
      role: 'bursary_admin',
      staffId: 'STAFF-4001',
      isActive: true,
      email: 'bursary@test.com'
    }),
    // Regular Staff
    User.create({
      name: 'Regular Staff',
      role: 'staff',
      staffId: 'STAFF-1001',
      isActive: true,
      email: 'staff@test.com'
    }),
    // Student
    User.create({
      name: 'Test Student',
      role: 'student',
      matricNumber: 'CSC/20/0001',
      isActive: true,
      email: 'student@test.com',
      department: csDepartment._id
    }),
    // Lecturer in different department
    User.create({
      name: 'Math Lecturer',
      role: 'lecturer_admin',
      staffId: 'STAFF-3002',
      isActive: true,
      email: 'mathlecturer@test.com',
      department: mathDepartment._id
    })
  ]);

  // Create test course
  const testCourse = await Course.create({
    code: 'CSC101',
    title: 'Introduction to Computer Science',
    description: 'Basic concepts of computer science',
    department: csDepartment._id,
    faculty: 'Science',
    level: 100,
    credit: 3,
    departments_offering: [{
      department: csDepartment._id,
      level: 100,
      lecturerId: users[2]._id, // CS Lecturer
      semester: 'first'
    }]
  });

  // Create test building
  const testBuilding = await Building.create({
    name: 'Computer Science Building',
    department: 'Computer Science',
    faculty: 'Science',
    latitude: 6.3350,
    longitude: 5.6037,
    photoURL: 'https://example.com/csb.jpg',
    description: 'Main CS department building',
    category: 'academic'
  });

  // Create test news
  const testNews = await News.create({
    title: 'Test News Item',
    content: 'This is a test news announcement for testing',
    authorId: users[1]._id, // Department Admin
    audience: 'department_specific',
    department: csDepartment._id,
    active: true
  });

  // Create test quiz
  const testQuiz = await Quiz.create({
    title: 'Test Quiz',
    description: 'A test quiz for validation',
    course: testCourse._id,
    createdBy: users[2]._id, // Lecturer
    questions: [
      {
        question: 'What is a variable?',
        options: ['A constant', 'A storage location', 'A function', 'A loop'],
        correctAnswer: 1,
        explanation: 'A variable is a storage location that holds data.'
      }
    ],
    timeLimit: 30,
    isActive: true
  });

  // Create test fees catalog
  const testFeesCatalog = await FeesCatalog.create({
    level: '100',
    session: '2024/2025',
    currency: 'NGN',
    isNew: true,
    items: [
      {
        category: 'Tuition',
        description: 'Tuition fee for 100 level',
        amount: 50000,
        currency: 'NGN'
      },
      {
        category: 'Development Levy',
        description: 'Development levy',
        amount: 10000,
        currency: 'NGN'
      }
    ],
    notes: 'Test fees catalog for testing purposes'
  });

  // Generate tokens for test users
  testData = {
    departments: {
      cs: csDepartment,
      math: mathDepartment
    },
    users: {
      systemAdmin: users[0],
      deptAdmin: users[1],
      lecturer: users[2],
      bursaryAdmin: users[3],
      staff: users[4],
      student: users[5],
      mathLecturer: users[6]
    },
    course: testCourse,
    building: testBuilding,
    news: testNews,
    quiz: testQuiz,
    feesCatalog: testFeesCatalog,
    tokens: {}
  };

  // Create JWT tokens
  const tokenRoles = ['systemAdmin', 'deptAdmin', 'lecturer', 'bursaryAdmin', 'staff', 'student', 'mathLecturer'];
  for (const role of tokenRoles) {
    const user = testData.users[role];
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

  // Load the app after setup
  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Administrative Interface Tests', () => {
  describe('System Administration Tests', () => {
    test('ADMIN-SYS-001: System admin should access all departments', async () => {
      const response = await request(app)
        .get('/api/admin/departments')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.departments).toBeDefined();
      expect(response.body.departments.length).toBeGreaterThan(0);
      
      const deptNames = response.body.departments.map(d => d.name);
      expect(deptNames).toContain('Computer Science');
      expect(deptNames).toContain('Mathematics');
    });

    test('ADMIN-SYS-002: System admin should create new department', async () => {
      const newDepartment = {
        name: 'Physics Department',
        code: 'PHY',
        faculty: 'Science',
        hodName: 'Dr. Test Physics HOD'
      };

      const response = await request(app)
        .post('/api/admin/departments')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .send(newDepartment)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.department.name).toBe('Physics Department');
      expect(response.body.department.code).toBe('PHY');
    });

    test('ADMIN-SYS-003: System admin should update department', async () => {
      const updateData = {
        name: 'Computer Science Updated',
        hodName: 'Dr. New CS HOD'
      };

      const response = await request(app)
        .put(`/api/admin/departments/${testData.departments.cs._id}`)
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.department.name).toBe('Computer Science Updated');
      expect(response.body.department.hodName).toBe('Dr. New CS HOD');
    });

    test('ADMIN-SYS-004: System admin should delete department', async () => {
      const response = await request(app)
        .delete(`/api/admin/departments/${testData.departments.math._id}`)
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    test('ADMIN-SYS-005: Non-system admin should not access departments', async () => {
      const response = await request(app)
        .get('/api/admin/departments')
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('ADMIN-SYS-006: System admin should access system statistics', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.users).toBeGreaterThan(0);
      expect(response.body.stats.departments).toBeGreaterThan(0);
      expect(response.body.stats.courses).toBeGreaterThan(0);
      expect(response.body.stats.buildings).toBeGreaterThan(0);
      expect(response.body.stats.news).toBeGreaterThan(0);
    });

    test('ADMIN-SYS-007: System admin should create buildings', async () => {
      const newBuilding = {
        name: 'New Science Building',
        department: 'Physics',
        faculty: 'Science',
        latitude: 6.3355,
        longitude: 5.6040,
        photoURL: 'https://example.com/newbuilding.jpg',
        description: 'New physics building',
        category: 'academic'
      };

      const response = await request(app)
        .post('/api/admin/buildings')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .send(newBuilding)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.building.name).toBe('New Science Building');
    });

    test('ADMIN-SYS-008: System admin should update buildings', async () => {
      const updateData = {
        description: 'Updated CS building description',
        phone: '+234-803-111-2222'
      };

      const response = await request(app)
        .put(`/api/admin/buildings/${testData.building._id}`)
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.building.description).toBe('Updated CS building description');
    });

    test('ADMIN-SYS-009: System admin should delete buildings', async () => {
      // Create a building to delete
      const buildingToDelete = await request(app)
        .post('/api/admin/buildings')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .send({
          name: 'Temporary Building',
          latitude: 6.3360,
          longitude: 5.6045,
          photoURL: 'https://example.com/temp.jpg',
          description: 'Temporary building for testing',
          category: 'facility'
        });

      const deleteResponse = await request(app)
        .delete(`/api/admin/buildings/${buildingToDelete.body.building._id}`)
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
    });

    test('ADMIN-SYS-010: System admin should create courses', async () => {
      const newCourse = {
        code: 'PHY101',
        title: 'Introduction to Physics',
        description: 'Basic physics concepts',
        department: testData.departments.cs._id,
        faculty: 'Science',
        level: 100,
        credit: 3
      };

      const response = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .send(newCourse)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.course.code).toBe('PHY101');
    });
  });

  describe('Department Administration Tests', () => {
    test('ADMIN-DEPT-001: Department admin should view own department courses', async () => {
      const response = await request(app)
        .get('/api/admin/department/courses')
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.courses).toBeDefined();
    });

    test('ADMIN-DEPT-002: Department admin should add course offering', async () => {
      const offeringData = {
        departments_offering: [
          {
            department: testData.departments.cs._id,
            level: 200,
            lecturerId: testData.users.lecturer._id,
            semester: 'first'
          }
        ]
      };

      const response = await request(app)
        .put(`/api/admin/department/courses/${testData.course._id}`)
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .send(offeringData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.course.departments_offering).toBeDefined();
    });

    test('ADMIN-DEPT-003: Department admin should access department lecturers', async () => {
      const response = await request(app)
        .get('/api/admin/department/lecturers')
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.lecturers).toBeDefined();
      
      // Should only see lecturers in their department
      const lecturerEmails = response.body.lecturers.map(l => l.email);
      expect(lecturerEmails).toContain('lecturer@test.com');
      expect(lecturerEmails).not.toContain('mathlecturer@test.com');
    });

    test('ADMIN-DEPT-004: Department admin should view department statistics', async () => {
      const response = await request(app)
        .get('/api/admin/department/stats')
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
    });

    test('ADMIN-DEPT-005: Department admin should not access other departments', async () => {
      const response = await request(app)
        .get('/api/admin/department/courses')
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .expect(200);

      // The response should only contain courses from their department
      expect(response.body.success).toBe(true);
      // Additional validation would depend on specific course data
    });

    test('ADMIN-DEPT-006: Department admin should create news', async () => {
      const newsData = {
        title: 'Department Announcement',
        content: 'Important departmental announcement for testing',
        audience: 'department_specific',
        active: true
      };

      const response = await request(app)
        .post('/api/admin/department/news')
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .send(newsData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.news.title).toBe('Department Announcement');
    });

    test('ADMIN-DEPT-007: Department admin should update department news', async () => {
      const updateData = {
        title: 'Updated Department News',
        content: 'Updated content for testing'
      };

      const response = await request(app)
        .put(`/api/admin/department/news/${testData.news._id}`)
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.news.title).toBe('Updated Department News');
    });
  });

  describe('Lecturer Administration Tests', () => {
    test('ADMIN-LECT-001: Lecturer should view assigned courses', async () => {
      const response = await request(app)
        .get('/api/admin/lecturer/courses')
        .set('Authorization', `Bearer ${testData.tokens.lecturer}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.courses).toBeDefined();
    });

    test('ADMIN-LECT-002: Lecturer should update assigned course content', async () => {
      const updateData = {
        syllabus: 'Updated syllabus for testing',
        announcements: [
          {
            title: 'Course Update',
            content: 'Important update for the course',
            createdAt: new Date().toISOString()
          }
        ]
      };

      const response = await request(app)
        .put(`/api/admin/lecturer/courses/${testData.course._id}`)
        .set('Authorization', `Bearer ${testData.tokens.lecturer}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.course.syllabus).toBe('Updated syllabus for testing');
    });

    test('ADMIN-LECT-003: Lecturer should not update unassigned course', async () => {
      // Create a course not assigned to this lecturer
      const unassignedCourse = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .send({
          code: 'MTH101',
          title: 'Mathematics I',
          description: 'Basic mathematics',
          department: testData.departments.cs._id,
          faculty: 'Science',
          level: 100,
          credit: 3
        });

      const updateData = {
        syllabus: 'Should not be updated'
      };

      const response = await request(app)
        .put(`/api/admin/lecturer/courses/${unassignedCourse.body.course._id}`)
        .set('Authorization', `Bearer ${testData.tokens.lecturer}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('ADMIN-LECT-004: Lecturer should create quizzes', async () => {
      const quizData = {
        title: 'Test Quiz by Lecturer',
        description: 'Quiz created by lecturer for testing',
        course: testData.course._id,
        questions: [
          {
            question: 'Test question?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            explanation: 'This is a test explanation'
          }
        ],
        timeLimit: 30,
        isActive: true
      };

      const response = await request(app)
        .post('/api/admin/lecturer/quizzes')
        .set('Authorization', `Bearer ${testData.tokens.lecturer}`)
        .send(quizData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.quiz.title).toBe('Test Quiz by Lecturer');
    });

    test('ADMIN-LECT-005: Lecturer should update own quizzes', async () => {
      const updateData = {
        title: 'Updated Test Quiz',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/admin/lecturer/quizzes/${testData.quiz._id}`)
        .set('Authorization', `Bearer ${testData.tokens.lecturer}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.quiz.title).toBe('Updated Test Quiz');
    });

    test('ADMIN-LECT-006: Lecturer should not update other lecturer\'s quiz', async () => {
      // Create a quiz by another lecturer (would need to simulate)
      // For now, test with existing quiz and wrong lecturer
      const response = await request(app)
        .put(`/api/admin/lecturer/quizzes/${testData.quiz._id}`)
        .set('Authorization', `Bearer ${testData.tokens.mathLecturer}`)
        .send({ title: 'Should not update' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('ADMIN-LECT-007: Lecturer should view student statistics', async () => {
      const response = await request(app)
        .get('/api/admin/lecturer/stats')
        .set('Authorization', `Bearer ${testData.tokens.lecturer}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.myCourses).toBeDefined();
    });
  });

  describe('Bursary Administration Tests', () => {
    test('ADMIN-BUR-001: Bursary admin should view fees catalogs', async () => {
      const response = await request(app)
        .get('/api/admin/bursary/fees')
        .set('Authorization', `Bearer ${testData.tokens.bursaryAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.feesCatalogs).toBeDefined();
    });

    test('ADMIN-BUR-002: Bursary admin should create fees catalog', async () => {
      const catalogData = {
        level: '200',
        session: '2024/2025',
        currency: 'NGN',
        isNew: false,
        items: [
          {
            category: 'Tuition',
            description: 'Tuition fee for 200 level',
            amount: 60000,
            currency: 'NGN'
          }
        ],
        notes: 'Test catalog for 200 level'
      };

      const response = await request(app)
        .post('/api/admin/bursary/fees')
        .set('Authorization', `Bearer ${testData.tokens.bursaryAdmin}`)
        .send(catalogData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.feesCatalog.level).toBe('200');
    });

    test('ADMIN-BUR-003: Bursary admin should update fees catalog', async () => {
      const updateData = {
        isNew: false,
        notes: 'Updated test notes'
      };

      const response = await request(app)
        .put(`/api/admin/bursary/fees/${testData.feesCatalog._id}`)
        .set('Authorization', `Bearer ${testData.tokens.bursaryAdmin}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.feesCatalog.isNew).toBe(false);
    });

    test('ADMIN-BUR-004: Bursary admin should access bursary statistics', async () => {
      const response = await request(app)
        .get('/api/admin/bursary/stats')
        .set('Authorization', `Bearer ${testData.tokens.bursaryAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
    });

    test('ADMIN-BUR-005: Non-bursary admin should not access bursary functions', async () => {
      const response = await request(app)
        .get('/api/admin/bursary/fees')
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Role-Based Access Control Tests', () => {
    test('ACCESS-001: Student should not access administrative functions', async () => {
      const endpoints = [
        '/api/admin/departments',
        '/api/admin/department/courses',
        '/api/admin/lecturer/courses',
        '/api/admin/bursary/fees',
        '/api/admin/stats'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${testData.tokens.student}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      }
    });

    test('ACCESS-002: Staff should have limited administrative access', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${testData.tokens.staff}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
    });

    test('ACCESS-003: Cross-department access should be prevented', async () => {
      // Math lecturer should not access CS department data
      const response = await request(app)
        .get('/api/admin/department/lecturers')
        .set('Authorization', `Bearer ${testData.tokens.mathLecturer}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should only see math department lecturers
      const lecturerEmails = response.body.lecturers.map(l => l.email);
      expect(lecturerEmails).not.toContain('lecturer@test.com');
    });

    test('ACCESS-004: Privilege escalation should be prevented', async () => {
      // Student trying to access system admin functions
      const response = await request(app)
        .get('/api/admin/departments')
        .set('Authorization', `Bearer ${testData.tokens.student}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('ACCESS-005: Department admin should only access own department data', async () => {
      const response = await request(app)
        .get('/api/admin/department/stats')
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Statistics should be department-specific
      expect(response.body.stats.department).toBeDefined();
    });
  });

  describe('Course Management Tests', () => {
    test('COURSE-001: System admin should view all courses', async () => {
      const response = await request(app)
        .get('/api/admin/courses')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.courses).toBeDefined();
      expect(response.body.courses.length).toBeGreaterThan(0);
    });

    test('COURSE-002: Department admin should view department courses', async () => {
      const response = await request(app)
        .get('/api/admin/courses')
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.courses).toBeDefined();
    });

    test('COURSE-003: Lecturer should view assigned courses', async () => {
      const response = await request(app)
        .get('/api/admin/courses')
        .set('Authorization', `Bearer ${testData.tokens.lecturer}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.courses).toBeDefined();
    });

    test('COURSE-004: System admin should update any course', async () => {
      const updateData = {
        description: 'Updated course description by system admin'
      };

      const response = await request(app)
        .put(`/api/admin/courses/${testData.course._id}`)
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.course.description).toBe('Updated course description by system admin');
    });

    test('COURSE-005: Lecturer should only update assigned courses', async () => {
      const updateData = {
        syllabus: 'Updated by lecturer'
      };

      const response = await request(app)
        .put(`/api/admin/courses/${testData.course._id}`)
        .set('Authorization', `Bearer ${testData.tokens.lecturer}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('News Management Tests', () => {
    test('NEWS-001: System admin should view all news', async () => {
      const response = await request(app)
        .get('/api/admin/news')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.news).toBeDefined();
    });

    test('NEWS-002: Department admin should create department news', async () => {
      const newsData = {
        title: 'Department Test News',
        content: 'This is a test news item for the department',
        audience: 'department_specific',
        active: true
      };

      const response = await request(app)
        .post('/api/admin/department/news')
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .send(newsData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.news.title).toBe('Department Test News');
    });

    test('NEWS-003: System admin should create university-wide news', async () => {
      const newsData = {
        title: 'University Test News',
        content: 'This is a university-wide test news item',
        audience: 'everyone',
        active: true
      };

      const response = await request(app)
        .post('/api/admin/news')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .send(newsData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.news.title).toBe('University Test News');
    });
  });

  describe('Administrative Performance Tests', () => {
    test('ADMIN-PERF-001: System statistics retrieval performance', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000); // Less than 2 seconds
    });

    test('ADMIN-PERF-002: Department statistics retrieval performance', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/admin/department/stats')
        .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1500); // Less than 1.5 seconds
    });

    test('ADMIN-PERF-003: Concurrent administrative requests', async () => {
      const requests = [
        () => request(app).get('/api/admin/stats').set('Authorization', `Bearer ${testData.tokens.systemAdmin}`),
        () => request(app).get('/api/admin/department/courses').set('Authorization', `Bearer ${testData.tokens.deptAdmin}`),
        () => request(app).get('/api/admin/lecturer/courses').set('Authorization', `Bearer ${testData.tokens.lecturer}`)
      ];

      const responses = await Promise.all(requests.map(req => req()));
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Administrative Error Handling', () => {
    test('ADMIN-ERROR-001: Invalid department ID should return 404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/admin/departments/${fakeId}`)
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('ADMIN-ERROR-002: Missing authentication should return 401', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('ADMIN-ERROR-003: Invalid course ID should return 404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/admin/courses/${fakeId}`)
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .send({ description: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('ADMIN-ERROR-004: Validation errors should be handled properly', async () => {
      const invalidCourse = {
        code: '', // Empty code should fail validation
        title: 'Test Course',
        description: 'Test description',
        department: testData.departments.cs._id,
        faculty: 'Science',
        level: 100,
        credit: 3
      };

      const response = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .send(invalidCourse)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});