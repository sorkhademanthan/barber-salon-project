const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: 'Shop',
    required: true
  },
  barber: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false // Can be assigned later
  },
  services: [{
    service: {
      type: String,
      required: true,
      enum: ['haircut', 'beard_trim', 'shave', 'hair_wash', 'styling', 'coloring', 'facial']
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    duration: {
      type: Number, // in minutes
      required: true
    }
  }],
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String, // Format: "HH:MM"
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalDuration: {
    type: Number, // Total time in minutes
    required: true
  },
  qrCode: {
    type: String, // Base64 encoded QR code
    required: false
  },
  checkInTime: Date,
  serviceStartTime: Date,
  serviceEndTime: Date,
  customerNotes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  barberNotes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    default: 'cash'
  },
  cancellationReason: String,
  cancellationTime: Date,
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
      maxlength: 300
    },
    createdAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
bookingSchema.index({ customer: 1, appointmentDate: -1 });
bookingSchema.index({ shop: 1, appointmentDate: 1 });
bookingSchema.index({ barber: 1, appointmentDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ appointmentDate: 1, appointmentTime: 1 });

// Compound index for unique booking per shop/date/time
bookingSchema.index(
  { shop: 1, appointmentDate: 1, appointmentTime: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $nin: ['cancelled', 'no_show'] } 
    }
  }
);

// Virtual for formatted appointment datetime
bookingSchema.virtual('appointmentDateTime').get(function() {
  const date = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
});

// Virtual for formatted date
bookingSchema.virtual('formattedDate').get(function() {
  return new Date(this.appointmentDate).toLocaleDateString('en-IN');
});

// Virtual for booking duration in hours and minutes
bookingSchema.virtual('durationFormatted').get(function() {
  const hours = Math.floor(this.totalDuration / 60);
  const minutes = this.totalDuration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Pre-save middleware to calculate total amount and duration
bookingSchema.pre('save', function(next) {
  if (this.isModified('services')) {
    this.totalAmount = this.services.reduce((sum, service) => sum + service.price, 0);
    this.totalDuration = this.services.reduce((sum, service) => sum + service.duration, 0);
  }
  next();
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentDateTime = this.appointmentDateTime;
  const timeDiff = appointmentDateTime - now;
  const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
  
  // Can cancel if more than 2 hours before appointment and status allows
  return hoursUntilAppointment > 2 && ['pending', 'confirmed'].includes(this.status);
};

// Method to check if booking can be rescheduled
bookingSchema.methods.canBeRescheduled = function() {
  const now = new Date();
  const appointmentDateTime = this.appointmentDateTime;
  const timeDiff = appointmentDateTime - now;
  const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
  
  // Can reschedule if more than 4 hours before appointment
  return hoursUntilAppointment > 4 && ['pending', 'confirmed'].includes(this.status);
};

// Method to generate booking summary
bookingSchema.methods.getSummary = function() {
  return {
    id: this._id,
    customerName: this.customer.name,
    shopName: this.shop.name,
    date: this.formattedDate,
    time: this.appointmentTime,
    services: this.services.map(s => s.service).join(', '),
    amount: this.totalAmount,
    duration: this.durationFormatted,
    status: this.status
  };
};

// Static method to get bookings for a specific date range
bookingSchema.statics.getBookingsInRange = function(shopId, startDate, endDate) {
  return this.find({
    shop: shopId,
    appointmentDate: {
      $gte: startDate,
      $lte: endDate
    },
    status: { $nin: ['cancelled', 'no_show'] }
  }).sort({ appointmentDate: 1, appointmentTime: 1 });
};

// Static method to check slot availability
bookingSchema.statics.isSlotAvailable = async function(shopId, date, time) {
  const existingBooking = await this.findOne({
    shop: shopId,
    appointmentDate: date,
    appointmentTime: time,
    status: { $nin: ['cancelled', 'no_show'] }
  });
  
  return !existingBooking;
};

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
