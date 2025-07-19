const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
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
  category: {
    type: String,
    required: true,
    enum: ['Hair', 'Beard', 'Styling', 'Treatment', 'Package']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15
  },
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String // Cloudinary URL
  }
}, {
  timestamps: true
});

// Compound index for shop services
serviceSchema.index({ shopId: 1, category: 1 });
serviceSchema.index({ shopId: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
