const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // Remove 'unique: true' since we're indexing it below
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number]
      // Remove the index: '2dsphere' from here
    }
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    website: {
      type: String
    }
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  barbers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    specialties: [{
      type: String,
      enum: ['haircut', 'beard', 'shave', 'styling', 'coloring']
    }],
    experience: Number
  }],
  workingHours: {
    monday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
    thursday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
    friday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
    saturday: { start: String, end: String, isOpen: { type: Boolean, default: true } },
    sunday: { start: String, end: String, isOpen: { type: Boolean, default: false } }
  },
  currentQueue: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    estimatedWaitTime: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  features: [{
    type: String,
    enum: ['wifi', 'parking', 'card_payment', 'cash_only', 'appointments', 'walk_ins', 'ac', 'upi', 'waiting_area', 'tv']
  }],
  bookingSettings: {
    allowOnlineBooking: {
      type: Boolean,
      default: true
    },
    maxAdvanceBookingDays: {
      type: Number,
      default: 7,
      min: 1,
      max: 30
    },
    slotDuration: {
      type: Number,
      default: 30,
      min: 15,
      max: 60
    },
    bufferTime: {
      type: Number,
      default: 5,
      min: 0,
      max: 30
    }
  },
  socialMedia: {
    instagram: String,
    facebook: String,
    website: String
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  isSetupComplete: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance - keep only one ownerId index
shopSchema.index({ ownerId: 1 }, { unique: true });
shopSchema.index({ name: 'text', description: 'text' });
shopSchema.index({ 'address.city': 1 });
shopSchema.index({ 'rating.average': -1 });
shopSchema.index({ status: 1 });

// Virtual for full address
shopSchema.virtual('fullAddress').get(function() {
    const { street, city, state, zipCode } = this.address;
    return `${street}, ${city}, ${state} - ${zipCode}`;
});

// Method to check if shop is open now
shopSchema.methods.isOpenNow = function() {
    const now = new Date();
    const dayName = now.toLocaleDateString('en', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5);
    
    const daySchedule = this.workingHours[dayName];
    
    if (!daySchedule.isOpen) return false;
    
    return currentTime >= daySchedule.start && currentTime <= daySchedule.end;
};

// Update queue method
shopSchema.methods.updateQueue = function(count, waitTime) {
    this.currentQueue.count = count;
    this.currentQueue.estimatedWaitTime = waitTime;
    this.currentQueue.lastUpdated = new Date();
    return this.save();
};

// Helper method to convert time string to minutes
shopSchema.methods.timeToMinutes = function(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper method to convert minutes to time string
shopSchema.methods.minutesToTime = function(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Ensure virtual fields are serialized
shopSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Shop', shopSchema);
