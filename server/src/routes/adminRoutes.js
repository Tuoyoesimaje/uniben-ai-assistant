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
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
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
    if (user.role === 'system_admin') {
      // System admin sees all global courses
      // No filter - sees all courses
    } else if (user.role === 'departmental_admin') {
      // Departmental admin sees courses offered by their department (owned + borrowed)
      query.$or = [
        { department: user.department }, // Own courses
        { departments_offering: user.department } // Borrowed courses
      ];
    } else if (user.role === 'lecturer_admin') {
      // Lecturer admin sees courses they are assigned to teach
      query.departments_offering = {
        $elemMatch: { lecturerId: user._id }
      };
    }
    // Bursary admin and staff see all courses

    const courses = await Course.find(query)
      .populate('department', 'name')
      .populate('departments_offering.department', 'name')
      .populate('departments_offering.lecturerId', 'name staffId')
      .populate('prerequisites', 'code title')
      .sort({ code: 1 });
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
      // Departmental admin creates course offerings from existing courses
      const { courseId, level, lecturerId, schedule, semester, venue, maxStudents } = req.body;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      // Find the base course
      const baseCourse = await Course.findById(courseId);
      if (!baseCourse) {
        return res.status(404).json({
          success: false,
          message: 'Base course not found'
        });
      }

      // Create a new course offering (duplicate of base course with department-specific data)
      const courseOffering = new Course({
        code: baseCourse.code,
        title: baseCourse.title,
        description: baseCourse.description,
        department: user.department, // This department is offering it
        faculty: baseCourse.faculty,
        level: level,
        credit: baseCourse.credit,
        semester: semester || baseCourse.semester,
        prerequisites: baseCourse.prerequisites,
        corequisites: baseCourse.corequisites,
        lecturerId: lecturerId,
        schedule: schedule,
        // Additional offering-specific fields
        venue: venue,
        maxStudents: maxStudents,
        // Mark this as an offering of the base course
        baseCourseId: courseId
      });

      await courseOffering.save();
      await courseOffering.populate(['department', 'lecturerId', 'prerequisites']);
      return res.status(201).json({ success: true, course: courseOffering });

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

    // Normalize departments_offering: allow array of department IDs (legacy) or objects
    if (Array.isArray(req.body.departments_offering) && req.body.departments_offering.length > 0) {
      const normalized = req.body.departments_offering.map(item => {
        if (!item) return null;
        if (typeof item === 'string' || typeof item === 'number') {
          return { department: item };
        }
        // already an object - keep only known fields
        return {
          department: item.department || item.departmentId || null,
          level: item.level || null,
          lecturerId: item.lecturerId || item.lecturer || null,
          schedule: item.schedule || null,
          semester: item.semester || 'both',
          isActive: item.isActive !== undefined ? item.isActive : true
        };
      }).filter(Boolean);
      req.body.departments_offering = normalized;
    }

    // If no owning department provided but department offerings exist,
    // use the first offering's department as the owning department to satisfy model requirement.
    if (!req.body.department && Array.isArray(req.body.departments_offering) && req.body.departments_offering.length > 0) {
      const firstOffering = req.body.departments_offering[0];
      if (firstOffering && firstOffering.department) {
        req.body.department = firstOffering.department;
      }
    }

    // Ensure numeric fields are numbers
    if (req.body.credit) req.body.credit = Number(req.body.credit);
    if (req.body.level) req.body.level = Number(req.body.level);

    // Provide sensible defaults so system admin can create global course templates without specifying a level
    if (!req.body.level) {
      // try to derive from first offering
      const firstOfferingLevel = req.body.departments_offering && req.body.departments_offering[0] && req.body.departments_offering[0].level;
      req.body.level = firstOfferingLevel ? Number(firstOfferingLevel) : 100; // default to 100
    }

    if (!req.body.department) {
      return res.status(400).json({ success: false, message: 'Owning department is required (provide department or departments_offering)' });
    }

    const course = new Course(req.body);
    await course.save();
    await course.populate(['department', 'departments_offering.department', 'departments_offering.lecturerId', 'prerequisites']);
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

    // Check permissions based on course management flow
    if (user.role === 'system_admin') {
      // System admin can edit global course details
      const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .populate(['department', 'departments_offering.department', 'departments_offering.lecturerId', 'prerequisites']);
      res.json({ success: true, course: updatedCourse });
    } else if (user.role === 'departmental_admin') {
      // Departmental admin can add/modify offerings for their department
      const { departments_offering, ...otherUpdates } = req.body;

      if (departments_offering) {
        // Validate that all offerings are for their department
        const invalidOfferings = departments_offering.filter(offering =>
          offering.department.toString() !== user.department?.toString()
        );

        if (invalidOfferings.length > 0) {
          return res.status(403).json({
            success: false,
            message: 'You can only manage offerings for your department'
          });
        }

        // Add or update department offerings
        const updatedOfferings = [...(course.departments_offering || [])];

        departments_offering.forEach(newOffering => {
          const existingIndex = updatedOfferings.findIndex(offering =>
            offering.department.toString() === newOffering.department &&
            offering.level === newOffering.level
          );

          if (existingIndex >= 0) {
            // Update existing offering
            updatedOfferings[existingIndex] = { ...updatedOfferings[existingIndex], ...newOffering };
          } else {
            // Add new offering
            updatedOfferings.push(newOffering);
          }
        });

        const updatedCourse = await Course.findByIdAndUpdate(
          req.params.id,
          { departments_offering: updatedOfferings, ...otherUpdates },
          { new: true }
        ).populate(['department', 'departments_offering.department', 'departments_offering.lecturerId', 'prerequisites']);

        res.json({ success: true, course: updatedCourse });
      } else {
        // Regular update for other fields
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
          .populate(['department', 'departments_offering.department', 'departments_offering.lecturerId', 'prerequisites']);
        res.json({ success: true, course: updatedCourse });
      }
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
      if (course.department.toString() !== user.department?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete courses in your department'
        });
      }
      // Departmental admin can delete courses in their department
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

    // Departmental admin stats for their department
    if (user.role === 'departmental_admin') {
      const deptUsers = await User.countDocuments({ department: user.department });
      const deptCourses = await Course.findOfferedByDepartment(user.department);
      stats.departmentUsers = deptUsers;
      stats.departmentCourses = deptCourses.length;
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