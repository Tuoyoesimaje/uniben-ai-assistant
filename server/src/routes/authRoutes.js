const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/login/student
router.post('/login/student', authController.loginStudent);

// POST /api/auth/login/staff
router.post('/login/staff', authController.loginStaff);


// POST /api/auth/login/guest
router.post('/login/guest', authController.loginGuest);

// GET /api/auth/verify - verify token validity
router.get('/verify', authMiddleware, authController.verifyToken);

// GET /api/auth/me - get current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'guest') {
      return res.json({
        success: true,
        user: req.user
      });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        displayId: user.displayId,
        email: user.email,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

module.exports = router;