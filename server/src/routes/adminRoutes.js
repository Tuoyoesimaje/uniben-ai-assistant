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

// System admin routes (users, departments) are split into a sub-router for clarity.
// We mount the same router at both the root (legacy) and '/system' so existing client calls keep working.
router.use('/', require('./systemAdminRoutes'));
router.use('/system', require('./systemAdminRoutes'));
// Role-specific route groups (mounted for clarity and gradual migration)
router.use('/department', require('./departmentAdminRoutes'));
router.use('/lecturer', require('./lecturerAdminRoutes'));
router.use('/bursary', require('./bursaryAdminRoutes'));

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
const courseService = require('../services/courseService');

router.get('/courses', async (req, res) => {
  try {
    const user = req.user;
    let courses = [];

    if (user.role === 'system_admin' || user.role === 'bursary_admin' || user.role === 'staff') {
      courses = await courseService.findCoursesForSystemAdmin();
    } else if (user.role === 'departmental_admin') {
      // Departmental admin: use department-specific route /api/admin/department/courses
      courses = await courseService.findCoursesForDepartment(user.department);
    } else if (user.role === 'lecturer_admin') {
      courses = await courseService.findCoursesForLecturer(user._id);
    } else {
      courses = await courseService.findCoursesForSystemAdmin();
    }

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/courses', async (req, res) => {
  try {
    console.log('Create course request body:', JSON.stringify(req.body).slice(0, 1000));
    const user = req.user;

    // Check permissions based on course management flow
    if (user.role === 'system_admin') {
      // System admin can create global courses
      // No restrictions - creates the base course template
    } else if (user.role === 'departmental_admin') {
      // Departmental admins should add offerings to existing base courses via PUT
      // Creating duplicate Course documents for an offering causes code collisions and
      // maintenance confusion. Instruct to use the PUT /courses/:id endpoint which
      // correctly appends a departments_offering subdocument to the base course.
      return res.status(400).json({
        success: false,
        message: 'Departmental admins must add offerings to an existing course via PUT /api/admin/courses/:courseId. Please use the department offerings flow.'
      });
    } else if (user.role === 'lecturer_admin') {
      // Lecturer admin cannot create courses
      return res.status(403).json({
        success: false,
        message: 'Lecturer admins cannot create courses. Contact your departmental admin.'
      });
    } else if (!['system_admin', 'bursary_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create courses'
      });
    }

    // Create a working copy of the request body to avoid modifying the original
    const courseData = { ...req.body };

    // Handle departments_offering: normalize to proper object format
    if (Array.isArray(courseData.departments_offering) && courseData.departments_offering.length > 0) {
      const normalized = courseData.departments_offering.map(item => {
        if (!item) return null;
        if (typeof item === 'string' || typeof item === 'number') {
          // Default level for department offerings if not specified
          return {
            department: item,
            level: 100,
            isActive: true
          };
        }
        return {
          department: item.department || item.departmentId || null,
          level: item.level || 100,
          lecturerId: item.lecturerId || item.lecturer || null,
          schedule: item.schedule || null,
          semester: item.semester || 'both',
          isActive: item.isActive !== undefined ? item.isActive : true
        };
      }).filter(Boolean);
      courseData.departments_offering = normalized;
    }

    // If the request is from a departmental admin, set assignedBy and offeredAt for offerings from their department
    if (user.role === 'departmental_admin' && Array.isArray(courseData.departments_offering)) {
      courseData.departments_offering = courseData.departments_offering.map(off => {
        try {
          const deptId = off.department?.toString ? off.department.toString() : String(off.department);
          if (deptId === (user.department?.toString ? user.department.toString() : String(user.department))) {
            return {
              ...off,
              assignedBy: req.user._id,
              offeredAt: off.offeredAt || new Date(),
              isActive: off.isActive !== undefined ? off.isActive : true
            };
          }
        } catch (e) {
          // fallback: leave off unchanged
        }
        return off;
      });
    }

    // Set department from first offering if not provided
    if (!courseData.department && Array.isArray(courseData.departments_offering) && courseData.departments_offering.length > 0) {
      const firstOffering = courseData.departments_offering[0];
      if (firstOffering && firstOffering.department) {
        courseData.department = firstOffering.department;
      }
    }

    // Convert string numbers to actual numbers
    if (courseData.credit) courseData.credit = Number(courseData.credit);
    if (courseData.level) courseData.level = Number(courseData.level);

    // Handle prerequisites and corequisites (ensure they are arrays of strings)
    if (typeof courseData.prerequisites === 'string') {
      courseData.prerequisites = courseData.prerequisites.split(',').map(p => p.trim()).filter(p => p);
    }
    if (typeof courseData.corequisites === 'string') {
      courseData.corequisites = courseData.corequisites.split(',').map(c => c.trim()).filter(c => c);
    }

    // Set default level if not provided
    if (!courseData.level) {
      courseData.level = 100;
    }

    // Validate required fields
    if (!courseData.department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required. Please select a department that will offer this course.'
      });
    }

    if (!courseData.credit || courseData.credit < 1 || courseData.credit > 6) {
      return res.status(400).json({
        success: false,
        message: 'Credit hours must be between 1 and 6.'
      });
    }

    console.log('Processing course data:', JSON.stringify(courseData, null, 2));

    const course = new Course(courseData);
    await course.save();
    await course.populate(['department', 'departments_offering.department', 'departments_offering.lecturerId', 'prerequisites']);
    
    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const user = req.user;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check permissions based on course management flow
    if (user.role === 'system_admin') {
      // System admin can edit global course details
      const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate(['department', 'departments_offering.department', 'departments_offering.lecturerId', 'prerequisites']);
      res.json({ success: true, course: updatedCourse });
    // Departmental admin handlers have been migrated to the role-specific
    // router mounted at /api/admin/department. Departmental admins should call
    // PUT /api/admin/department/courses/:id to add or modify offerings. The
    // legacy departmental logic has been removed to centralize role routes.
    } else if (user.role === 'lecturer_admin') {
      // Lecturer admin can only update their assigned course offerings
      const userOffering = course.departments_offering?.find(offering =>
        offering.lecturerId?.toString() === user._id.toString()
      );

      if (!userOffering) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit courses you are assigned to teach'
        });
      }

      // Allow updates to syllabus, announcements, resources, etc. for their specific offering
      const { syllabus, announcements, resources, ...otherUpdates } = req.body;

      const updatedCourse = await Course.findByIdAndUpdate(req.params.id, {
        syllabus, announcements, resources, ...otherUpdates
      }, { new: true })
        .populate(['department', 'departments_offering.department', 'departments_offering.lecturerId', 'prerequisites']);

      res.json({ success: true, course: updatedCourse });
    } else if (!['system_admin', 'bursary_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to edit courses'
      });
    }
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

    // Check permissions based on course management flow
    if (user.role === 'system_admin') {
      // System admin can delete any course
    } else if (user.role === 'departmental_admin') {
      // Departmental admins should use the department-specific delete endpoint:
      // DELETE /api/admin/department/courses/:id
      return res.status(400).json({ success: false, message: 'Departmental admins must delete courses via /api/admin/department/courses/:id' });
    } else if (user.role === 'lecturer_admin') {
      if (course.lecturerId?.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete courses you are assigned to teach'
        });
      }
      // Lecturer admin can only delete their own assigned courses
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

    // Departmental admin stats have been moved to the department-specific router:
    // GET /api/admin/department/stats
    if (user.role === 'departmental_admin') {
      return res.status(400).json({ success: false, message: 'Departmental stats available at /api/admin/department/stats' });
    }

    // Lecturer admin stats for their assigned course offerings
    if (user.role === 'lecturer_admin') {
      const lecturerOfferings = await Course.find({
        departments_offering: {
          $elemMatch: { lecturerId: user._id }
        }
      });

      const totalStudents = lecturerOfferings.reduce((sum, course) => {
        const userOffering = course.departments_offering?.find(offering =>
          offering.lecturerId?.toString() === user._id.toString()
        );
        return sum + (userOffering?.students?.length || 0);
      }, 0);

      stats.myCourses = lecturerOfferings.length;
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