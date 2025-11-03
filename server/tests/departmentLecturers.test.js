const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let app;
beforeAll(async () => {
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniben-assistant-test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

  const connectDB = require('../src/config/database');
  await connectDB();

  await mongoose.connection.db.dropDatabase();

  const Department = require('../src/models/Department');
  const User = require('../src/models/User');

  const dept = await Department.create({ name: 'Physics', code: 'PHY', faculty: 'Science', hodName: 'Dr. HOD PHY' });
  global.__TEST_DEPT = dept;

  // Create two lecturers: one in this department, one in another
  const otherDept = await Department.create({ name: 'Mathematics', code: 'MTH', faculty: 'Science', hodName: 'Dr. HOD MTH' });

  const lecturerInDept = await User.create({ name: 'Lecturer A', role: 'lecturer_admin', staffId: 'STAFF-1001', email: 'lectA@local.com', department: dept._id });
  const lecturerOther = await User.create({ name: 'Lecturer B', role: 'lecturer_admin', staffId: 'STAFF-1002', email: 'lectB@local.com', department: otherDept._id });

  // Create departmental admin
  const deptAdmin = await User.create({ name: 'Dept Admin', role: 'departmental_admin', staffId: 'STAFF-2000', email: 'dept@local.com', department: dept._id });

  process.env.TEST_DEPT_TOKEN = jwt.sign({ _id: deptAdmin._id.toString(), role: deptAdmin.role, department: deptAdmin.department?.toString() || dept._id.toString() }, process.env.JWT_SECRET);

  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Department lecturers endpoint', () => {
  test('GET /api/admin/department/lecturers returns only lecturers in the admin department', async () => {
    const res = await request(app)
      .get('/api/admin/department/lecturers')
      .set('Authorization', `Bearer ${process.env.TEST_DEPT_TOKEN}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.lecturers)).toBe(true);
    // Should contain only one lecturer (Lecturer A)
    expect(res.body.lecturers.length).toBe(1);
  expect(res.body.lecturers[0].email.toLowerCase()).toBe('lecta@local.com');
  });
});
