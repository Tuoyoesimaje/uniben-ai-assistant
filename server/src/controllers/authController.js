const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      displayId: user.displayId,
      department: user.department,
      courses: user.courses
    },
    process.env.JWT_SECRET,
    {
      expiresIn: user.role === 'guest' ? '24h' : '7d',
      issuer: 'uniben-ai-assistant',
      audience: 'uniben-users'
    }
  );
};

// Login student
exports.loginStudent = async (req, res) => {
  try {
    const { matricNumber } = req.body;

    // Validate input
    if (!matricNumber) {
      return res.status(400).json({
        success: false,
        message: 'Matriculation number is required'
      });
    }

    // Find student
    const user = await User.findOne({
      matricNumber: matricNumber.toUpperCase(),
      role: 'student',
      isActive: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found. Please contact your department administrator to register.',
        code: 'STUDENT_NOT_FOUND'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return success response
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}! 🎓`,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        displayId: user.displayId,
        email: user.email,
        department: user.department,
        courses: user.courses,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Student login error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Multiple accounts found with this matriculation number. Please contact admin.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again or contact support.',
      code: 'SERVER_ERROR'
    });
  }
};

// Login staff
exports.loginStaff = async (req, res) => {
  try {
    const { staffId, securityAnswer } = req.body;

    // Validate input
    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID is required'
      });
    }

    // Check if this is system admin login
    if (isSystemAdmin(staffId.toUpperCase())) {
      // System admin requires additional security question
      if (!securityAnswer) {
        return res.status(400).json({
          success: false,
          message: 'Security verification required for system admin access',
          requiresSecurity: true
        });
      }

      // Check security answer (you can customize this)
      const correctAnswer = process.env.SYSTEM_ADMIN_SECURITY_ANSWER || 'uniben2024';
      if (securityAnswer.toLowerCase() !== correctAnswer.toLowerCase()) {
        return res.status(401).json({
          success: false,
          message: 'Invalid security answer'
        });
      }

      // Find or create system admin
      let systemAdmin = await User.findOne({
        staffId: staffId.toUpperCase(),
        role: 'system_admin'
      });

      if (!systemAdmin) {
        systemAdmin = new User({
          name: 'System Administrator',
          staffId: staffId.toUpperCase(),
          role: 'system_admin',
          email: 'system.admin@uniben.edu.ng'
        });
        await systemAdmin.save();
      }

      // Update last login
      systemAdmin.lastLogin = new Date();
      await systemAdmin.save();

      // Generate token
      const token = generateToken(systemAdmin);

      return res.status(200).json({
        success: true,
        message: `Welcome, System Administrator! 🔧`,
        token,
        user: {
          id: systemAdmin._id,
          name: systemAdmin.name,
          role: systemAdmin.role,
          displayId: systemAdmin.displayId,
          email: systemAdmin.email,
          department: systemAdmin.department,
          courses: systemAdmin.courses,
          lastLogin: systemAdmin.lastLogin
        }
      });
    }

    // Regular staff login
    const user = await User.findOne({
      staffId: staffId.toUpperCase(),
      role: { $in: ['staff', 'bursary_admin', 'departmental_admin', 'lecturer_admin'] },
      isActive: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found. Please contact IT support to register.',
        code: 'STAFF_NOT_FOUND'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    // Return success response
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}! ${user.role === 'bursary_admin' ? '💰' : user.role === 'departmental_admin' ? '🏫' : user.role === 'lecturer_admin' ? '👨‍🏫' : '👨‍🏫'}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        displayId: user.displayId,
        email: user.email,
        department: user.department,
        courses: user.courses,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Staff login error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Multiple accounts found with this staff ID. Please contact admin.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again or contact support.',
      code: 'SERVER_ERROR'
    });
  }
};

// Check if user is system admin and requires additional authentication
const isSystemAdmin = (staffId) => {
  return staffId === process.env.SYSTEM_ADMIN_STAFF_ID || staffId === 'SYSADMIN-001';
};

// Login guest
exports.loginGuest = async (req, res) => {
  try {
    // Generate guest token (no database lookup required)
    const token = jwt.sign(
      {
        role: 'guest',
        isGuest: true,
        id: 'guest-user'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
        issuer: 'uniben-ai-assistant',
        audience: 'uniben-users'
      }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Welcome, Guest! 👋 You have limited access.',
      token,
      user: {
        id: 'guest-user',
        name: 'Guest User',
        role: 'guest',
        isGuest: true
      }
    });

  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({
      success: false,
      message: 'Guest login failed. Please try again.',
      code: 'SERVER_ERROR'
    });
  }
};

// Verify token (middleware helper)
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'guest') {
      return res.status(200).json({
        success: true,
        user: decoded
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account deactivated'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        displayId: user.displayId,
        email: user.email,
        department: user.department,
        courses: user.courses
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};