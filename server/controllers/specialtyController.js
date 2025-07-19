const { validationResult } = require('express-validator');
const Specialty = require('../models/Specialty');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');

// @desc    Get all specialties
// @route   GET /api/specialties
// @access  Public
const getSpecialties = asyncHandler(async (req, res, next) => {
    try {
        const specialties = await Specialty.find({ isActive: true })
            .sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            count: specialties.length,
            data: specialties
        });
    } catch (error) {
        console.error('Get specialties error:', error);
        return next(new ErrorResponse('Failed to fetch specialties', 500));
    }
});

// @desc    Create specialty
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
    
    try {
        const specialty = await Specialty.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Specialty created successfully',
            data: specialty
        });
    } catch (error) {
        console.error('Create specialty error:', error);
        return next(new ErrorResponse('Failed to create specialty', 500));
    }
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
    
    try {
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
    } catch (error) {
        console.error('Update specialty error:', error);
        return next(new ErrorResponse('Failed to update specialty', 500));
    }
});

// @desc    Delete specialty
// @route   DELETE /api/specialties/:id
// @access  Private (Admin only)
const deleteSpecialty = asyncHandler(async (req, res, next) => {
    try {
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
    } catch (error) {
        console.error('Delete specialty error:', error);
        return next(new ErrorResponse('Failed to delete specialty', 500));
    }
});

module.exports = {
    getSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty
};
