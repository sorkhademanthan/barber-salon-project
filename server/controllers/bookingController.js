const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Shop = require('../models/Shop');
const Service = require('../models/Service');
const User = require('../models/User');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private (Admin)
const getBookings = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, status, shop } = req.query;
    
    let query = {};
    
    if (status) {
        query.status = status;
    }
    
    if (shop) {
        query.shopId = shop;
    }
    
    try {
        const bookings = await Booking.find(query)
            .populate('customerId', 'name email phone')
            .populate('shopId', 'name address.city')
            .populate('serviceId', 'name duration price')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Booking.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            data: bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        return next(new ErrorResponse('Failed to fetch bookings', 500));
    }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = asyncHandler(async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customerId', 'name email phone')
            .populate('shopId', 'name address contact')
            .populate('serviceId', 'name duration price');
        
        if (!booking) {
            return next(new ErrorResponse('Booking not found', 404));
        }
        
        // Check if user has access to this booking
        if (req.user.role === 'customer' && booking.customerId._id.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized to access this booking', 403));
        }
        
        if (req.user.role === 'barber') {
            const shop = await Shop.findOne({ ownerId: req.user.id });
            if (!shop || booking.shopId._id.toString() !== shop._id.toString()) {
                return next(new ErrorResponse('Not authorized to access this booking', 403));
            }
        }
        
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Get booking error:', error);
        if (error.name === 'CastError') {
            return next(new ErrorResponse('Booking not found', 404));
        }
        return next(new ErrorResponse('Failed to fetch booking', 500));
    }
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer only)
const createBooking = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    const { shopId, serviceId, barberId, scheduledTime, notes } = req.body;
    
    try {
        // Verify shop exists and is active
        const shop = await Shop.findById(shopId);
        if (!shop || !shop.isActive) {
            return next(new ErrorResponse('Shop not found or inactive', 404));
        }
        
        // Verify service exists and belongs to the shop
        const service = await Service.findById(serviceId);
        if (!service || service.shopId.toString() !== shopId) {
            return next(new ErrorResponse('Service not found or does not belong to this shop', 404));
        }
        
        // Check if the time slot is available
        const existingBooking = await Booking.findOne({
            shopId,
            scheduledTime: new Date(scheduledTime),
            status: { $nin: ['cancelled', 'no-show'] }
        });
        
        if (existingBooking) {
            return next(new ErrorResponse('Time slot is already booked', 400));
        }
        
        // Create booking
        const booking = await Booking.create({
            customerId: req.user.id,
            shopId,
            serviceId,
            barberId: barberId || shop.ownerId,
            scheduledTime: new Date(scheduledTime),
            notes,
            status: 'pending'
        });
        
        // Populate the booking for response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('customerId', 'name email phone')
            .populate('shopId', 'name address contact')
            .populate('serviceId', 'name duration price');
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: populatedBooking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        return next(new ErrorResponse('Failed to create booking', 500));
    }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Barber/Admin only)
const updateBookingStatus = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    const { status, notes } = req.body;
    
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return next(new ErrorResponse('Booking not found', 404));
        }
        
        // Check if user has permission to update this booking
        if (req.user.role === 'barber') {
            const shop = await Shop.findOne({ ownerId: req.user.id });
            if (!shop || booking.shopId.toString() !== shop._id.toString()) {
                return next(new ErrorResponse('Not authorized to update this booking', 403));
            }
        }
        
        booking.status = status;
        if (notes) {
            booking.notes = notes;
        }
        await booking.save();
        
        const updatedBooking = await Booking.findById(booking._id)
            .populate('customerId', 'name email phone')
            .populate('shopId', 'name address')
            .populate('serviceId', 'name duration price');
        
        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: updatedBooking
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        return next(new ErrorResponse('Failed to update booking status', 500));
    }
});

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = asyncHandler(async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return next(new ErrorResponse('Booking not found', 404));
        }
        
        // Check if user has permission to cancel this booking
        if (req.user.role === 'customer' && booking.customerId.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized to cancel this booking', 403));
        }
        
        if (req.user.role === 'barber') {
            const shop = await Shop.findOne({ ownerId: req.user.id });
            if (!shop || booking.shopId.toString() !== shop._id.toString()) {
                return next(new ErrorResponse('Not authorized to cancel this booking', 403));
            }
        }
        
        booking.status = 'cancelled';
        await booking.save();
        
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        return next(new ErrorResponse('Failed to cancel booking', 500));
    }
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = asyncHandler(async (req, res, next) => {
    try {
        const bookings = await Booking.find({ customerId: req.user.id })
            .populate('shopId', 'name address.city contact')
            .populate('serviceId', 'name duration price')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Get my bookings error:', error);
        return next(new ErrorResponse('Failed to fetch your bookings', 500));
    }
});

// @desc    Get customer bookings
// @route   GET /api/bookings/customer
// @access  Private (Customer only)
const getCustomerBookings = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { customerId: req.user.id };
    
    if (status) {
        query.status = status;
    }
    
    try {
        const bookings = await Booking.find(query)
            .populate('shopId', 'name address.city contact')
            .populate('serviceId', 'name duration price')
            .sort({ scheduledTime: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Booking.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            data: bookings
        });
    } catch (error) {
        console.error('Get customer bookings error:', error);
        return next(new ErrorResponse('Failed to fetch your bookings', 500));
    }
});

// @desc    Get barber's shop bookings
// @route   GET /api/bookings/barber
// @access  Private (Barber only)
const getBarberBookings = asyncHandler(async (req, res, next) => {
    try {
        // Find the barber's shop
        const shop = await Shop.findOne({ ownerId: req.user.id });
        
        if (!shop) {
            return next(new ErrorResponse('No shop found for this barber', 404));
        }
        
        const { page = 1, limit = 10, status, date } = req.query;
        
        let query = { shopId: shop._id };
        
        if (status) {
            query.status = status;
        }
        
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            
            query.scheduledTime = {
                $gte: startDate,
                $lt: endDate
            };
        }
        
        const bookings = await Booking.find(query)
            .populate('customerId', 'name email phone')
            .populate('serviceId', 'name duration price')
            .sort({ scheduledTime: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Booking.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            data: bookings
        });
    } catch (error) {
        console.error('Get barber bookings error:', error);
        return next(new ErrorResponse('Failed to fetch shop bookings', 500));
    }
});

// @desc    Get shop bookings
// @route   GET /api/bookings/shop/:shopId
// @access  Private (Barber/Admin only)
const getShopBookings = asyncHandler(async (req, res, next) => {
    try {
        const { shopId } = req.params;
        const { page = 1, limit = 10, status, date } = req.query;
        
        // Verify shop exists
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return next(new ErrorResponse('Shop not found', 404));
        }
        
        // Check if user has permission to view shop bookings
        if (req.user.role === 'barber' && shop.ownerId.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized to view this shop\'s bookings', 403));
        }
        
        let query = { shopId };
        
        if (status) {
            query.status = status;
        }
        
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            
            query.scheduledTime = {
                $gte: startDate,
                $lt: endDate
            };
        }
        
        const bookings = await Booking.find(query)
            .populate('customerId', 'name email phone')
            .populate('serviceId', 'name duration price')
            .sort({ scheduledTime: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Booking.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            total,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            data: bookings
        });
    } catch (error) {
        console.error('Get shop bookings error:', error);
        return next(new ErrorResponse('Failed to fetch shop bookings', 500));
    }
});

module.exports = {
    getBookings,
    getBooking,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    getMyBookings,
    getCustomerBookings,
    getBarberBookings,
    getShopBookings
};
