const express = require('express');
const { body } = require('express-validator');
const {
    createBooking,
    getUserBookings,
    getBooking,
    updateBookingStatus,
    cancelBooking
} = require('../controllers/bookingController');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createBookingValidation = [
    body('slotId')
        .isMongoId()
        .withMessage('Slot ID must be valid'),
    body('services')
        .isArray({ min: 1 })
        .withMessage('At least one service must be selected'),
    body('services.*.serviceId')
        .isMongoId()
        .withMessage('Service ID must be valid'),
    body('customerNotes')
        .optional()
        .isLength({ max: 300 })
        .withMessage('Customer notes cannot exceed 300 characters')
];

const updateStatusValidation = [
    body('status')
        .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
        .withMessage('Invalid status'),
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters')
];

const cancelBookingValidation = [
    body('reason')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Cancel reason cannot exceed 200 characters')
];

// All routes require authentication
router.use(protect);

// Customer routes
router.post('/', checkRole('customer'), createBookingValidation, createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBookingValidation, cancelBooking);

// Barber/Admin routes
router.put('/:id/status', checkRole('barber', 'admin'), updateStatusValidation, updateBookingStatus);

module.exports = router;
