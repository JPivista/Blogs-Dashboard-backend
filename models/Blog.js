const mongoose = require('mongoose');
const slugify = require('slugify');

const updateSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    change: { type: String },
});

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String }, // HTML allowed
    categories: [{ type: String }],
    metaTitle: { type: String },
    metaDescription: { type: String },
    publishedDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'draft'
    },
    banner: { type: String }, // URL or path
    thumbnail: { type: String },
    mobileBanner: { type: String },
    updates: [updateSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mainCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    tags: [{ type: String }],
}, { timestamps: true });

blogSchema.pre('save', function (next) {
    // Only auto-generate slug from title if slug is empty
    if (this.isModified('title') && (!this.slug || this.slug === '')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('Blog', blogSchema); 