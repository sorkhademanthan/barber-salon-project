const express = require('express');
const { body } = require('express-validator');
const {
    createService,
    getServices
} = require('../controllers/serviceController');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const serviceValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Service name must be between 2 and 100 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('duration')
        .isInt({ min: 15, max: 480 })
        .withMessage('Duration must be between 15 and 480 minutes'),
    body('category')
        .isIn(['haircut', 'beard', 'shave', 'styling', 'coloring', 'facial', 'massage', 'other'])
        .withMessage('Invalid category')
];

// Public routes
router.get('/', getServices);

// Protected routes
router.post('/', protect, checkRole('barber', 'admin'), serviceValidation, createService);

module.exports = router;



// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODc3NjFmNjlhYjgzZDUzNzBlN2U5NjYiLCJpYXQiOjE3NTI3MzI1NjYsImV4cCI6MTc1MzMzNzM2Nn0.4ffsOgybMTnLsUmIDpx3WK8S2cDSH-2UUhQf01DO0Mw

// JWT token customer