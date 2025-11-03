const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let app;
beforeAll(async () => {
  // Use local MongoDB for tests if MONGODB_URI isn't provided
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniben-assistant-test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

  // Connect mongoose using existing connectDB util
  const connectDB = require('../src/config/database');
  await connectDB();

  // Ensure a clean database for tests
  await mongoose.connection.db.dropDatabase();

  // Require models after DB is connected
  const Department = require('../src/models/Department');
  const User = require('../src/models/User');

  // Create a department and users to use in tests
  const dept = await Department.create({ name: 'Computer Science', code: 'CSC', faculty: 'Science', hodName: 'Dr. HOD' });
  // Make department available to tests
  global.__TEST_DEPT = dept;

  // Create a system admin user
  const sysAdmin = await User.create({ name: 'Sys Admin', role: 'system_admin', staffId: 'SYSADMIN-001', email: 'sys@local.com' });
  // Create departmental admin user
  const deptAdmin = await User.create({ name: 'Dept Admin', role: 'departmental_admin', staffId: 'STAFF-0001', email: 'dept@local.com', department: dept._id });

  // Create tokens
  process.env.TEST_SYS_TOKEN = jwt.sign({ _id: sysAdmin._id.toString(), role: sysAdmin.role, department: sysAdmin.department }, process.env.JWT_SECRET);
  process.env.TEST_DEPT_TOKEN = jwt.sign({ _id: deptAdmin._id.toString(), role: deptAdmin.role, department: deptAdmin.department?.toString() || dept._id.toString() }, process.env.JWT_SECRET);

  // Require the app (after setting env and DB)
  app = require('../src/server');
});

afterAll(async () => {
  // Close mongoose connection
  await mongoose.disconnect();
});

describe('Course offering traceability', () => {
  test('departmental admin create offering should set assignedBy and offeredAt', async () => {
    // 1. Create a base course as system admin
    const baseCoursePayload = {
      code: 'CSC101',
      title: 'Intro to CS',
      description: 'Basics',
      department: global.__TEST_DEPT._id,
      faculty: 'Science',
      level: 100,
      credit: 3
    };

    const sysRes = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${process.env.TEST_SYS_TOKEN}`)
      .send(baseCoursePayload)
      .expect(201);

    expect(sysRes.body.success).toBe(true);
    const baseCourse = sysRes.body.course;

    // 2. Department admin adds an offering to the base course via PUT (recommended flow)
    const decodedDeptToken = jwt.verify(process.env.TEST_DEPT_TOKEN, process.env.JWT_SECRET);
    const updatePayload = {
      departments_offering: [
        {
          department: global.__TEST_DEPT._id,
          level: 200,
          lecturerId: decodedDeptToken._id,
          semester: 'first'
        }
      ]
    };

    const deptRes = await request(app)
      .put(`/api/admin/department/courses/${baseCourse._id}`)
      .set('Authorization', `Bearer ${process.env.TEST_DEPT_TOKEN}`)
      .send(updatePayload);
  expect(deptRes.body.success).toBe(true);
    const updated = deptRes.body.course;

    // The updated course should now contain the new offering with assignedBy and offeredAt
    expect(Array.isArray(updated.departments_offering)).toBe(true);
    const deptId = global.__TEST_DEPT._id.toString();
    const added = updated.departments_offering.find(o => {
      if (!o.department) return false;
      // department may be populated (object) or an ObjectId string
      if (o.department._id) return o.department._id.toString() === deptId;
      if (typeof o.department.toString === 'function') return o.department.toString() === deptId;
      return false;
    });
    expect(added).toBeDefined();
    expect(added.assignedBy).toBeDefined();
    expect(added.offeredAt).toBeDefined();

    const decoded = jwt.verify(process.env.TEST_DEPT_TOKEN, process.env.JWT_SECRET);
    expect(added.assignedBy.toString()).toBe(decoded._id.toString());
  });
});
