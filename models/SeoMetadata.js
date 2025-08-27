const mongoose = require('mongoose');

const seoMetadataSchema = new mongoose.Schema({
    pageIdentifier: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }, // e.g., 'home', 'about', 'contact', 'blog-list', etc.
    pageName: {
        type: String,
        required: true,
        trim: true
    }, // Human-readable page name
    metaTitle: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60
    },
    metaDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 160
    },
    ogTitle: {
        type: String,
        trim: true,
        maxlength: 60
    },
    ogDescription: {
        type: String,
        trim: true,
        maxlength: 160
    },
    socialMediaImage: {
        type: String,
        trim: true
    }, // URL or path to the image
    keywords: [{
        type: String,
        trim: true
    }],
    canonicalUrl: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Index for faster queries
seoMetadataSchema.index({ pageIdentifier: 1 });
seoMetadataSchema.index({ isActive: 1 });

module.exports = mongoose.model('SeoMetadata', seoMetadataSchema);
