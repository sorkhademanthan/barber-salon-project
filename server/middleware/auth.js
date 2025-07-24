const jwt = require('jsonwebtoken');
const { asyncHandler, ErrorResponse } = require('./errorHandler');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Make sure this matches your .env JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new ErrorResponse('No user found with this token', 401));
    }

    if (!user.isActive) {
      return next(new ErrorResponse('User account is deactivated', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔍 Role check:', {
      userRole: req.user.role,
      allowedRoles: roles,
      hasAccess: roles.includes(req.user.role)
    });

    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`Role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};

// Alternative function name for compatibility
const authenticateToken = protect;

module.exports = {
  protect,
  authorize,
  checkRole: authorize, // Add this alias for backward compatibility
  authenticateToken
};
