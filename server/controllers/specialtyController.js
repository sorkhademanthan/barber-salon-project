const { validationResult } = require('express-validator');
const Specialty = require('../models/Specialty');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get all specialties
// @route   GET /api/specialties
// @access  Public
const getSpecialties = asyncHandler(async (req, res, next) => {
    const specialties = await Specialty.find({ isActive: true }).sort({ name: 1 });
    
    res.status(200).json({
        success: true,
        count: specialties.length,
        data: specialties
    });
});

// @desc    Create new specialty
// @route   POST /api/specialties
// @access  Private (Admin only)
const createSpecialty = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    const specialty = await Specialty.create(req.body);
    
    res.status(201).json({
        success: true,
        message: 'Specialty created successfully',
        data: specialty
    });
});

// @desc    Update specialty
// @route   PUT /api/specialties/:id
// @access  Private (Admin only)
const updateSpecialty = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    const specialty = await Specialty.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    
    if (!specialty) {
        return next(new ErrorResponse('Specialty not found', 404));
    }
    
    res.status(200).json({
        success: true,
        message: 'Specialty updated successfully',
        data: specialty
    });
});

// @desc    Delete specialty
// @route   DELETE /api/specialties/:id
// @access  Private (Admin only)
const deleteSpecialty = asyncHandler(async (req, res, next) => {
    const specialty = await Specialty.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );
    
    if (!specialty) {
        return next(new ErrorResponse('Specialty not found', 404));
    }
    
    res.status(200).json({
        success: true,
        message: 'Specialty deleted successfully'
    });
});

module.exports = {
    getSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty
};
