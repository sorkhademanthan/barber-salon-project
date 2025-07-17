const Booking = require('../models/Booking');
const { asyncHandler, ErrorResponse } = require('./errorHandler');

// Check if user is the customer of the booking
const isBookingCustomer = asyncHandler(async (req, res, next) => {
    const bookingId = req.params.id;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
        return next(new ErrorResponse('Booking not found', 404));
    }
    
    // Check if current user is the customer of this booking
    if (booking.customer.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to access this booking', 403));
    }
    
    // Attach booking to request for use in controller
    req.booking = booking;
    next();
});

// Check if user is the barber of the booking
const isBookingBarber = asyncHandler(async (req, res, next) => {
    const bookingId = req.params.id;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
        return next(new ErrorResponse('Booking not found', 404));
    }
    
    // Check if current user is the barber of this booking
    if (booking.barber.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to access this booking', 403));
    }
    
    // Attach booking to request for use in controller
    req.booking = booking;
    next();
});

// Check if user is either customer or barber of the booking
const isBookingParticipant = asyncHandler(async (req, res, next) => {
    const bookingId = req.params.id;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
        return next(new ErrorResponse('Booking not found', 404));
    }
    
    // Check if current user is either customer or barber of this booking
    const isCustomer = booking.customer.toString() === req.user.id;
    const isBarber = booking.barber.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isCustomer && !isBarber && !isAdmin) {
        return next(new ErrorResponse('Not authorized to access this booking', 403));
    }
    
    // Attach booking and user role in booking to request
    req.booking = booking;
    req.userRoleInBooking = isCustomer ? 'customer' : isBarber ? 'barber' : 'admin';
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