const Booking = require('../models/Booking');
const Shop = require('../models/Shop');
const { asyncHandler, ErrorResponse } = require('./errorHandler');

// Check if user is the customer of the booking
const isBookingCustomer = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
        return next(new ErrorResponse('Booking not found', 404));
    }
    
    if (booking.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to access this booking', 403));
    }
    
    req.booking = booking;
    next();
});

// Check if user is the barber of the booking
const isBookingBarber = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
        return next(new ErrorResponse('Booking not found', 404));
    }
    
    // Check if user is the barber or shop owner
    if (req.user.role === 'barber') {
        const shop = await Shop.findOne({ ownerId: req.user.id });
        if (!shop || booking.shopId.toString() !== shop._id.toString()) {
            return next(new ErrorResponse('Not authorized to access this booking', 403));
        }
    } else if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to access this booking', 403));
    }
    
    req.booking = booking;
    next();
});

// Check if user is participant in the booking (customer or barber)
const isBookingParticipant = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
        return next(new ErrorResponse('Booking not found', 404));
    }
    
    let hasAccess = false;
    
    // Customer access
    if (req.user.role === 'customer' && booking.customerId.toString() === req.user.id) {
        hasAccess = true;
    }
    
    // Barber access
    if (req.user.role === 'barber') {
        const shop = await Shop.findOne({ ownerId: req.user.id });
        if (shop && booking.shopId.toString() === shop._id.toString()) {
            hasAccess = true;
        }
    }
    
    // Admin access
    if (req.user.role === 'admin') {
        hasAccess = true;
    }
    
    if (!hasAccess) {
        return next(new ErrorResponse('Not authorized to access this booking', 403));
    }
    
    req.booking = booking;
    next();
});

module.exports = {
    isBookingCustomer,
    isBookingBarber,
    isBookingParticipant
};


// Barber token 

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODc3NjFmNjlhYjgzZDUzNzBlN2U5NjYiLCJpYXQiOjE3NTI3MzU3MzIsImV4cCI6MTc1MzM0MDUzMn0.RuV9Ax2adOwuCA9he5QhzpyuhULnphB-G53DGS2tCZ8

// CUSTOMER TOKEN

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODc3NmJhN2UyM2VmZWFkN2EzODc5YzkiLCJpYXQiOjE3NTI3MzU3ODMsImV4cCI6MTc1MzM0MDU4M30.717I3t2yqo5WP60yroM4uBSfRaIznQ49c77kt0fMj-U