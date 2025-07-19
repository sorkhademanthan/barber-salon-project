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
    
    if (shopId) {
        query.shopId = shopId;
    }
    
    if (category) {
        query.category = category;
    }
    
    try {
        const services = await Service.find(query)
            .populate('shopId', 'name address.city')
            .sort({ category: 1, name: 1 });
        
        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        console.error('Get services error:', error);
        return next(new ErrorResponse('Failed to fetch services', 500));
    }
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = asyncHandler(async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('shopId', 'name address contact');
        
        if (!service || !service.isActive) {
            return next(new ErrorResponse('Service not found', 404));
        }
        
        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error('Get service error:', error);
        if (error.name === 'CastError') {
            return next(new ErrorResponse('Service not found', 404));
        }
        return next(new ErrorResponse('Failed to fetch service', 500));
    }
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
    
    // Get user's shop
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
        return next(new ErrorResponse('You must have a shop to create services', 400));
    }
    
    // Add shop reference to service
    req.body.shopId = shop._id;
    
    try {
        const service = await Service.create(req.body);
        
        // Add service reference to shop
        shop.services.push(service._id);
        await shop.save();
        
        const populatedService = await Service.findById(service._id)
            .populate('shopId', 'name');
        
        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: populatedService
        });
    } catch (error) {
        console.error('Create service error:', error);
        return next(new ErrorResponse('Failed to create service', 500));
    }
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
    
    try {
        const service = await Service.findById(req.params.id)
            .populate('shopId');
        
        if (!service) {
            return next(new ErrorResponse('Service not found', 404));
        }
        
        // Check if user owns the shop or is admin
        if (service.shopId.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized to update this service', 403));
        }
        
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('shopId', 'name');
        
        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: updatedService
        });
    } catch (error) {
        console.error('Update service error:', error);
        if (error.name === 'CastError') {
            return next(new ErrorResponse('Service not found', 404));
        }
        return next(new ErrorResponse('Failed to update service', 500));
    }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Shop Owner/Admin only)
const deleteService = asyncHandler(async (req, res, next) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('shopId');
        
        if (!service) {
            return next(new ErrorResponse('Service not found', 404));
        }
        
        // Check if user owns the shop or is admin
        if (service.shopId.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized to delete this service', 403));
        }
        
        // Soft delete
        service.isActive = false;
        await service.save();
        
        // Remove from shop's services array
        const shop = await Shop.findById(service.shopId._id);
        shop.services = shop.services.filter(
            serviceId => serviceId.toString() !== req.params.id
        );
        await shop.save();
        
        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        console.error('Delete service error:', error);
        if (error.name === 'CastError') {
            return next(new ErrorResponse('Service not found', 404));
        }
        return next(new ErrorResponse('Failed to delete service', 500));
    }
});

// @desc    Get services by shop
// @route   GET /api/services/shop/:shopId
// @access  Public
const getServicesByShop = asyncHandler(async (req, res, next) => {
    try {
        const services = await Service.find({
            shopId: req.params.shopId,
            isActive: true
        }).sort({ category: 1, name: 1 });
        
        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        console.error('Get services by shop error:', error);
        return next(new ErrorResponse('Failed to fetch shop services', 500));
    }
});

module.exports = {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    getServicesByShop
};
