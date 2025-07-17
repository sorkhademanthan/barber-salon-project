const { validationResult } = require('express-validator');
const Service = require('../models/Service');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Barber/Admin)
const createService = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    // Add shop from user if not provided
    req.body.shop = req.body.shop || req.user.shop;
    
    const service = await Service.create(req.body);
    
    res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service
    });
});

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res, next) => {
    const { shop, category } = req.query;
    
    let query = { isActive: true };
    
    if (shop) {
        query.shop = shop;
    }
    
    if (category) {
        query.category = category;
    }
    
    const services = await Service.find(query)
        .populate('shop', 'name')
        .sort({ popularity: -1, name: 1 });
    
    res.status(200).json({
        success: true,
        count: services.length,
        data: services
    });
});

module.exports = {
    createService,
    getServices
};
