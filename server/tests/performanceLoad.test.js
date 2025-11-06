const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let app;
let testData;

beforeAll(async () => {
  // Configure test environment for performance testing
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniben-assistant-perf-test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_performance_testing';
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test_gemini_key_for_perf_testing';
  process.env.MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || 'test_mapbox_token_for_perf_testing';

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
  const Conversation = require('../src/models/Conversation');
  const News = require('../src/models/News');
  const Quiz = require('../src/models/Quiz');
  const FeesCatalog = require('../src/models/FeesCatalog');

  // Create test data for performance testing
  const departments = await Department.create([
    { name: 'Computer Science', code: 'CSC', faculty: 'Science', hodName: 'Dr. CS HOD' },
    { name: 'Mathematics', code: 'MTH', faculty: 'Science', hodName: 'Dr. Math HOD' },
    { name: 'Physics', code: 'PHY', faculty: 'Science', hodName: 'Dr. Physics HOD' },
    { name: 'Chemistry', code: 'CHM', faculty: 'Science', hodName: 'Dr. Chemistry HOD' },
    { name: 'Biology', code: 'BIO', faculty: 'Science', hodName: 'Dr. Biology HOD' }
  ]);

  // Create a larger set of users for load testing
  const users = [];
  for (let i = 0; i < 50; i++) {
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const admissionYear = 20 + (i % 5); // 20-24 for years 2020-2024
    const studentNumber = String(Math.floor(i / 10) + 1).padStart(2, '0') + String(i % 10).padStart(2, '0');
    users.push(await User.create({
      name: `Test Student ${i}`,
      role: 'student',
      matricNumber: `${dept.code}/${admissionYear}/${studentNumber}`,
      isActive: true,
      email: `student${i}@test.com`,
      department: dept._id
    }));
  }

  // Add staff users
  const staffUsers = [];
  for (let i = 0; i < 20; i++) {
    staffUsers.push(await User.create({
      name: `Test Staff ${i}`,
      role: 'staff',
      staffId: `STAFF-${String(1000 + i).padStart(4, '0')}`,
      isActive: true,
      email: `staff${i}@test.com`,
      department: departments[Math.floor(Math.random() * departments.length)]._id
    }));
  }

  // Create admin users
  const adminUsers = await Promise.all([
    User.create({
      name: 'System Admin',
      role: 'system_admin',
      staffId: 'SYSADMIN-001',
      isActive: true,
      email: 'sysadmin@test.com'
    }),
    User.create({
      name: 'Department Admin',
      role: 'departmental_admin',
      staffId: 'STAFF-2001',
      isActive: true,
      email: 'deptadmin@test.com',
      department: departments[0]._id
    }),
    User.create({
      name: 'Lecturer Admin',
      role: 'lecturer_admin',
      staffId: 'STAFF-3001',
      isActive: true,
      email: 'lectadmin@test.com',
      department: departments[0]._id
    }),
    User.create({
      name: 'Bursary Admin',
      role: 'bursary_admin',
      staffId: 'BURS-4001',
      isActive: true,
      email: 'bursary@test.com'
    })
  ]);

  // Create test buildings (larger dataset)
  const buildings = [];
  for (let i = 0; i < 25; i++) {
    buildings.push(await Building.create({
      name: `Building ${i}`,
      department: departments[Math.floor(Math.random() * departments.length)].name,
      faculty: 'Science',
      latitude: 6.3300 + (Math.random() * 0.02),
      longitude: 5.6000 + (Math.random() * 0.02),
      photoURL: `https://example.com/building${i}.jpg`,
      description: `Test building number ${i}`,
      category: ['academic', 'administrative', 'library', 'facility'][Math.floor(Math.random() * 4)],
      isActive: true
    }));
  }

  // Create test courses (larger dataset)
  const courses = [];
  for (let i = 0; i < 30; i++) {
    const dept = departments[Math.floor(Math.random() * departments.length)];
    courses.push(await Course.create({
      code: `${dept.code}${100 + i}`,
      title: `Course ${i} in ${dept.name}`,
      description: `Description for course ${i}`,
      department: dept._id,
      faculty: dept.faculty,
      level: 100 + (i % 4) * 100,
      credit: 2 + (i % 4),
      isActive: true
    }));
  }

  // Create test news items
  const newsItems = [];
  for (let i = 0; i < 15; i++) {
    newsItems.push(await News.create({
      title: `News Item ${i}`,
      content: `Content for news item ${i}`,
      authorId: adminUsers[1]._id,
      audience: ['general', 'department', 'course'][Math.floor(Math.random() * 3)],
      department: departments[Math.floor(Math.random() * departments.length)]._id,
      active: true
    }));
  }

  // Generate tokens for test users
  testData = {
    departments,
    users: {
      students: users,
      staff: staffUsers,
      admins: adminUsers
    },
    buildings,
    courses,
    news: newsItems,
    tokens: {
      systemAdmin: null,
      deptAdmin: null,
      lecturerAdmin: null,
      bursaryAdmin: null,
      students: [],
      staff: []
    }
  };

  // Create JWT tokens for performance testing
  testData.tokens.systemAdmin = jwt.sign(
    {
      id: adminUsers[0]._id.toString(),
      role: adminUsers[0].role,
      name: adminUsers[0].name,
      displayId: adminUsers[0].displayId
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d', issuer: 'uniben-ai-assistant', audience: 'uniben-users' }
  );

  testData.tokens.deptAdmin = jwt.sign(
    {
      id: adminUsers[1]._id.toString(),
      role: adminUsers[1].role,
      name: adminUsers[1].name,
      displayId: adminUsers[1].displayId,
      department: adminUsers[1].department
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d', issuer: 'uniben-ai-assistant', audience: 'uniben-users' }
  );

  testData.tokens.lecturerAdmin = jwt.sign(
    {
      id: adminUsers[2]._id.toString(),
      role: adminUsers[2].role,
      name: adminUsers[2].name,
      displayId: adminUsers[2].displayId,
      department: adminUsers[2].department
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d', issuer: 'uniben-ai-assistant', audience: 'uniben-users' }
  );

  testData.tokens.bursaryAdmin = jwt.sign(
    {
      id: adminUsers[3]._id.toString(),
      role: adminUsers[3].role,
      name: adminUsers[3].name,
      displayId: adminUsers[3].displayId
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d', issuer: 'uniben-ai-assistant', audience: 'uniben-users' }
  );

  // Create tokens for students and staff
  testData.tokens.students = users.map(user => 
    jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
        displayId: user.displayId,
        department: user.department
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d', issuer: 'uniben-ai-assistant', audience: 'uniben-users' }
    )
  );

  testData.tokens.staff = staffUsers.map(user => 
    jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
        displayId: user.displayId,
        department: user.department
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d', issuer: 'uniben-ai-assistant', audience: 'uniben-users' }
    )
  );

  // Create guest token
  testData.tokens.guest = jwt.sign(
    {
      role: 'guest',
      isGuest: true,
      id: 'guest-user'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h', issuer: 'uniben-ai-assistant', audience: 'uniben-users' }
  );

  // Load the app after setup
  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Performance and Load Testing', () => {
  describe('Concurrent User Testing', () => {
    test('LOAD-001: Normal load simulation (50 concurrent users)', async () => {
      const startTime = Date.now();
      const concurrentRequests = 50;
      
      // Simulate mixed user types accessing various endpoints
      const requests = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        const userType = i % 4;
        let token, endpoint;
        
        switch (userType) {
          case 0: // Student
            token = testData.tokens.students[i % testData.tokens.students.length];
            endpoint = '/api/chat/message';
            requests.push(
              request(app)
                .post(endpoint)
                .set('Authorization', `Bearer ${token}`)
                .send({ message: `Hello from user ${i}` })
            );
            break;
          case 1: // Staff
            token = testData.tokens.staff[i % testData.tokens.staff.length];
            endpoint = '/api/admin/stats';
            requests.push(
              request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${token}`)
            );
            break;
          case 2: // Department Admin
            token = testData.tokens.deptAdmin;
            endpoint = '/api/admin/department/courses';
            requests.push(
              request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${token}`)
            );
            break;
          case 3: // System Admin
            token = testData.tokens.systemAdmin;
            endpoint = '/api/admin/buildings';
            requests.push(
              request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${token}`)
            );
            break;
        }
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Validate results
      let successCount = 0;
      let errorCount = 0;
      let responseTimeSum = 0;

      responses.forEach((response, index) => {
        if (response.status >= 200 && response.status < 300) {
          successCount++;
        } else {
          errorCount++;
        }
        responseTimeSum += response.responseTime || 0;
      });

      const avgResponseTime = responseTimeSum / responses.length;
      const successRate = (successCount / concurrentRequests) * 100;

      console.log(`Load Test Results:`, {
        totalRequests: concurrentRequests,
        successCount,
        errorCount,
        successRate: `${successRate.toFixed(2)}%`,
        totalTime: `${totalTime}ms`,
        avgResponseTime: `${avgResponseTime.toFixed(2)}ms`
      });

      expect(successRate).toBeGreaterThanOrEqual(95); // 95% success rate
      expect(totalTime).toBeLessThan(30000); // Less than 30 seconds total
      expect(avgResponseTime).toBeLessThan(5000); // Less than 5 seconds average
    });

    test('LOAD-002: Peak load simulation (100 concurrent users)', async () => {
      const startTime = Date.now();
      const concurrentRequests = 100;
      
      const requests = [];
      
      // Mix of different user activities
      for (let i = 0; i < concurrentRequests; i++) {
        const activity = i % 5;
        
        switch (activity) {
          case 0: // Chat messages
            const studentToken = testData.tokens.students[i % testData.tokens.students.length];
            requests.push(
              request(app)
                .post('/api/chat/message')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ message: `Performance test message ${i}` })
            );
            break;
          case 1: // Building queries
            const anyToken = i % 2 === 0 ? testData.tokens.students[i % testData.tokens.students.length] : testData.tokens.guest;
            requests.push(
              request(app)
                .get('/api/navigation/buildings')
                .set('Authorization', `Bearer ${anyToken}`)
            );
            break;
          case 2: // Admin statistics
            requests.push(
              request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
            );
            break;
          case 3: // Course queries
            requests.push(
              request(app)
                .get('/api/admin/courses')
                .set('Authorization', `Bearer ${testData.tokens.deptAdmin}`)
            );
            break;
          case 4: // News queries
            requests.push(
              request(app)
                .get('/api/news')
                .set('Authorization', `Bearer ${testData.tokens.students[i % testData.tokens.students.length]}`)
            );
            break;
        }
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      let successCount = 0;
      responses.forEach(response => {
        if (response.status >= 200 && response.status < 300) {
          successCount++;
        }
      });

      const successRate = (successCount / concurrentRequests) * 100;

      console.log(`Peak Load Test Results:`, {
        totalRequests: concurrentRequests,
        successCount,
        successRate: `${successRate.toFixed(2)}%`,
        totalTime: `${totalTime}ms`
      });

      expect(successRate).toBeGreaterThanOrEqual(90); // 90% success rate under peak load
      expect(totalTime).toBeLessThan(60000); // Less than 60 seconds total
    });
  });

  describe('Database Performance Testing', () => {
    test('DB-PERF-001: Complex query performance', async () => {
      const startTime = Date.now();
      
      // Complex query with joins and aggregations
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
        .expect(200);

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(queryTime).toBeLessThan(2000); // Less than 2 seconds for complex queries
    });

    test('DB-PERF-002: Concurrent database operations', async () => {
      const concurrentOps = 30;
      const startTime = Date.now();
      
      const operations = [];
      
      // Mix of read and write operations
      for (let i = 0; i < concurrentOps; i++) {
        if (i % 3 === 0) {
          // Read operation
          operations.push(
            request(app)
              .get('/api/admin/buildings')
              .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
          );
        } else if (i % 3 === 1) {
          // Another read operation
          operations.push(
            request(app)
              .get('/api/admin/courses')
              .set('Authorization', `Bearer ${testData.tokens.systemAdmin}`)
          );
        } else {
          // Write operation (chat message)
          operations.push(
            request(app)
              .post('/api/chat/message')
              .set('Authorization', `Bearer ${testData.tokens.students[i % testData.tokens.students.length]}`)
              .send({ message: `Database performance test ${i}` })
          );
        }
      }

      const responses = await Promise.all(operations);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      let successCount = 0;
      responses.forEach(response => {
        if (response.status >= 200 && response.status < 300) {
          successCount++;
        }
      });

      const successRate = (successCount / concurrentOps) * 100;

      console.log(`Database Performance Results:`, {
        totalOperations: concurrentOps,
        successCount,
        successRate: `${successRate.toFixed(2)}%`,
        totalTime: `${totalTime}ms`,
        avgTimePerOp: `${(totalTime / concurrentOps).toFixed(2)}ms`
      });

      expect(successRate).toBeGreaterThanOrEqual(95);
      expect(totalTime).toBeLessThan(15000); // Less than 15 seconds
    });
  });

  describe('Response Time Benchmarking', () => {
    const endpoints = [
      { path: '/api/navigation/buildings', method: 'GET', auth: 'student' },
      { path: '/api/admin/stats', method: 'GET', auth: 'systemAdmin' },
      { path: '/api/admin/courses', method: 'GET', auth: 'deptAdmin' },
      { path: '/api/chat/message', method: 'POST', auth: 'student', data: { message: 'Performance test' } }
    ];

    test('PERF-BENCH-001: Response time benchmarks for critical endpoints', async () => {
      const benchmarks = {};
      
      for (const endpoint of endpoints) {
        const times = [];
        const iterations = 10;
        
        for (let i = 0; i < iterations; i++) {
          const startTime = Date.now();
          
          let req = request(app)[endpoint.method.toLowerCase()](endpoint.path);
          
          // Add authentication
          switch (endpoint.auth) {
            case 'student':
              req = req.set('Authorization', `Bearer ${testData.tokens.students[0]}`);
              break;
            case 'systemAdmin':
              req = req.set('Authorization', `Bearer ${testData.tokens.systemAdmin}`);
              break;
            case 'deptAdmin':
              req = req.set('Authorization', `Bearer ${testData.tokens.deptAdmin}`);
              break;
          }
          
          // Add data if provided
          if (endpoint.data) {
            req = req.send(endpoint.data);
          }
          
          await req.expect(200);
          
          const endTime = Date.now();
          times.push(endTime - startTime);
        }
        
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        benchmarks[endpoint.path] = {
          avg: avgTime.toFixed(2),
          min: minTime,
          max: maxTime
        };
      }
      
      console.log('Response Time Benchmarks:', benchmarks);
      
      // Define acceptable response times
      const maxAcceptableTimes = {
        '/api/navigation/buildings': 1000,
        '/api/admin/stats': 2000,
        '/api/admin/courses': 1500,
        '/api/chat/message': 10000
      };
      
      for (const [path, times] of Object.entries(benchmarks)) {
        expect(parseFloat(times.avg)).toBeLessThan(maxAcceptableTimes[path]);
      }
    });
  });
});