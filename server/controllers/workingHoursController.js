const { validationResult } = require('express-validator');
const WorkingHours = require('../models/WorkingHours');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get barber's working hours
// @route   GET /api/working-hours
// @access  Private (Barber)
const getWorkingHours = asyncHandler(async (req, res, next) => {
    const workingHours = await WorkingHours.find({ barber: req.user.id })
        .populate('shop', 'name')
        .sort({ dayOfWeek: 1 });
    
    res.status(200).json({
        success: true,
        count: workingHours.length,
        data: workingHours
    });
});

// @desc    Set/Update working hours for a specific day
// @route   PUT /api/working-hours/:dayOfWeek
// @access  Private (Barber)
const setWorkingHours = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    const { dayOfWeek } = req.params;
    const { startTime, endTime, breakStartTime, breakEndTime, isAvailable, slotDuration, shop } = req.body;
    
    // Validate day of week
    const day = parseInt(dayOfWeek);
    if (day < 0 || day > 6) {
        return next(new ErrorResponse('Day of week must be between 0 (Sunday) and 6 (Saturday)', 400));
    }
    
    // Check if barber owns the shop
    if (req.user.role === 'barber' && req.user.shop.toString() !== shop) {
        return next(new ErrorResponse('You can only set working hours for your own shop', 403));
    }
    
    const workingHoursData = {
        barber: req.user.id,
        shop: shop || req.user.shop,
        dayOfWeek: day,
        startTime,
        endTime,
        breakStartTime,
        breakEndTime,
        isAvailable,
        slotDuration
    };
    
    const workingHours = await WorkingHours.findOneAndUpdate(
        { barber: req.user.id, dayOfWeek: day },
        workingHoursData,
        { new: true, upsert: true, runValidators: true }
    ).populate('shop', 'name');
    
    res.status(200).json({
        success: true,
        message: 'Working hours updated successfully',
        data: workingHours
    });
});

// @desc    Delete working hours for a specific day
// @route   DELETE /api/working-hours/:dayOfWeek
// @access  Private (Barber)
const deleteWorkingHours = asyncHandler(async (req, res, next) => {
    const { dayOfWeek } = req.params;
    const day = parseInt(dayOfWeek);
    
    if (day < 0 || day > 6) {
        return next(new ErrorResponse('Day of week must be between 0 (Sunday) and 6 (Saturday)', 400));
    }
    
    const workingHours = await WorkingHours.findOneAndDelete({
        barber: req.user.id,
        dayOfWeek: day
    });
    
    if (!workingHours) {
        return next(new ErrorResponse('Working hours not found for this day', 404));
    }
    
    res.status(200).json({
        success: true,
        message: 'Working hours deleted successfully'
    });
});

// @desc    Get working hours for a specific barber (Public)
// @route   GET /api/working-hours/barber/:barberId
// @access  Public
const getBarberWorkingHours = asyncHandler(async (req, res, next) => {
    const { barberId } = req.params;
    
    const workingHours = await WorkingHours.find({ barber: barberId, isAvailable: true })
        .populate('barber', 'name specialties')
        .populate('shop', 'name')
        .sort({ dayOfWeek: 1 });
    
    res.status(200).json({
        success: true,
        count: workingHours.length,
        data: workingHours
    });
});

module.exports = {
    getWorkingHours,
    setWorkingHours,
    deleteWorkingHours,
    getBarberWorkingHours
};
