const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, ErrorResponse } = require('./errorHandler');

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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId);
        
        if (!req.user) {
            return next(new ErrorResponse('No user found with this token', 401));
        }

        if (!req.user.isActive) {
            return next(new ErrorResponse('User account is deactivated', 401));
        }

        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Check user roles
const checkRole = (...roles) => {
    return (req, res, next) => {
        console.log('🔍 Role check:', {
            userRole: req.user.role,
            allowedRoles: roles,
            hasAccess: roles.includes(req.user.role)
        });
        
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};

// Legacy compatibility
const authenticateToken = protect;

module.exports = { protect, checkRole, authenticateToken };
