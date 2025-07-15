const express = require('express');
const router = express.Router();

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Get all shops - Coming soon!',
    data: []
  });
});

// @desc    Get single shop
// @route   GET /api/shops/:id
// @access  Public
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Get shop details - Coming soon!',
    data: {}
  });
});

module.exports = router;
