const User = require('../models/User');

// Middleware to require specific admin roles
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or deactivated'
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions for this action'
        });
      }

      req.user = user; // Attach full user object
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

// Specific role requirements
const requireSystemAdmin = requireRole(['system_admin']);
const requireBursaryAdmin = requireRole(['system_admin', 'bursary_admin']);
const requireDepartmentalAdmin = requireRole(['system_admin', 'departmental_admin']);
const requireLecturerAdmin = requireRole(['system_admin', 'departmental_admin', 'lecturer_admin']);
const requireStaffOrAdmin = requireRole(['system_admin', 'bursary_admin', 'departmental_admin', 'lecturer_admin', 'staff']);

// Middleware to check if user can access specific department data
const requireDepartmentAccess = async (req, res, next) => {
  try {
    const user = req.user;
    const departmentId = req.params.departmentId || req.body.departmentId || req.query.departmentId;

    if (!departmentId) {
      return next(); // No department specified, continue
    }

    // System admin can access all departments
    if (user.role === 'system_admin') {
      return next();
    }

    // Departmental admin can only access their own department
    if (user.role === 'departmental_admin') {
      if (user.department && user.department.toString() === departmentId.toString()) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'You can only access your assigned department'
      });
    }

    // Other roles cannot access department-specific data
    return res.status(403).json({
      success: false,
      message: 'Access denied to department data'
    });
  } catch (error) {
    console.error('Department access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Department access check failed'
    });
  }
};

// Middleware to check if user can access specific course data
const requireCourseAccess = async (req, res, next) => {
  try {
    const user = req.user;
    const courseId = req.params.courseId || req.body.courseId || req.query.courseId;

    if (!courseId) {
      return next(); // No course specified, continue
    }

    // System admin can access all courses
    if (user.role === 'system_admin') {
      return next();
    }

    // Lecturer admin can only access their own courses
    if (user.role === 'lecturer_admin') {
      if (user.courses && user.courses.includes(courseId)) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'You can only access your assigned courses'
      });
    }

    // Departmental admin can access courses in their department
    if (user.role === 'departmental_admin') {
      const Course = require('../models/Course');
      const course = await Course.findById(courseId);
      if (course && course.department.toString() === user.department?.toString()) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'You can only access courses in your department'
      });
    }

    // Other roles cannot access course-specific data
    return res.status(403).json({
      success: false,
      message: 'Access denied to course data'
    });
  } catch (error) {
    console.error('Course access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Course access check failed'
    });
  }
};

// Middleware to check if student can access their own financial data
const requireOwnFinancialData = async (req, res, next) => {
  try {
    const user = req.user;
    const studentId = req.params.studentId || req.body.studentId || req.query.studentId;

    // Bursary admin and system admin can access all financial data
    if (['system_admin', 'bursary_admin'].includes(user.role)) {
      return next();
    }

    // Students can only access their own data
    if (user.role === 'student') {
      if (user._id.toString() === studentId.toString()) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'You can only access your own financial information'
      });
    }

    // Other roles cannot access financial data
    return res.status(403).json({
      success: false,
      message: 'Access denied to financial data'
    });
  } catch (error) {
    console.error('Financial data access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Financial data access check failed'
    });
  }
};

// Middleware to filter data based on user role
const filterDataByRole = (dataType) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Add role-based filtering logic here
      req.filterOptions = {
        userRole: user.role,
        userId: user._id,
        departmentId: user.department,
        courseIds: user.courses || []
      };

      next();
    } catch (error) {
      console.error('Data filtering setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Data filtering setup failed'
      });
    }
  };
};

module.exports = {
  requireSystemAdmin,
  requireBursaryAdmin,
  requireDepartmentalAdmin,
  requireLecturerAdmin,
  requireStaffOrAdmin,
  requireDepartmentAccess,
  requireCourseAccess,
  requireOwnFinancialData,
  filterDataByRole,
  requireRole
};