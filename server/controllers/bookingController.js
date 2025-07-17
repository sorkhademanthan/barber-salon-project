const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Service = require('../models/Service');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    const { slotId, services, customerNotes } = req.body;
    
    // Check if slot exists and is available
    const slot = await Slot.findById(slotId)
        .populate('barber', 'name')
        .populate('shop', 'name');
    
    if (!slot) {
        return next(new ErrorResponse('Slot not found', 404));
    }
    
    if (!slot.isAvailable()) {
        return next(new ErrorResponse('Slot is not available for booking', 400));
    }
    
    // Validate and calculate total amount for services
    let totalAmount = 0;
    const bookingServices = [];
    
    for (const serviceItem of services) {
        const service = await Service.findById(serviceItem.serviceId);
        if (!service || !service.isActive) {
            return next(new ErrorResponse(`Service ${serviceItem.serviceId} not found or inactive`, 404));
        }
        
        // Verify service belongs to the same shop
        if (service.shop.toString() !== slot.shop._id.toString()) {
            return next(new ErrorResponse('Service does not belong to this shop', 400));
        }
        
        bookingServices.push({
            service: service._id,
            price: service.price
        });
        
        totalAmount += service.price;
    }
    
    if (bookingServices.length === 0) {
        return next(new ErrorResponse('At least one service must be selected', 400));
    }
    
    // Create booking
    const booking = await Booking.create({
        customer: req.user.id,
        barber: slot.barber._id,
        shop: slot.shop._id,
        slot: slotId,
        services: bookingServices,
        totalAmount,
        customerNotes
    });
    
    // Update slot
    await slot.bookSlot(req.user.id, booking._id);
    
    // Populate booking for response
    const populatedBooking = await Booking.findById(booking._id)
        .populate('customer', 'name email phone')
        .populate('barber', 'name specialties')
        .populate('shop', 'name address')
        .populate('slot', 'date startTime endTime')
        .populate('services.service', 'name price duration');
    
    res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: populatedBooking
    });
});

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
const getUserBookings = asyncHandler(async (req, res, next) => {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Different queries based on user role
    if (req.user.role === 'customer') {
        query.customer = req.user.id;
    } else if (req.user.role === 'barber') {
        query.barber = req.user.id;
    } else if (req.user.role === 'admin') {
        // Admin can see all bookings
    }
    
    if (status) {
        query.status = status;
    }
    
    const bookings = await Booking.find(query)
        .populate('customer', 'name email phone')
        .populate('barber', 'name specialties')
        .populate('shop', 'name address')
        .populate('slot', 'date startTime endTime')
        .populate('services.service', 'name price duration')
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
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id)
        .populate('customer', 'name email phone')
        .populate('barber', 'name specialties')
        .populate('shop', 'name address contact')
        .populate('slot', 'date startTime endTime')
        .populate('services.service', 'name price duration description')
        .populate('cancelledBy', 'name');
    
    if (!booking) {
        return next(new ErrorResponse('Booking not found', 404));
    }
    
    // Check if user can access this booking
    const canAccess = (
        req.user.role === 'admin' ||
        booking.customer._id.toString() === req.user.id ||
        booking.barber._id.toString() === req.user.id
    );
    
    if (!canAccess) {
        return next(new ErrorResponse('Not authorized to access this booking', 403));
    }
    
    res.status(200).json({
        success: true,
        data: booking
    });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Barber/Admin)
const updateBookingStatus = asyncHandler(async (req, res, next) => {
    const { status, notes } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
        return next(new ErrorResponse('Booking not found', 404));
    }
    
    // Check authorization
    const canUpdate = (
        req.user.role === 'admin' ||
        booking.barber.toString() === req.user.id
    );
    
    if (!canUpdate) {
        return next(new ErrorResponse('Not authorized to update this booking', 403));
    }
    
    // Update booking based on status
    if (status === 'confirmed') {
        await booking.confirm();
    } else if (status === 'completed') {
        await booking.complete();
    } else {
        booking.status = status;
        if (notes) booking.notes = notes;
        await booking.save();
    }
    
    const updatedBooking = await Booking.findById(booking._id)
        .populate('customer', 'name email phone')
        .populate('barber', 'name')
        .populate('slot', 'date startTime endTime');
    
    res.status(200).json({
        success: true,
        message: 'Booking status updated successfully',
        data: updatedBooking
    });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res, next) => {
    const { reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
        return next(new ErrorResponse('Booking not found', 404));
    }
    
    // Check if user can cancel this booking
    const canCancel = (
        req.user.role === 'admin' ||
        booking.customer.toString() === req.user.id ||
        booking.barber.toString() === req.user.id
    );
    
    if (!canCancel) {
        return next(new ErrorResponse('Not authorized to cancel this booking', 403));
    }
    
    if (!booking.canBeCancelled()) {
        return next(new ErrorResponse('Booking cannot be cancelled (too close to appointment time or already completed)', 400));
    }
    
    // Cancel booking and free up the slot
    await booking.cancel(reason, req.user.id);
    
    const slot = await Slot.findById(booking.slot);
    if (slot) {
        await slot.cancelBooking();
    }
    
    const updatedBooking = await Booking.findById(booking._id)
        .populate('customer', 'name email phone')
        .populate('cancelledBy', 'name');
    
    res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: updatedBooking
    });
});

module.exports = {
    createBooking,
    getUserBookings,
    getBooking,
    updateBookingStatus,
    cancelBooking
};
