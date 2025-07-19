const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  uploadAvatar,
  verifyEmail,
  resendVerification
} = require('../controllers/authController');
const { protect, authenticateToken, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['customer', 'barber'])
    .withMessage('Role must be either customer or barber')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number')
];

// Public routes
router.post('/register', registerValidation, async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = new User({ name, email, password, phone, role });
        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post('/login', loginValidation, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Forgot/Reset password routes (Public routes)
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, (req, res, next) => {
    console.log('\n🔍 RESET PASSWORD ROUTE HIT');
    console.log('📍 Route: POST /api/auth/reset-password/:token');
    console.log('🔑 Token received:', req.params.token);
    console.log('📝 Request body:', req.body);
    console.log('========================\n');
    resetPassword(req, res, next);
});

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', 
  body('email').isEmail().withMessage('Please provide a valid email'),
  resendVerification
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfileValidation, updateProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePasswordValidation, changePassword);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

// Shop Owner Registration (integrated into main auth)
router.post('/shop-register', [
  body('ownerName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Owner name must be at least 2 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('shopName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Shop name must be at least 2 characters')
], async (req, res) => {
    try {
        const { ownerName, email, password, phone, shopName, ...shopData } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create barber user
        const user = new User({ 
            name: ownerName, 
            email, 
            password, 
            phone, 
            role: 'barber' 
        });
        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Shop owner registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            needsShopSetup: true
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
