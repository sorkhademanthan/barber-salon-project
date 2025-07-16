const express = require('express');
const { body } = require('express-validator');
const {
    getSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty
} = require('../controllers/specialtyController');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const specialtyValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Specialty name must be between 2 and 50 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Description cannot exceed 200 characters')
];

// Public routes
router.get('/', getSpecialties);

// Admin only routes
router.post('/', protect, checkRole('admin'), specialtyValidation, createSpecialty);
router.put('/:id', protect, checkRole('admin'), specialtyValidation, updateSpecialty);
router.delete('/:id', protect, checkRole('admin'), deleteSpecialty);

module.exports = router;
