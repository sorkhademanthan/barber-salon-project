const express = require('express');
const router = express.Router();
const { shopOwnerRegister, shopOwnerLogin } = require('../controllers/shopOwnerAuthController');
const { validateShopOwnerRegistration, validateLogin } = require('../middleware/validation');

// Shop Owner Registration
router.post('/shop-register', validateShopOwnerRegistration, shopOwnerRegister);

// Shop Owner Login
router.post('/shop-login', validateLogin, shopOwnerLogin);

module.exports = router;
