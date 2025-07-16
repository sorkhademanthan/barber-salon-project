const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { generateToken, generateResetToken } = require('../utils/tokenUtils');

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

  // Generate email verification token
  const { resetToken: emailToken, hashedToken: emailVerificationToken } = generateResetToken();
  const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    emailVerificationToken,
    emailVerificationExpire
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, emailToken, name);
  } catch (error) {
    console.error('Email sending failed:', error);
    // Continue registration even if email fails
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    data: {
      user: user.getPublicProfile(),
      emailSent: true
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
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return next(new ErrorResponse('Failed to fetch user data', 500));
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  try {
    const allowedFields = ['name', 'phone', 'specialties', 'experience'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Check if phone number is already taken by another user
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

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return next(new ErrorResponse('Failed to update profile', 500));
  }
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('No user found with this email address', 404));
  }

  // Generate reset token using crypto
  const { resetToken, hashedToken } = generateResetToken();
  
  // Set reset token and expiration (30 minutes for testing)
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  await user.save();

  console.log('\n=== PASSWORD RESET (DEV MODE) ===');
  console.log('📧 Email:', email);
  console.log('🔑 Reset Token:', resetToken);
  console.log('🔐 Hashed Token (DB):', hashedToken);
  console.log('🔗 Reset URL:', `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
  console.log('🧪 Test with: PUT /api/auth/reset-password/' + resetToken);
  console.log('⏰ Expires at:', new Date(Date.now() + 30 * 60 * 1000).toLocaleString());
  console.log('================================\n');

  try {
    // Send password reset email
    await sendPasswordResetEmail(email, resetToken, user.name);
    
    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email',
      data: {
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      }
    });
  } catch (error) {
    // If email fails, clear the reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    console.error('Email sending failed:', error);
    
    // In development, still return success with token for testing
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        success: true,
        message: 'Email service unavailable, but reset token generated for testing',
        data: {
          resetToken: resetToken,
          error: 'Email not sent - check console for token'
        }
      });
    }
    
    return next(new ErrorResponse('Email could not be sent. Please try again.', 500));
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  console.log('\n🔍 RESET PASSWORD CONTROLLER HIT');
  console.log('🔑 Token from params:', req.params.token);
  console.log('📝 Request body:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { token } = req.params;
  const { newPassword } = req.body;

  console.log('🔐 Hashing token for database lookup...');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  console.log('🔐 Hashed token:', hashedToken);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    console.log('❌ No valid user found with token');
    return next(new ErrorResponse('Invalid or expired password reset token', 400));
  }

  console.log('✅ Valid token found for user:', user.email);

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  console.log('✅ Password reset successful');

  const jwtToken = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You are now logged in.',
    data: {
      user: user.getPublicProfile(),
      token: jwtToken
    }
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
    // For now, just save the file path
    // Later we'll integrate with Cloudinary
    const avatarUrl = req.file.path || req.file.filename;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    );

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return next(new ErrorResponse('Error uploading avatar', 500));
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  
  console.log('🔍 Received token:', token);
  
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  console.log('🔐 Hashed token:', hashedToken);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  console.log('👤 Found user:', user ? 'Yes' : 'No');
  
  if (!user) {
    // Check if user exists with this token but expired
    const expiredUser = await User.findOne({
      emailVerificationToken: hashedToken
    });
    
    if (expiredUser) {
      return next(new ErrorResponse('Verification token has expired. Please request a new one.', 400));
    }
    
    return next(new ErrorResponse('Invalid verification token', 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  const jwtToken = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now log in.',
    data: {
      user: user.getPublicProfile(),
      token: jwtToken
    }
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('No user found with this email', 404));
  }

  if (user.isEmailVerified) {
    return next(new ErrorResponse('Email is already verified', 400));
  }

  // Generate new verification token
  const { resetToken: emailToken, hashedToken: emailVerificationToken } = generateResetToken();
  const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationExpire = emailVerificationExpire;
  await user.save();

  try {
    await sendVerificationEmail(email, emailToken, user.name);
    
    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    return next(new ErrorResponse('Failed to send verification email', 500));
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
  uploadAvatar,
  verifyEmail,
  resendVerification
};
   