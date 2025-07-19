const express = require('express');
const { body } = require('express-validator');
const {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    getServicesByShop
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const serviceValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Service name must be between 2 and 100 characters'),
    body('category')
        .isIn(['Hair', 'Beard', 'Styling', 'Treatment', 'Package'])
        .withMessage('Invalid service category'),
    body('price')
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('duration')
        .isInt({ min: 15, max: 300 })
        .withMessage('Duration must be between 15 and 300 minutes')
];

// Public routes
router.get('/', getServices);
router.get('/shop/:shopId', getServicesByShop);
router.get('/:id', getService);

// Protected routes (Barber/Admin only)
router.post('/', protect, authorize('barber', 'admin'), serviceValidation, createService);
router.put('/:id', protect, authorize('barber', 'admin'), serviceValidation, updateService);
router.delete('/:id', protect, authorize('barber', 'admin'), deleteService);

module.exports = router;

