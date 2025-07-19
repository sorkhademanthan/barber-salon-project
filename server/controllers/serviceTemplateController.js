const { asyncHandler } = require('../middleware/errorHandler');

// Predefined service templates that shop owners can choose from
const serviceTemplates = {
  Hair: [
    { name: 'Regular Haircut', description: 'Basic haircut and styling', defaultDuration: 30 },
    { name: 'Premium Haircut', description: 'Detailed haircut with wash and style', defaultDuration: 45 },
    { name: 'Hair Wash', description: 'Shampoo and conditioning', defaultDuration: 15 },
    { name: 'Hair Styling', description: 'Professional hair styling', defaultDuration: 20 },
    { name: 'Hair Coloring', description: 'Hair color treatment', defaultDuration: 90 },
    { name: 'Highlights', description: 'Hair highlighting service', defaultDuration: 120 }
  ],
  Beard: [
    { name: 'Beard Trim', description: 'Beard trimming and shaping', defaultDuration: 20 },
    { name: 'Beard Styling', description: 'Complete beard grooming and styling', defaultDuration: 30 },
    { name: 'Mustache Trim', description: 'Mustache trimming service', defaultDuration: 10 },
    { name: 'Beard Oil Treatment', description: 'Nourishing beard oil application', defaultDuration: 15 }
  ],
  Styling: [
    { name: 'Hair Setting', description: 'Professional hair setting', defaultDuration: 25 },
    { name: 'Blow Dry', description: 'Hair blow drying service', defaultDuration: 20 },
    { name: 'Straightening', description: 'Hair straightening treatment', defaultDuration: 60 },
    { name: 'Curling', description: 'Hair curling service', defaultDuration: 30 }
  ],
  Treatment: [
    { name: 'Head Massage', description: 'Relaxing head massage', defaultDuration: 20 },
    { name: 'Hair Spa', description: 'Complete hair spa treatment', defaultDuration: 90 },
    { name: 'Scalp Treatment', description: 'Specialized scalp care', defaultDuration: 45 },
    { name: 'Hot Towel Treatment', description: 'Relaxing hot towel service', defaultDuration: 15 }
  ],
  Package: [
    { name: 'Full Service Package', description: 'Haircut + Beard + Styling', defaultDuration: 75 },
    { name: 'Grooming Package', description: 'Haircut + Wash + Styling', defaultDuration: 60 },
    { name: 'Premium Package', description: 'All services included', defaultDuration: 120 },
    { name: 'Quick Package', description: 'Haircut + Beard trim', defaultDuration: 45 }
  ]
};

// @desc    Get all service templates
// @route   GET /api/service-templates
// @access  Public
const getServiceTemplates = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: serviceTemplates
  });
});

// @desc    Get service templates by category
// @route   GET /api/service-templates/:category
// @access  Public
const getServiceTemplatesByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  const categoryTemplates = serviceTemplates[category];
  
  if (!categoryTemplates) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: categoryTemplates
  });
});

module.exports = {
  getServiceTemplates,
  getServiceTemplatesByCategory
};
