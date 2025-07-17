const express = require('express');
const { body, param } = require('express-validator');
const {
    getWorkingHours,
    setWorkingHours,
    deleteWorkingHours,
    getBarberWorkingHours
} = require('../controllers/workingHoursController');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const workingHoursValidation = [
    body('startTime')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    body('endTime')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format'),
    body('breakStartTime')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Break start time must be in HH:MM format'),
    body('breakEndTime')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Break end time must be in HH:MM format'),
    body('slotDuration')
        .optional()
        .isInt({ min: 15, max: 120 })
        .withMessage('Slot duration must be between 15 and 120 minutes'),
    body('shop')
        .optional()
        .isMongoId()
        .withMessage('Shop must be a valid ID')
];

const dayValidation = [
    param('dayOfWeek')
        .isInt({ min: 0, max: 6 })
        .withMessage('Day of week must be between 0 (Sunday) and 6 (Saturday)')
];

// Public routes
router.get('/barber/:barberId', getBarberWorkingHours);

// Protected routes (Barber only)
router.use(protect);
router.get('/', checkRole('barber'), getWorkingHours);
router.put('/:dayOfWeek', checkRole('barber'), dayValidation, workingHoursValidation, setWorkingHours);
router.delete('/:dayOfWeek', checkRole('barber'), dayValidation, deleteWorkingHours);

module.exports = router;
