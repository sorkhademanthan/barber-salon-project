const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  customerNotes: {
    type: String,
    trim: true,
    maxlength: 300
  },
  qrCode: {
    type: String
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true,
    default: 30
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
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
  cancellationReason: {
    type: String,
    trim: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ shopId: 1 });
bookingSchema.index({ barberId: 1 });
bookingSchema.index({ scheduledTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ shopId: 1, scheduledTime: 1 });

// Virtual for booking duration
bookingSchema.virtual('actualDuration').get(function() {
  if (this.actualStartTime && this.actualEndTime) {
    return Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60)); // in minutes
  }
  return null;
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const scheduledTime = new Date(this.scheduledTime);
  const timeDiff = scheduledTime - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  // Can cancel if booking is more than 2 hours away and not completed
  return hoursDiff > 2 && !['completed', 'cancelled', 'no-show'].includes(this.status);
};

// Method to generate QR code data
bookingSchema.methods.generateQRData = function() {
  return {
    bookingId: this._id.toString(),
    customerId: this.customerId.toString(),
    shopId: this.shopId.toString(),
    scheduledTime: this.scheduledTime.toISOString(),
    type: 'booking-checkin'
  };
};

// Pre-save middleware to set total amount from service
bookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.totalAmount) {
    try {
      const Service = mongoose.model('Service');
      const service = await Service.findById(this.serviceId);
      if (service) {
        this.totalAmount = service.price;
        this.estimatedDuration = service.duration;
      }
    } catch (error) {
      console.error('Error setting booking amount:', error);
    }
  }
  next();
});

// Static method to get booking statistics
bookingSchema.statics.getStatistics = async function(shopId, startDate, endDate) {
  const matchStage = {
    shopId: mongoose.Types.ObjectId(shopId)
  };
  
  if (startDate && endDate) {
    matchStage.scheduledTime = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
