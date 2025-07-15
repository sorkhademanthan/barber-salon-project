const express = require('express');
const router = express.Router();

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Get bookings - Coming soon!',
    data: []
  });
});

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Create booking - Coming soon!',
    data: {}
  });
});

module.exports = router;
