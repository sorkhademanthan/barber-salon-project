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
  getMyShop,
  getShopServices,
  addShopService,
  updateShopService,
  deleteShopService
} = require('../controllers/shopController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules for shop creation
const createShopValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Shop name must be between 2 and 100 characters'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  body('contact.phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('contact.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

// Service validation rules
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
router.get('/', getShops);
router.get('/:id', getShop);
router.get('/:id/services', getShopServices);

// Protected routes
router.use(protect);

// Shop management routes (Barber/Admin only)
router.post('/', authorize('barber', 'admin'), createShopValidation, createShop);
router.put('/:id', authorize('barber', 'admin'), updateShop);
router.delete('/:id', authorize('barber', 'admin'), deleteShop);
router.get('/my/shop', authorize('barber', 'admin'), getMyShop);

// Service management routes (Shop Owner/Admin only)
router.post('/:id/services', authorize('barber', 'admin'), serviceValidation, addShopService);
router.put('/:shopId/services/:serviceId', authorize('barber', 'admin'), serviceValidation, updateShopService);
router.delete('/:shopId/services/:serviceId', authorize('barber', 'admin'), deleteShopService);

// Customer routes
router.post('/:id/favorite', authorize('customer'), addToFavorites);
router.delete('/:id/favorite', authorize('customer'), removeFromFavorites);
router.get('/my/favorites', authorize('customer'), getFavoriteShops);

module.exports = router;
