const express = require('express');
const { body } = require('express-validator');
const {
    getBookings,
    getBooking,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    getMyBookings,
    getShopBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const bookingValidation = [
    body('shopId')
        .isMongoId()
        .withMessage('Valid shop ID is required'),
    body('serviceId')
        .isMongoId()
        .withMessage('Valid service ID is required'),
    body('barberId')
        .optional()
        .isMongoId()
        .withMessage('Valid barber ID is required'),
    body('scheduledTime')
        .isISO8601()
        .withMessage('Valid scheduled time is required'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters')
];

// All routes require authentication
router.use(protect);

// Customer routes
router.get('/my-bookings', authorize('customer'), getMyBookings);
router.post('/', authorize('customer'), bookingValidation, createBooking);
router.put('/:id/cancel', authorize('customer'), cancelBooking);

// Barber routes
router.get('/shop/:shopId', authorize('barber', 'admin'), getShopBookings);
router.put('/:id/status', authorize('barber', 'admin'), updateBookingStatus);

// Admin/General routes
router.get('/', authorize('admin'), getBookings);
router.get('/:id', getBooking);

module.exports = router;
