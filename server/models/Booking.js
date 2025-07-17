const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Customer is required']
    },
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
    slot: {
        type: mongoose.Schema.ObjectId,
        ref: 'Slot',
        required: [true, 'Slot is required']
    },
    services: [{
        service: {
            type: mongoose.Schema.ObjectId,
            ref: 'Service',
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'online'],
        default: 'cash'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    customerNotes: {
        type: String,
        maxlength: [300, 'Customer notes cannot exceed 300 characters']
    },
    cancelReason: {
        type: String,
        maxlength: [200, 'Cancel reason cannot exceed 200 characters']
    },
    cancelledBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    cancelledAt: {
        type: Date
    },
    confirmedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        maxlength: [500, 'Review cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Index for better query performance
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ barber: 1, createdAt: -1 });
bookingSchema.index({ shop: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ slot: 1 });

// Virtual for booking date from slot
bookingSchema.virtual('bookingDate').get(function() {
    return this.slot?.date || this.createdAt;
});

// Method to confirm booking
bookingSchema.methods.confirm = function() {
    this.status = 'confirmed';
    this.confirmedAt = new Date();
    return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = function(reason, cancelledBy) {
    this.status = 'cancelled';
    this.cancelReason = reason;
    this.cancelledBy = cancelledBy;
    this.cancelledAt = new Date();
    return this.save();
};

// Method to complete booking
bookingSchema.methods.complete = function() {
    this.status = 'completed';
    this.completedAt = new Date();
    return this.save();
};

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
    const now = new Date();
    const bookingTime = new Date(this.slot?.date);
    const hoursDifference = (bookingTime - now) / (1000 * 60 * 60);
    
    // Can cancel if booking is more than 2 hours away and not completed
    return hoursDifference > 2 && ['pending', 'confirmed'].includes(this.status);
};

bookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
