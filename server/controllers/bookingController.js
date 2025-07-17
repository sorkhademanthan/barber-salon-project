const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Service = require('../models/Service');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');
const { sendBookingEmail } = require('../utils/sendEmail');

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
        .populate('barber', 'name email specialties')
        .populate('shop', 'name address contact')
        .populate('slot', 'date startTime endTime')
        .populate('services.service', 'name price duration');
    
    // Send email notifications
    try {
        await sendBookingEmail('created', populatedBooking);
        console.log('✅ Booking creation emails sent successfully');
    } catch (error) {
        console.error('❌ Failed to send booking emails:', error.message);
        // Don't fail the booking if email fails
    }
    
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
    const bookingId = req.params.id;
    
    console.log('🔄 Updating booking status:', { bookingId, status, userId: req.user.id });
    
    const booking = await Booking.findById(bookingId)
        .populate('customer', 'name email phone')
        .populate('barber', 'name email')
        .populate('shop', 'name address')
        .populate('slot', 'date startTime endTime');
    
    if (!booking) {
        return next(new ErrorResponse('Booking not found', 404));
    }
    
    // Check authorization
    const canUpdate = (
        req.user.role === 'admin' ||
        booking.barber._id.toString() === req.user.id
    );
    
    if (!canUpdate) {
        return next(new ErrorResponse('Not authorized to update this booking', 403));
    }
    
    // Validate status transitions
    const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['in-progress', 'completed', 'cancelled'],
        'in-progress': ['completed', 'cancelled'],
        completed: [], // Cannot change from completed
        cancelled: [] // Cannot change from cancelled
    };
    
    if (!validTransitions[booking.status].includes(status)) {
        return next(new ErrorResponse(
            `Cannot change booking status from ${booking.status} to ${status}`, 
            400
        ));
    }
    
    // Update booking based on status
    const oldStatus = booking.status;
    if (status === 'confirmed') {
        await booking.confirm();
    } else if (status === 'completed') {
        await booking.complete();
    } else if (status === 'cancelled') {
        await booking.cancel(`Cancelled by ${req.user.role}`, req.user.id);
        
        // Free up the slot if cancelled
        const slot = await Slot.findById(booking.slot._id);
        if (slot) {
            await slot.cancelBooking();
        }
    } else {
        booking.status = status;
        if (notes) booking.notes = notes;
        await booking.save();
    }
    
    // Refresh booking data
    const updatedBooking = await Booking.findById(booking._id)
        .populate('customer', 'name email phone')
        .populate('barber', 'name email')
        .populate('shop', 'name address')
        .populate('slot', 'date startTime endTime')
        .populate('services.service', 'name price');
    
    // Send email notifications for status changes
    try {
        await sendBookingEmail('status_updated', updatedBooking, { oldStatus, newStatus: status });
        console.log('✅ Status update emails sent successfully');
    } catch (error) {
        console.error('❌ Failed to send status update emails:', error.message);
    }
    
    res.status(200).json({
        success: true,
        message: `Booking ${status} successfully`,
        data: updatedBooking
    });
});

// @desc    Cancel booking (Customer)
// @route   DELETE /api/bookings/:id
// @access  Private (Customer/Barber/Admin)
const deleteBooking = asyncHandler(async (req, res, next) => {
    const { reason = 'No reason provided' } = req.body;
    const bookingId = req.params.id;
    
    const booking = await Booking.findById(bookingId)
        .populate('customer', 'name email phone')
        .populate('barber', 'name email')
        .populate('shop', 'name')
        .populate('slot', 'date startTime endTime');
    
    if (!booking) {
        return next(new ErrorResponse('Booking not found', 404));
    }
    
    // Check if user can cancel this booking
    const canCancel = (
        req.user.role === 'admin' ||
        booking.customer._id.toString() === req.user.id ||
        booking.barber._id.toString() === req.user.id
    );
    
    if (!canCancel) {
        return next(new ErrorResponse('Not authorized to cancel this booking', 403));
    }
    
    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
        return next(new ErrorResponse(
            'Booking cannot be cancelled (too close to appointment time or already completed)', 
            400
        ));
    }
    
    // Cancel booking and free up the slot
    await booking.cancel(reason, req.user.id);
    
    const slot = await Slot.findById(booking.slot._id);
    if (slot) {
        await slot.cancelBooking();
    }
    
    // Send cancellation emails
    try {
        await sendBookingEmail('cancelled', booking, { cancelReason: reason, cancelledBy: req.user.name });
        console.log('✅ Cancellation emails sent successfully');
    } catch (error) {
        console.error('❌ Failed to send cancellation emails:', error.message);
    }
    
    res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
    });
});

// @desc    Get barber's bookings
// @route   GET /api/bookings/barber
// @access  Private (Barber)
const getBarberBookings = asyncHandler(async (req, res, next) => {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    let query = { barber: req.user.id };
    
    if (status) {
        query.status = status;
    }
    
    if (date) {
        // Fix the date filtering logic
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        console.log('🔍 Date filter debug:', {
            requestedDate: date,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
    }
    
    const bookings = await Booking.find(query)
        .populate('customer', 'name email phone')
        .populate('shop', 'name')
        .populate({
            path: 'slot',
            select: 'date startTime endTime',
            match: date ? {
                date: {
                    $gte: new Date(date + 'T00:00:00.000Z'),
                    $lte: new Date(date + 'T23:59:59.999Z')
                }
            } : {}
        })
        .populate('services.service', 'name price duration')
        .sort({ 'slot.date': 1, 'slot.startTime': 1 });
    
    // Filter out bookings where slot is null (due to date mismatch)
    const filteredBookings = bookings.filter(booking => booking.slot);
    
    const total = filteredBookings.length;
    
    // Apply pagination to filtered results
    const paginatedBookings = filteredBookings
        .slice((page - 1) * limit, page * limit);
    
    res.status(200).json({
        success: true,
        count: paginatedBookings.length,
        total,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
        },
        data: paginatedBookings
    });
});

// @desc    Get customer's bookings
// @route   GET /api/bookings/customer
// @access  Private (Customer)
const getCustomerBookings = asyncHandler(async (req, res, next) => {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { customer: req.user.id };
    
    if (status) {
        query.status = status;
    }
    
    const bookings = await Booking.find(query)
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

module.exports = {
    createBooking,
    getUserBookings,
    getBooking,
    updateBookingStatus,
    cancelBooking: deleteBooking,
    getBarberBookings,
    getCustomerBookings
};
