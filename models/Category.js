const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    type: {
        type: String,
        enum: ['main', 'sub'],
        required: true
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: function () { return this.type === 'sub'; }
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Auto-generate slug from name
categorySchema.pre('save', function (next) {
    if (this.isModified('name') && (!this.slug || this.slug === '')) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema); 