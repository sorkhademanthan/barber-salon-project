const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Specialty name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Specialty name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    icon: {
        type: String,
        default: '✂️'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for better search performance
specialtySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Specialty', specialtySchema);
