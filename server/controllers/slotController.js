const { validationResult } = require('express-validator');
const Slot = require('../models/Slot');
const WorkingHours = require('../models/WorkingHours');
const Booking = require('../models/Booking');
const { asyncHandler, ErrorResponse } = require('../middleware/errorHandler');

// @desc    Generate slots for a barber for specific date range
// @route   POST /api/slots/generate
// @access  Private (Barber/Admin)
const generateSlots = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    
    const { startDate, endDate, barberId, shopId } = req.body;
    const barber = barberId || req.user.id;
    const shop = shopId || req.user.shop;
    
    // Validate date range - Fix timezone issue
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    // Set today to start of day in local timezone
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    console.log('🔍 Date Validation Debug:');
    console.log('Start Date:', start.toISOString());
    console.log('End Date:', end.toISOString());
    console.log('Today Start:', todayStart.toISOString());
    console.log('Start >= Today?', start >= todayStart);
    
    if (start < todayStart) {
        return next(new ErrorResponse('Cannot generate slots for past dates', 400));
    }
    
    if (end <= start) {
        return next(new ErrorResponse('End date must be after start date', 400));
    }
    
    const dateDiff = (end - start) / (1000 * 60 * 60 * 24);
    if (dateDiff > 30) {
        return next(new ErrorResponse('Cannot generate slots for more than 30 days at once', 400));
    }
    
    // Get barber's working hours
    const workingHours = await WorkingHours.find({ 
        barber, 
        isAvailable: true 
    });
    
    if (workingHours.length === 0) {
        return next(new ErrorResponse('No working hours set for this barber', 400));
    }
    
    const generatedSlots = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        const workingHour = workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
        
        if (workingHour) {
            const daySlots = await generateSlotsForDay(currentDate, workingHour, barber, shop);
            generatedSlots.push(...daySlots);
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Bulk insert slots
    if (generatedSlots.length > 0) {
        await Slot.insertMany(generatedSlots, { ordered: false }).catch(err => {
            // Ignore duplicate key errors
            if (err.code !== 11000) throw err;
        });
    }
    
    res.status(201).json({
        success: true,
        message: `Generated ${generatedSlots.length} slots successfully`,
        data: {
            slotsGenerated: generatedSlots.length,
            dateRange: { startDate, endDate }
        }
    });
});

// Helper function to generate slots for a specific day
const generateSlotsForDay = async (date, workingHour, barberId, shopId) => {
    const slots = [];
    const slotDuration = workingHour.slotDuration;
    
    // Check if slots already exist for this date
    const existingSlots = await Slot.find({
        barber: barberId,
        date: {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999))
        }
    });
    
    if (existingSlots.length > 0) {
        return slots; // Skip if slots already exist
    }
    
    const startMinutes = timeToMinutes(workingHour.startTime);
    const endMinutes = timeToMinutes(workingHour.endTime);
    const breakStartMinutes = workingHour.breakStartTime ? timeToMinutes(workingHour.breakStartTime) : null;
    const breakEndMinutes = workingHour.breakEndTime ? timeToMinutes(workingHour.breakEndTime) : null;
    
    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
        const slotEndMinutes = minutes + slotDuration;
        
        // Skip if slot overlaps with break time
        if (breakStartMinutes && breakEndMinutes) {
            if (minutes < breakEndMinutes && slotEndMinutes > breakStartMinutes) {
                continue;
            }
        }
        
        // Ensure slot doesn't exceed working hours
        if (slotEndMinutes > endMinutes) {
            break;
        }
        
        const startTime = minutesToTime(minutes);
        const endTime = minutesToTime(slotEndMinutes);
        
        slots.push({
            barber: barberId,
            shop: shopId,
            date: new Date(date),
            startTime,
            endTime,
            estimatedDuration: slotDuration
        });
    }
    
    return slots;
};

// @desc    Get available slots for a barber on a specific date
// @route   GET /api/slots/available/:barberId/:date
// @access  Public
const getAvailableSlots = asyncHandler(async (req, res, next) => {
    const { barberId, date } = req.params;
    
    console.log('🔍 Getting available slots debug:');
    console.log('Barber ID:', barberId);
    console.log('Requested Date:', date);
    
    // Validate date
    const requestedDate = new Date(date);
    const today = new Date();
    
    console.log('Parsed Date:', requestedDate);
    console.log('Today:', today);
    
    // Set today to start of day in local timezone
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (requestedDate < todayStart) {
        return next(new ErrorResponse('Cannot get slots for past dates', 400));
    }
    
    // Create date range for the entire day
    const dayStart = new Date(requestedDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(requestedDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    console.log('Day Start:', dayStart);
    console.log('Day End:', dayEnd);
    
    const query = {
        barber: barberId,
        date: {
            $gte: dayStart,
            $lte: dayEnd
        },
        status: 'available',
        isBooked: false
    };
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const slots = await Slot.find(query)
        .populate('barber', 'name specialties')
        .populate('shop', 'name address')
        .sort({ startTime: 1 });
    
    console.log('Found slots count:', slots.length);
    if (slots.length > 0) {
        console.log('First slot:', slots[0]);
    }
    
    res.status(200).json({
        success: true,
        count: slots.length,
        data: slots
    });
});

// @desc    Get slots for a shop on a specific date
// @route   GET /api/slots/shop/:shopId/:date
// @access  Public
const getShopSlots = asyncHandler(async (req, res, next) => {
    const { shopId, date } = req.params;
    const { barberId, status = 'available' } = req.query;
    
    const requestedDate = new Date(date);
    const query = {
        shop: shopId,
        date: {
            $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
            $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
        }
    };
    
    if (barberId) {
        query.barber = barberId;
    }
    
    if (status) {
        query.status = status;
        if (status === 'available') {
            query.isBooked = false;
        }
    }
    
    const slots = await Slot.find(query)
        .populate('barber', 'name specialties experience')
        .populate('shop', 'name')
        .populate('bookedBy', 'name')
        .sort({ startTime: 1 });
    
    // Group slots by barber
    const slotsByBarber = slots.reduce((acc, slot) => {
        const barberId = slot.barber._id.toString();
        if (!acc[barberId]) {
            acc[barberId] = {
                barber: slot.barber,
                slots: []
            };
        }
        acc[barberId].slots.push(slot);
        return acc;
    }, {});
    
    res.status(200).json({
        success: true,
        count: slots.length,
        data: Object.values(slotsByBarber)
    });
});

// @desc    Block/Unblock a slot
// @route   PUT /api/slots/:slotId/block
// @access  Private (Barber/Admin)
const toggleSlotBlock = asyncHandler(async (req, res, next) => {
    const { slotId } = req.params;
    const { block = true, reason } = req.body;
    
    const slot = await Slot.findById(slotId);
    
    if (!slot) {
        return next(new ErrorResponse('Slot not found', 404));
    }
    
    // Check if user can modify this slot
    if (req.user.role === 'barber' && slot.barber.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to modify this slot', 403));
    }
    
    if (slot.isBooked) {
        return next(new ErrorResponse('Cannot block a booked slot', 400));
    }
    
    slot.status = block ? 'blocked' : 'available';
    await slot.save();
    
    res.status(200).json({
        success: true,
        message: `Slot ${block ? 'blocked' : 'unblocked'} successfully`,
        data: slot
    });
});

// Helper functions
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

module.exports = {
    generateSlots,
    getAvailableSlots,
    getShopSlots,
    toggleSlotBlock
};
