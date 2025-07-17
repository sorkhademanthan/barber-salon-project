const express = require('express');
const { body, param } = require('express-validator');
const {
    generateSlots,
    getAvailableSlots,
    getShopSlots,
    toggleSlotBlock
} = require('../controllers/slotController');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const generateSlotsValidation = [
    body('startDate')
        .isISO8601()
        .withMessage('Start date must be a valid date'),
    body('endDate')
        .isISO8601()
        .withMessage('End date must be a valid date'),
    body('barberId')
        .optional()
        .isMongoId()
        .withMessage('Barber ID must be valid'),
    body('shopId')
        .optional()
        .isMongoId()
        .withMessage('Shop ID must be valid')
];

const dateParamValidation = [
    param('date')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date must be in YYYY-MM-DD format')
];

const blockSlotValidation = [
    body('block')
        .optional()
        .isBoolean()
        .withMessage('Block must be a boolean value'),
    body('reason')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Reason cannot exceed 200 characters')
];

// Public routes
router.get('/available/:barberId/:date', dateParamValidation, getAvailableSlots);
router.get('/shop/:shopId/:date', dateParamValidation, getShopSlots);

// Protected routes
router.use(protect);

// Barber/Admin routes
router.post('/generate', checkRole('barber', 'admin'), generateSlotsValidation, generateSlots);
router.put('/:slotId/block', checkRole('barber', 'admin'), blockSlotValidation, toggleSlotBlock);

module.exports = router;
