const express = require('express');
const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Get user profile - Coming soon!',
    data: {}
  });
});

module.exports = router;
