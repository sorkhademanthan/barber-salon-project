const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Service price is required'],
        min: [0, 'Price cannot be negative']
    },
    duration: {
        type: Number,
        required: [true, 'Service duration is required'],
        min: [15, 'Duration must be at least 15 minutes'],
        max: [480, 'Duration cannot exceed 8 hours']
    },
    category: {
        type: String,
        required: [true, 'Service category is required'],
        enum: ['haircut', 'beard', 'shave', 'styling', 'coloring', 'facial', 'massage', 'other']
    },
    shop: {
        type: mongoose.Schema.ObjectId,
        ref: 'Shop',
        required: true
    },
    image: {
        url: String,
        public_id: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    popularity: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Index for better performance
serviceSchema.index({ shop: 1, category: 1 });
serviceSchema.index({ name: 'text', description: 'text' });
serviceSchema.index({ price: 1 });
serviceSchema.index({ popularity: -1 });

module.exports = mongoose.model('Service', serviceSchema);
