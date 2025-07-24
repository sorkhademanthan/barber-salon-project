const { validationResult } = require('express-validator');
const Service = require('../models/Service');
const Shop = require('../models/Shop');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res, next) => {
    const { shopId, category } = req.query;
    let query = { isActive: true };
    if (shopId) query.shopId = shopId;
    if (category) query.category = category;

    const services = await Service.find(query)
        .populate('shopId', 'name address.city')
        .sort({ category: 1, name: 1 });

    res.status(200).json({
        success: true,
        count: services.length,
        data: services
    });
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = asyncHandler(async (req, res, next) => {
    const service = await Service.findById(req.params.id)
        .populate('shopId', 'name address contact');
    if (!service || !service.isActive) {
        return next(new ErrorResponse('Service not found', 404));
    }
    res.status(200).json({ success: true, data: service });
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Barber/Admin only)
const createService = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    const { shopId, name, description, category, price, duration, image } = req.body;
    const shop = await Shop.findById(shopId);
    if (!shop || !shop.isActive) {
        return next(new ErrorResponse('Shop not found', 404));
    }
    const service = await Service.create({
        shopId,
        name,
        description,
        category,
        price,
        duration,
        image
    });
    shop.services.push(service._id);
    await shop.save();
    res.status(201).json({ success: true, message: 'Service created', data: service });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Shop Owner/Admin only)
const updateService = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    const service = await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    if (!service) {
        return next(new ErrorResponse('Service not found', 404));
    }
    res.status(200).json({ success: true, message: 'Service updated', data: service });
});

// @desc    Delete service (soft delete)
// @route   DELETE /api/services/:id
// @access  Private (Shop Owner/Admin only)
const deleteService = asyncHandler(async (req, res, next) => {
    const service = await Service.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );
    if (!service) {
        return next(new ErrorResponse('Service not found', 404));
    }
    res.status(200).json({ success: true, message: 'Service deleted' });
});

// @desc    Get services by shop
// @route   GET /api/services/shop/:shopId
// @access  Public
const getServicesByShop = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop || !shop.isActive) {
        return next(new ErrorResponse('Shop not found', 404));
    }
    const services = await Service.find({ shopId: req.params.shopId, isActive: true }).sort({ name: 1 });
    res.status(200).json({
        success: true,
        count: services.length,
        data: services
    });
});

module.exports = {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    getServicesByShop
};