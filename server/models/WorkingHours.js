const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
    barber: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Barber is required']
    },
    shop: {
        type: mongoose.Schema.ObjectId,
        ref: 'Shop',
        required: [true, 'Shop is required']
    },
    dayOfWeek: {
        type: Number,
        required: [true, 'Day of week is required'],
        min: 0, // Sunday
        max: 6, // Saturday
        enum: [0, 1, 2, 3, 4, 5, 6]
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
    },
    breakStartTime: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Break start time must be in HH:MM format']
    },
    breakEndTime: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Break end time must be in HH:MM format']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    slotDuration: {
        type: Number,
        default: 30, // minutes
        min: 15,
        max: 120
    }
}, {
    timestamps: true
});

// Compound index to ensure one working hour per barber per day
workingHoursSchema.index({ barber: 1, dayOfWeek: 1 }, { unique: true });

// Virtual for day name
workingHoursSchema.virtual('dayName').get(function() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[this.dayOfWeek];
});

// Method to check if a time is within working hours
workingHoursSchema.methods.isTimeInWorkingHours = function(time) {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(this.startTime);
    const endMinutes = this.timeToMinutes(this.endTime);
    
    // Check if time is within working hours
    if (timeMinutes < startMinutes || timeMinutes >= endMinutes) {
        return false;
    }
    
    // Check if time is during break
    if (this.breakStartTime && this.breakEndTime) {
        const breakStartMinutes = this.timeToMinutes(this.breakStartTime);
        const breakEndMinutes = this.timeToMinutes(this.breakEndTime);
        
        if (timeMinutes >= breakStartMinutes && timeMinutes < breakEndMinutes) {
            return false;
        }
    }
    
    return true;
};

// Helper method to convert time string to minutes
workingHoursSchema.methods.timeToMinutes = function(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

workingHoursSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('WorkingHours', workingHoursSchema);
