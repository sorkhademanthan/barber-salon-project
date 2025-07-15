const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');
const { generateToken } = require('../utils/tokenUtils');
// const { uploadToCloudinary } = require('../utils/cloudinary'); // Disable for now

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, email, phone, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'phone';
    return next(new ErrorResponse(`User with this ${field} already exists`, 400));
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new ErrorResponse('Your account has been deactivated', 401));
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  let user;
  
  try {
    user = await User.findById(req.user.id);
    
    // Only populate if user has shop or favoriteShops
    if (user.shop || (user.favoriteShops && user.favoriteShops.length > 0)) {
      user = await User.findById(req.user.id)
        .populate('shop', 'name address contact')
        .populate('favoriteShops', 'name address rating');
    }
  } catch (error) {
    // If populate fails, just get user without population
    user = await User.findById(req.user.id);
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.getPublicProfile()
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ['name', 'phone', 'specialties', 'experience'];
  const updates = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (updates.phone && !/^[6-9]\d{9}$/.test(updates.phone)) {
    return next(new ErrorResponse('Please provide a valid Indian phone number', 400));
  }

  if (updates.phone) {
    const existingUser = await User.findOne({
      phone: updates.phone,
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return next(new ErrorResponse('Phone number already in use', 400));
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.getPublicProfile()
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    return next(new ErrorResponse('Current password is incorrect', 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('No user found with this email', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Password reset instructions sent to your email'
  });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

// @desc    Upload avatar
// @route   PUT /api/auth/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please select an image to upload', 400));
  }

  try {
    const avatarUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    return next(new ErrorResponse('Error uploading avatar', 500));
  }
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  uploadAvatar
};
