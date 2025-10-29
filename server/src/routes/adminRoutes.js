const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Building = require('../models/Building');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const News = require('../models/News');
const Fees = require('../models/Fees');
const { authMiddleware } = require('../middleware/auth');
const {
  requireSystemAdmin,
  requireBursaryAdmin,
  requireDepartmentalAdmin,
  requireLecturerAdmin,
  requireStaffOrAdmin,
  filterDataByRole
} = require('../middleware/roleAuth');

// Apply authentication to all routes
router.use(authMiddleware);

// User Management Routes (System Admin only for full access)
router.get('/users', requireSystemAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-__v')
      .populate('department', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/users', requireSystemAdmin, async (req, res) => {
  try {
    const { name, matricNumber, staffId, role, email, department, courses } = req.body;

    // Validate required fields
    if (!name || !role) {
      return res.status(400).json({ success: false, message: 'Name and role are required' });
    }

    // Validate admin roles can only be assigned by system admin
    const adminRoles = ['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin'];
    if (adminRoles.includes(role) && req.user.role !== 'system_admin') {
      return res.status(403).json({ success: false, message: 'Only system admin can create admin accounts' });
    }

    // Validate role-specific requirements
    if (role === 'student' && !matricNumber) {
      return res.status(400).json({ success: false, message: 'Matriculation number is required for students' });
    }
    if ((role === 'staff' || adminRoles.includes(role)) && !staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required for staff members and admins' });
    }

    // Check for existing user
    if (role === 'student' && matricNumber) {
      const existing = await User.findOne({ matricNumber });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Matric number already exists' });
      }
    }

    if ((role === 'staff' || adminRoles.includes(role)) && staffId) {
      const existing = await User.findOne({ staffId });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Staff ID already exists' });
      }
    }

    const user = new User({ name, matricNumber, staffId, role, email, department, courses });
    await user.save();
    await user.populate('department', 'name');

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

router.put('/users/:id', requireSystemAdmin, async (req, res) => {
  try {
    const { name, matricNumber, staffId, role, email, department, courses } = req.body;

    // Prevent changing system admin role unless current user is system admin
    if (role === 'system_admin' && req.user.role !== 'system_admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify system admin role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, matricNumber, staffId, role, email, department, courses },
      { new: true }
    ).populate('department', 'name');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/users/:id', requireSystemAdmin, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting system admin accounts
    if (userToDelete.role === 'system_admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete system admin accounts' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Building Management Routes
router.get('/buildings', async (req, res) => {
  try {
    const buildings = await Building.find().populate('department', 'name').sort({ name: 1 });
    res.json({ success: true, buildings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/buildings', async (req, res) => {
  try {
    const building = new Building(req.body);
    await building.save();
    await building.populate('department', 'name');
    res.status(201).json({ success: true, building });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/buildings/:id', async (req, res) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('department', 'name');
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }
    res.json({ success: true, building });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/buildings/:id', async (req, res) => {
  try {
    const building = await Building.findByIdAndDelete(req.params.id);
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }
    res.json({ success: true, message: 'Building deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Department Management Routes (System Admin only)
router.get('/departments', requireSystemAdmin, async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('departmentalAdmin', 'name staffId')
      .sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/departments', requireSystemAdmin, async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    await department.populate('departmentalAdmin', 'name staffId');
    res.status(201).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/departments/:id', requireSystemAdmin, async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('departmentalAdmin', 'name staffId');
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/departments/:id', requireSystemAdmin, async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Course Management Routes (role-based access)
router.get('/courses', async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    // Filter courses based on role
    if (user.role === 'departmental_admin') {
      // Departmental admin sees courses in their department
      query.department = user.department;
    } else if (user.role === 'lecturer_admin') {
      // Lecturer admin sees only their courses
      query.lecturerId = user._id;
    }
    // System admin and bursary admin see all courses

    const courses = await Course.find(query)
      .populate('department', 'name')
      .populate('lecturerId', 'name staffId')
      .populate('prerequisites', 'code title')
      .sort({ code: 1 });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const user = req.user;

    // Check permissions
    if (user.role === 'departmental_admin') {
      // Departmental admin can only create courses in their department
      if (req.body.department !== user.department?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only create courses in your department'
        });
      }
    } else if (user.role === 'lecturer_admin') {
      // Lecturer admin can only create courses they teach
      if (req.body.lecturerId !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only create courses you teach'
        });
      }
    } else if (!['system_admin', 'bursary_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create courses'
      });
    }

    const course = new Course(req.body);
    await course.save();
    await course.populate(['department', 'lecturerId', 'prerequisites']);
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const user = req.user;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check permissions
    if (user.role === 'departmental_admin') {
      if (course.department.toString() !== user.department?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit courses in your department'
        });
      }
    } else if (user.role === 'lecturer_admin') {
      if (course.lecturerId?.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit courses you teach'
        });
      }
    } else if (!['system_admin', 'bursary_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to edit courses'
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate(['department', 'lecturerId', 'prerequisites']);
    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    const user = req.user;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check permissions
    if (user.role === 'departmental_admin') {
      if (course.department.toString() !== user.department?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete courses in your department'
        });
      }
    } else if (user.role === 'lecturer_admin') {
      if (course.lecturerId?.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete courses you teach'
        });
      }
    } else if (!['system_admin', 'bursary_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete courses'
      });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Quiz Management Routes
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('course', 'code name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/quizzes', async (req, res) => {
  try {
    const quiz = new Quiz({
      ...req.body,
      createdBy: req.user.id
    });
    await quiz.save();
    await quiz.populate(['course', 'createdBy']);
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate(['course', 'createdBy']);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dashboard Stats (role-based)
router.get('/stats', async (req, res) => {
  try {
    const user = req.user;
    let stats = {};

    // Basic stats available to all staff/admins
    const [userCount, buildingCount, departmentCount, courseCount, quizCount, newsCount] = await Promise.all([
      User.countDocuments(),
      Building.countDocuments(),
      Department.countDocuments(),
      Course.countDocuments(),
      Quiz.countDocuments(),
      News.countDocuments({ active: true })
    ]);

    stats = {
      users: userCount,
      buildings: buildingCount,
      departments: departmentCount,
      courses: courseCount,
      quizzes: quizCount,
      news: newsCount
    };

    // Bursary admin additional stats
    if (user.role === 'bursary_admin' || user.role === 'system_admin') {
      const feesStats = await Fees.getPaymentStats();
      if (feesStats.length > 0) {
        stats.feesCollected = feesStats[0].totalPaid || 0;
        stats.totalOutstanding = feesStats[0].totalBalance || 0;
        stats.fullyPaidStudents = feesStats[0].fullyPaid || 0;
      }
    }

    // Departmental admin stats for their department
    if (user.role === 'departmental_admin') {
      const deptUsers = await User.countDocuments({ department: user.department });
      const deptCourses = await Course.countDocuments({ department: user.department });
      stats.departmentUsers = deptUsers;
      stats.departmentCourses = deptCourses;
    }

    // Lecturer admin stats for their courses
    if (user.role === 'lecturer_admin') {
      const lecturerCourses = user.courses || [];
      const courseStudents = await Course.find({ _id: { $in: lecturerCourses } }).select('students');
      const totalStudents = courseStudents.reduce((sum, course) => sum + (course.students?.length || 0), 0);
      stats.myCourses = lecturerCourses.length;
      stats.myStudents = totalStudents;
    }

    res.json({
      success: true,
      stats,
      userRole: user.role
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;