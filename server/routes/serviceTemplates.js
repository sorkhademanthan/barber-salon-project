const express = require('express');
const {
  getServiceTemplates,
  getServiceTemplatesByCategory
} = require('../controllers/serviceTemplateController');

const router = express.Router();

// Public routes - no authentication needed for templates
router.get('/', getServiceTemplates);
router.get('/:category', getServiceTemplatesByCategory);

module.exports = router;
