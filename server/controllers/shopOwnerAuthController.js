const User = require('../models/User');
const Shop = require('../models/Shop');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Shop Owner Registration
const shopOwnerRegister = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      // Owner details
      ownerName,
      email,
      phone,
      password,
      // Shop details
      shopName,
      street,
      city,
      state,
      zipCode,
      shopPhone,
      shopEmail
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create shop owner user
    const shopOwner = new User({
      name: ownerName,
      email,
      phone,
      password: hashedPassword,
      role: 'admin' // Shop owners get admin role
    });

    await shopOwner.save();

    // Create initial shop profile
    const shop = new Shop({
      ownerId: shopOwner._id,
      name: shopName,
      address: {
        street,
        city,
        state,
        zipCode
      },
      contact: {
        phone: shopPhone || phone,
        email: shopEmail || email
      },
      workingHours: {
        monday: { start: '09:00', end: '18:00', isOpen: true },
        tuesday: { start: '09:00', end: '18:00', isOpen: true },
        wednesday: { start: '09:00', end: '18:00', isOpen: true },
        thursday: { start: '09:00', end: '18:00', isOpen: true },
        friday: { start: '09:00', end: '18:00', isOpen: true },
        saturday: { start: '09:00', end: '17:00', isOpen: true },
        sunday: { start: '10:00', end: '16:00', isOpen: false }
      },
      status: 'active',
      isSetupComplete: true // Mark as complete since we have basic info
    });

    await shop.save();

    // Generate token
    const token = generateToken(shopOwner._id);

    res.status(201).json({
      success: true,
      message: 'Shop registered successfully!',
      data: {
        user: {
          id: shopOwner._id,
          name: shopOwner.name,
          email: shopOwner.email,
          role: shopOwner.role
        },
        shop: {
          id: shop._id,
          name: shop.name,
          isSetupComplete: shop.isSetupComplete
        },
        token,
        needsSetup: false // Already set up
      }
    });

  } catch (error) {
    console.error('Shop registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Shop Owner Login
const shopOwnerLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is shop owner (admin role)
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Shop owners only.'
      });
    }

    // Find or create shop profile
    let shop = await Shop.findOne({ ownerId: user._id });
    let needsSetup = false;

    if (!shop) {
      // First time login - create empty shop profile
      shop = new Shop({
        ownerId: user._id,
        name: `${user.name}'s Shop`,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        contact: {
          phone: user.phone,
          email: user.email
        },
        status: 'pending',
        isSetupComplete: false
      });
      
      await shop.save();
      needsSetup = true;
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        shop: {
          id: shop._id,
          name: shop.name,
          isSetupComplete: shop.isSetupComplete
        },
        token,
        needsSetup: needsSetup || !shop.isSetupComplete
      }
    });

  } catch (error) {
    console.error('Shop login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

module.exports = {
  shopOwnerRegister,
  shopOwnerLogin
};
