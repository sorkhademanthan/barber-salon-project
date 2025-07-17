const Slot = require('../models/Slot');
const WorkingHours = require('../models/WorkingHours');

/**
 * Auto-generate slots for the next 7 days for all active barbers
 * This can be run as a cron job or called manually
 */
const autoGenerateSlots = async () => {
    try {
        console.log('🔄 Starting auto slot generation...');
        
        // Get all barbers with working hours
        const workingHours = await WorkingHours.find({ isAvailable: true })
            .populate('barber', 'name isActive')
            .populate('shop', 'name isActive');
        
        if (workingHours.length === 0) {
            console.log('⚠️ No working hours found for any barber');
            return;
        }
        
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 7); // Generate for next 7 days
        
        let totalSlotsGenerated = 0;
        
        // Group working hours by barber
        const barberHours = {};
        workingHours.forEach(wh => {
            if (!wh.barber.isActive || !wh.shop.isActive) return;
            
            const barberId = wh.barber._id.toString();
            if (!barberHours[barberId]) {
                barberHours[barberId] = {
                    barber: wh.barber,
                    shop: wh.shop,
                    hours: []
                };
            }
            barberHours[barberId].hours.push(wh);
        });
        
        // Generate slots for each barber
        for (const barberId in barberHours) {
            const { barber, shop, hours } = barberHours[barberId];
            
            const currentDate = new Date(today);
            while (currentDate <= endDate) {
                const dayOfWeek = currentDate.getDay();
                const workingHour = hours.find(h => h.dayOfWeek === dayOfWeek);
                
                if (workingHour) {
                    const daySlots = await generateSlotsForDay(
                        new Date(currentDate),
                        workingHour,
                        barber._id,
                        shop._id
                    );
                    
                    if (daySlots.length > 0) {
                        try {
                            await Slot.insertMany(daySlots, { ordered: false });
                            totalSlotsGenerated += daySlots.length;
                            console.log(`✅ Generated ${daySlots.length} slots for ${barber.name} on ${currentDate.toDateString()}`);
                        } catch (error) {
                            if (error.code !== 11000) { // Ignore duplicate key errors
                                console.error(`❌ Error generating slots for ${barber.name}:`, error.message);
                            }
                        }
                    }
                }
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        
        console.log(`🎉 Auto slot generation completed. Total slots generated: ${totalSlotsGenerated}`);
        return totalSlotsGenerated;
        
    } catch (error) {
        console.error('❌ Error in auto slot generation:', error);
        throw error;
    }
};

/**
 * Generate slots for a specific day
 */
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
    autoGenerateSlots,
    generateSlotsForDay
};
