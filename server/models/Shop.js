const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Shop name is required'],
        trim: true,
        maxlength: [100, 'Shop name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required']
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    contact: {
        phone: {
            type: String,
            required: [true, 'Phone number is required']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true
        },
        website: String
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
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
    images: [{
        url: String,
        public_id: String
    }],
    workingHours: {
        monday: { open: String, close: String, closed: { type: Boolean, default: false } },
        tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
        wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
        thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
        friday: { open: String, close: String, closed: { type: Boolean, default: false } },
        saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
        sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
    },
    services: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Service'
    }],
    barbers: [{
        user: {
            type: mongoose.Schema.ObjectId,
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
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for better search performance
shopSchema.index({ name: 'text', description: 'text' });
shopSchema.index({ 'address.city': 1 });
shopSchema.index({ 'rating.average': -1 });
shopSchema.index({ 'address.coordinates': '2dsphere' });

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
    
    if (daySchedule.closed) return false;
    
    return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
};

// Method to get available time slots for a date
shopSchema.methods.getAvailableSlots = function(date) {
  const day = new Date(date).toLocaleDateString('en', { weekday: 'lowercase' });
  const daySchedule = this.operatingHours[day];
  
  if (daySchedule.isClosed) return [];
  
  const slots = [];
  const { slotDuration, bufferTime } = this.bookingSettings;
  const totalSlotTime = slotDuration + bufferTime;
  
  // Convert time strings to minutes for easier calculation
  const openMinutes = this.timeToMinutes(daySchedule.open);
  const closeMinutes = this.timeToMinutes(daySchedule.close);
  
  for (let time = openMinutes; time < closeMinutes; time += totalSlotTime) {
    slots.push(this.minutesToTime(time));
  }
  
  return slots;
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

// Update queue count and estimated wait time
shopSchema.methods.updateQueue = function(count, waitTime) {
  this.currentQueue.count = count;
  this.currentQueue.estimatedWaitTime = waitTime;
  this.currentQueue.lastUpdated = new Date();
  return this.save();
};

// Ensure virtual fields are serialized
shopSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Shop', shopSchema);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Update queue count and estimated wait time
shopSchema.methods.updateQueue = function(count, waitTime) {
  this.currentQueue.count = count;
  this.currentQueue.estimatedWaitTime = waitTime;
  this.currentQueue.lastUpdated = new Date();
  return this.save();
};

// Ensure virtual fields are serialized
shopSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Shop', shopSchema);
shopSchema.methods.updateQueue = function(count, waitTime) {
  this.currentQueue.count = count;
  this.currentQueue.estimatedWaitTime = waitTime;
  this.currentQueue.lastUpdated = new Date();
  return this.save();
};

// Ensure virtual fields are serialized
shopSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Shop', shopSchema);
