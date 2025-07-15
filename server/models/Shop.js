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
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
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
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere' // For geospatial queries
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    },
    whatsapp: String
  },
  images: [{
    url: String,
    caption: String
  }],
  services: [{
    name: {
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
      required: true,
      min: 15,
      max: 180
    },
    description: String
  }],
  operatingHours: {
    monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isClosed: { type: Boolean, default: false } }
  },
  currentQueue: {
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    estimatedWaitTime: {
      type: Number, // in minutes
      default: 0,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
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
  amenities: [{
    type: String,
    enum: ['wifi', 'ac', 'parking', 'card_payment', 'upi', 'waiting_area', 'tv']
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
      default: 30, // minutes
      min: 15,
      max: 60
    },
    bufferTime: {
      type: Number,
      default: 5, // minutes between bookings
      min: 0,
      max: 30
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  socialMedia: {
    instagram: String,
    facebook: String,
    website: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
shopSchema.index({ location: '2dsphere' });
shopSchema.index({ 'address.city': 1 });
shopSchema.index({ 'address.pincode': 1 });
shopSchema.index({ 'rating.average': -1 });
shopSchema.index({ isActive: 1 });

// Virtual for full address
shopSchema.virtual('fullAddress').get(function() {
  const { street, city, state, pincode } = this.address;
  return `${street}, ${city}, ${state} - ${pincode}`;
});

// Method to check if shop is open now
shopSchema.methods.isOpenNow = function() {
  const now = new Date();
  const day = now.toLocaleLowerCase().slice(0, 3); // mon, tue, etc.
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const daySchedule = this.operatingHours[day];
  
  if (daySchedule.isClosed) return false;
  
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
