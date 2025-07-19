const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['Hair', 'Beard', 'Styling', 'Treatment', 'Package'],
        default: 'Hair'
    },
    icon: {
        type: String // Icon name or URL
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Specialty', specialtySchema);
