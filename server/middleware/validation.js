const { body } = require('express-validator');

// Shop Owner Registration Validation
const validateShopOwnerRegistration = [
  body('ownerName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Owner name must be at least 2 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('shopName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Shop name must be at least 2 characters'),
  
  body('street')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Street address must be at least 5 characters'),
  
  body('city')
    .trim()
    .isLength({ min: 2 })
    .withMessage('City is required'),
  
  body('state')
    .trim()
    .isLength({ min: 2 })
    .withMessage('State is required'),
  
  body('zipCode')
    .isPostalCode('IN')
    .withMessage('Please provide a valid ZIP code')
];

module.exports = {
  validateShopOwnerRegistration
};