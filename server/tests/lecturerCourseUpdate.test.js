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

  // Create department
  const dept = await Department.create({ name: 'Chemistry', code: 'CHM', faculty: 'Science', hodName: 'Dr. HOD CHM' });
  global.__TEST_DEPT = dept;

  // Create lecturer who will be assigned
  const lecturer = await User.create({ name: 'Lecturer One', role: 'lecturer_admin', staffId: 'STAFF-3001', email: 'lect1@local.com', department: dept._id });
  // Create another lecturer who will NOT be assigned
  const otherLecturer = await User.create({ name: 'Lecturer Two', role: 'lecturer_admin', staffId: 'STAFF-3002', email: 'lect2@local.com', department: dept._id });

  // Create system admin to create the base course
  const sysAdmin = await User.create({ name: 'Sys Admin', role: 'system_admin', staffId: 'SYSADMIN-001', email: 'sys@local.com' });

  // Create departmental admin to add offering
  const deptAdmin = await User.create({ name: 'Dept Admin', role: 'departmental_admin', staffId: 'STAFF-3000', email: 'dept@local.com', department: dept._id });

  // Tokens
  process.env.TEST_SYS_TOKEN = jwt.sign({ _id: sysAdmin._id.toString(), role: sysAdmin.role }, process.env.JWT_SECRET);
  process.env.TEST_DEPT_TOKEN = jwt.sign({ _id: deptAdmin._id.toString(), role: deptAdmin.role, department: dept._id.toString() }, process.env.JWT_SECRET);
  process.env.TEST_LECT_TOKEN = jwt.sign({ _id: lecturer._id.toString(), role: lecturer.role, department: dept._id.toString() }, process.env.JWT_SECRET);
  process.env.TEST_OTHER_LECT_TOKEN = jwt.sign({ _id: otherLecturer._id.toString(), role: otherLecturer.role, department: dept._id.toString() }, process.env.JWT_SECRET);

  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Lecturer course update', () => {
  test('Assigned lecturer can update announcements; unassigned cannot', async () => {
    // 1. System admin creates base course
    const baseCoursePayload = {
      code: 'CHM101',
      title: 'Intro to Chemistry',
      description: 'Basics of chemistry',
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

    const baseCourse = sysRes.body.course;

    // 2. Department admin adds an offering assigned to lecturer
    const updatePayload = {
      departments_offering: [
        {
          department: global.__TEST_DEPT._id,
          level: 100,
          lecturerId: jwt.verify(process.env.TEST_LECT_TOKEN, process.env.JWT_SECRET)._id,
          semester: 'first'
        }
      ]
    };

    const deptRes = await request(app)
      .put(`/api/admin/department/courses/${baseCourse._id}`)
      .set('Authorization', `Bearer ${process.env.TEST_DEPT_TOKEN}`)
      .send(updatePayload)
      .expect(200);

    expect(deptRes.body.success).toBe(true);

    // 3. Assigned lecturer attempts to update announcements
    const announcementPayload = {
      announcements: [
        { title: 'Welcome', content: 'Welcome to CHM101', createdAt: new Date().toISOString() }
      ]
    };

    const lectRes = await request(app)
      .put(`/api/admin/lecturer/courses/${baseCourse._id}`)
      .set('Authorization', `Bearer ${process.env.TEST_LECT_TOKEN}`)
      .send(announcementPayload)
      .expect(200);

  expect(lectRes.body.success).toBe(true);
  expect(Array.isArray(lectRes.body.course.announcements)).toBe(true);
  expect(lectRes.body.course.announcements[0].content).toBe('Welcome to CHM101');

    // 4. Unassigned lecturer attempts same update and should get 403
    const otherRes = await request(app)
      .put(`/api/admin/lecturer/courses/${baseCourse._id}`)
      .set('Authorization', `Bearer ${process.env.TEST_OTHER_LECT_TOKEN}`)
      .send({ announcements: [{ title: 'No', content: 'I am not assigned' }] })
      .expect(403);

    expect(otherRes.body.success).toBe(false);
  });
});
