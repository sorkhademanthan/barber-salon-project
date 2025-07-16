const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    role: {
        type: String,
        enum: ['customer', 'barber', 'admin'],
        default: 'customer'
    },
    // Email verification fields
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    // Password reset fields
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Customer specific fields
    favoriteShops: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Shop'
    }],
    // Barber specific fields
    shop: {
        type: mongoose.Schema.ObjectId,
        ref: 'Shop',
        required: false  // Remove the function requirement
    },
    specialties: [{
        type: String,
        enum: ['haircut', 'beard', 'shave', 'styling', 'coloring']
    }],
    experience: {
        type: Number,
        min: 0,
        max: 50
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for fast querying
// userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

// Hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.verificationToken;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpire;
    return userObject;
};

// Virtual initials
userSchema.virtual('initials').get(function() {
    return this.name.split(' ').map(n => n[0]).join('').toUpperCase();
});

// Include virtuals in JSON
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
module.exports = mongoose.model('User', userSchema);
