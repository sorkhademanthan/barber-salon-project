const express = require('express');
const { body } = require('express-validator');
const {
    getWorkingHours,
    setWorkingHours,
    deleteWorkingHours,
    getBarberWorkingHours
} = require('../controllers/workingHoursController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const workingHoursValidation = [
    body('startTime')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    body('endTime')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format'),
    body('slotDuration')
        .optional()
        .isInt({ min: 15, max: 120 })
        .withMessage('Slot duration must be between 15 and 120 minutes')
];

// Public routes
router.get('/barber/:barberId', getBarberWorkingHours);

// Protected routes (Barber only)
router.use(protect);
router.get('/', authorize('barber'), getWorkingHours);
router.put('/:dayOfWeek', authorize('barber'), workingHoursValidation, setWorkingHours);
router.delete('/:dayOfWeek', authorize('barber'), deleteWorkingHours);

module.exports = router;
