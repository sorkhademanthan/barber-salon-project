const express = require('express');
const { body } = require('express-validator');
const {
    getShops,
    getShop,
    createShop,
    updateShop,
    deleteShop,
    addToFavorites,
    removeFromFavorites,
    getFavoriteShops,
    getMyShop
} = require('../controllers/shopController');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// Validation rules for creating shop
const createShopValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Shop name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('address.street')
        .notEmpty()
        .withMessage('Street address is required'),
    body('address.city')
        .notEmpty()
        .withMessage('City is required'),
    body('address.state')
        .notEmpty()
        .withMessage('State is required'),
    body('address.zipCode')
        .notEmpty()
        .withMessage('Zip code is required'),
    body('contact.phone')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid Indian phone number'),
    body('contact.email')
        .isEmail()
        .withMessage('Please provide a valid email')
];

// Validation rules for updating shop (all optional)
const updateShopValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Shop name must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('address.street')
        .optional()
        .notEmpty()
        .withMessage('Street address cannot be empty'),
    body('address.city')
        .optional()
        .notEmpty()
        .withMessage('City cannot be empty'),
    body('address.state')
        .optional()
        .notEmpty()
        .withMessage('State cannot be empty'),
    body('address.zipCode')
        .optional()
        .notEmpty()
        .withMessage('Zip code cannot be empty'),
    body('contact.phone')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid Indian phone number'),
    body('contact.email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email')
];

// Public routes
router.get('/', getShops);
router.get('/favorites', protect, checkRole('customer'), getFavoriteShops);
router.get('/my-shop', protect, checkRole('barber'), getMyShop);
router.get('/:id', getShop);

// Protected routes
router.post('/', protect, checkRole('barber', 'admin'), createShopValidation, createShop);
router.put('/:id', protect, updateShopValidation, updateShop);
router.delete('/:id', protect, deleteShop);

// Favorite routes
router.post('/:id/favorite', protect, checkRole('customer'), addToFavorites);
router.delete('/:id/favorite', protect, checkRole('customer'), removeFromFavorites);

module.exports = router;
