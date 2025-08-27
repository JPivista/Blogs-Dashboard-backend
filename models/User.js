const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['superadmin', 'admin', 'user'],
            default: 'user',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        loginCount: {
            type: Number,
            default: 0,
        },
        loginHistory: [{
            timestamp: {
                type: Date,
                default: Date.now,
            },
            ipAddress: {
                type: String,
                required: true,
            },
            userAgent: {
                type: String,
                default: '',
            },
        }],
        settings: {
            darkMode: {
                type: Boolean,
                default: false,
            },
            twoFactorAuth: {
                type: Boolean,
                default: false,
            },
            emailNotifications: {
                type: Boolean,
                default: true,
            },
        },
    },
    { timestamps: true }
);

// 🔐 Hash password before saving (only if changed)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

// 🔍 Password comparison method
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// 📊 Update login statistics
userSchema.methods.updateLoginStats = function (ipAddress, userAgent) {
    this.lastLogin = new Date();
    this.loginCount += 1;

    // Add to login history (keep only last 20)
    this.loginHistory.push({
        timestamp: new Date(),
        ipAddress: ipAddress || 'Unknown',
        userAgent: userAgent || '',
    });

    // Keep only the last 20 logins
    if (this.loginHistory.length > 20) {
        this.loginHistory = this.loginHistory.slice(-20);
    }

    return this.save();
};

module.exports = mongoose.model('User', userSchema);
