const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-12345', {
    expiresIn: '7d',
  });
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-12345');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['customer', 'barber']).withMessage('Role must be either customer or barber'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// User registration
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, phone, password, role = 'customer' } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
    }

    const user = new User({ name, email, phone, password, role });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Login
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({ success: true, user: req.user.getPublicProfile() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Shop Owner Registration (Final single version)
router.post(
  '/shop-register',
  [
    body('ownerName').trim().isLength({ min: 2 }).withMessage('Owner name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('shopName').trim().isLength({ min: 2 }).withMessage('Shop name must be at least 2 characters'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { ownerName, email, password, phone, shopName, ...shopData } = req.body;

      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email or phone already exists' });
      }

      const user = new User({ name: ownerName, email, password, phone, role: 'shop_owner' });
      await user.save();

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'Shop owner registered successfully',
        token,
        user: user.getPublicProfile(),
        needsShopSetup: true,
      });
    } catch (error) {
      console.error('Shop registration error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

module.exports = router;
