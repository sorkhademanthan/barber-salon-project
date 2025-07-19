const express = require('express');
const { body } = require('express-validator');
const {
    generateSlots,
    getAvailableSlots,
    getShopSlots,
    toggleSlotBlock
} = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/auth');

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

// Public routes
router.get('/available/:barberId/:date', getAvailableSlots);
router.get('/shop/:shopId/:date', getShopSlots);

// Protected routes
router.use(protect);

// Barber/Admin routes
router.post('/generate', authorize('barber', 'admin'), generateSlotsValidation, generateSlots);
router.put('/:slotId/block', authorize('barber', 'admin'), toggleSlotBlock);

module.exports = router;
