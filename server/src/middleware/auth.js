const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required. Please log in again.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Please log in again.',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request object
    req.user = decoded;

    next();

  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Token not active. Please log in again.',
        code: 'TOKEN_NOT_ACTIVE'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try logging in again.',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware for guest access (allows both authenticated users and guests)
const guestMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, treat as guest
      req.user = { role: 'guest', isGuest: true };
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      req.user = { role: 'guest', isGuest: true };
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();

  } catch (error) {
    // If token verification fails, treat as guest
    req.user = { role: 'guest', isGuest: true };
    next();
  }
};

// Middleware for role-based access control
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Middleware for student-only access
const requireStudent = requireRole(['student']);

// Middleware for staff-only access
const requireStaff = requireRole(['staff']);

// Middleware for authenticated users only (no guests)
const requireAuth = (req, res, next) => {
  if (!req.user || req.user.role === 'guest') {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in with your student or staff credentials.',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  guestMiddleware,
  requireRole,
  requireStudent,
  requireStaff,
  requireAuth
};