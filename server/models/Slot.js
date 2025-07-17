const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: [true, 'Date is required']
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
    isBooked: {
        type: Boolean,
        default: false
    },
    bookedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null
    },
    booking: {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking',
        default: null
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'blocked'],
        default: 'available'
    },
    services: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Service'
    }],
    estimatedDuration: {
        type: Number,
        default: 30 // minutes
    }
}, {
    timestamps: true
});

// Compound index to ensure unique slots
slotSchema.index({ barber: 1, date: 1, startTime: 1 }, { unique: true });
slotSchema.index({ shop: 1, date: 1 });
slotSchema.index({ date: 1, status: 1 });

// Virtual for formatted date
slotSchema.virtual('formattedDate').get(function() {
    return this.date.toISOString().split('T')[0];
});

// Virtual for slot duration in minutes
slotSchema.virtual('duration').get(function() {
    const start = this.timeToMinutes(this.startTime);
    const end = this.timeToMinutes(this.endTime);
    return end - start;
});

// Method to check if slot is available
slotSchema.methods.isAvailable = function() {
    return this.status === 'available' && !this.isBooked && this.date >= new Date();
};

// Helper method to convert time string to minutes
slotSchema.methods.timeToMinutes = function(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Method to book the slot
slotSchema.methods.bookSlot = function(userId, bookingId) {
    this.isBooked = true;
    this.bookedBy = userId;
    this.booking = bookingId;
    this.status = 'booked';
    return this.save();
};

// Method to cancel booking
slotSchema.methods.cancelBooking = function() {
    this.isBooked = false;
    this.bookedBy = null;
    this.booking = null;
    this.status = 'available';
    return this.save();
};

slotSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Slot', slotSchema);
