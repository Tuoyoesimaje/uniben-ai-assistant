const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Building = require('../models/Building');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const { authMiddleware, requireStaff } = require('../middleware/auth');

// Apply auth and staff middleware to all routes
router.use(authMiddleware);
router.use(requireStaff);

// User Management Routes
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, matricNumber, staffId, role, email } = req.body;

    // Validate required fields
    if (!name || !role) {
      return res.status(400).json({ success: false, message: 'Name and role are required' });
    }

    // Validate role-specific requirements
    if (role === 'student' && !matricNumber) {
      return res.status(400).json({ success: false, message: 'Matriculation number is required for students' });
    }
    if (role === 'staff' && !staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required for staff members' });
    }

    // Check for existing user
    if (role === 'student' && matricNumber) {
      const existing = await User.findOne({ matricNumber });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Matric number already exists' });
      }
    }

    if (role === 'staff' && staffId) {
      const existing = await User.findOne({ staffId });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Staff ID already exists' });
      }
    }

    const user = new User({ name, matricNumber, staffId, role, email });
    await user.save();

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, matricNumber, staffId, role, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, matricNumber, staffId, role, email },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
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

// Department Management Routes
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/departments', async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, department });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/departments/:id', async (req, res) => {
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

// Course Management Routes
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('department', 'name')
      .populate('prerequisites', 'code name')
      .sort({ code: 1 });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    await course.populate(['department', 'prerequisites']);
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate(['department', 'prerequisites']);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
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

// Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const [userCount, buildingCount, departmentCount, courseCount, quizCount] = await Promise.all([
      User.countDocuments(),
      Building.countDocuments(),
      Department.countDocuments(),
      Course.countDocuments(),
      Quiz.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        users: userCount,
        buildings: buildingCount,
        departments: departmentCount,
        courses: courseCount,
        quizzes: quizCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;