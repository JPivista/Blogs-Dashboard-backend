const Blog = require('../models/Blog');
const User = require('../models/User');
const path = require('path');
const mongoose = require('mongoose');
const slugify = require('slugify');

// List blogs (paginated)
exports.listBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find({})
            .populate('mainCategory', 'name')
            .populate('subcategories', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments({});

        res.json({
            blogs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs', error: error.message });
    }
};

// Get single blog by id or slug
exports.getBlog = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        let blog;

        if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
            blog = await Blog.findById(idOrSlug)
                .populate('mainCategory', 'name')
                .populate('subcategories', 'name')
                .populate('createdBy', 'name');
        } else {
            blog = await Blog.findOne({ slug: idOrSlug })
                .populate('mainCategory', 'name')
                .populate('subcategories', 'name')
                .populate('createdBy', 'name');
        }

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blog', error: error.message });
    }
};

// Create blog (superadmin only)
exports.createBlog = async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Not authorized' });
        const {
            title,
            slug,
            description,
            metaTitle,
            metaDescription,
            publishedDate,
            status,
            mainCategory,
            tags
        } = req.body;

        // Handle subcategories (may be array or string)
        let subcategories = req.body.subcategories;
        if (typeof subcategories === 'string') {
            subcategories = [subcategories];
        }

        // Handle tags (may be array or string)
        let tagsArray = tags;
        if (typeof tagsArray === 'string') {
            tagsArray = [tagsArray];
        }

        // Slug logic: only auto-generate from title if slug is empty
        let finalSlug = slug && slug.trim() !== '' ? slugify(slug, { lower: true, strict: true }) : '';
        if (!finalSlug) {
            finalSlug = slugify(title, { lower: true, strict: true });
        }
        // Check for duplicate slug
        const existing = await Blog.findOne({ slug: finalSlug });
        if (existing) return res.status(400).json({ message: 'Slug already exists. Please choose a different slug.' });

        const blog = new Blog({
            title,
            slug: finalSlug,
            description,
            metaTitle,
            metaDescription,
            publishedDate,
            status: status || 'draft',
            mainCategory,
            subcategories,
            tags: tagsArray,
            createdBy: req.user._id,
        });
        // Handle images
        if (req.files) {
            if (req.files.banner) blog.banner = '/uploads/' + req.files.banner[0].filename;
            if (req.files.thumbnail) blog.thumbnail = '/uploads/' + req.files.thumbnail[0].filename;
            if (req.files.mobileBanner) blog.mobileBanner = '/uploads/' + req.files.mobileBanner[0].filename;
        }
        blog.updates.push({ user: req.user._id, change: 'Created' });
        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        res.status(500).json({ message: 'Error creating blog', error: err.message });
    }
};

// Update blog (superadmin only)
exports.updateBlog = async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Not authorized' });
        const { idOrSlug } = req.params;
        const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
        const query = isObjectId
            ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
            : { slug: idOrSlug };
        const blog = await Blog.findOne(query);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        const {
            title,
            slug,
            description,
            metaTitle,
            metaDescription,
            publishedDate,
            status,
            mainCategory,
            tags
        } = req.body;

        // Handle subcategories (may be array or string)
        let subcategories = req.body.subcategories;
        if (typeof subcategories === 'string') {
            subcategories = [subcategories];
        }

        // Handle tags (may be array or string)
        let tagsArray = tags;
        if (typeof tagsArray === 'string') {
            tagsArray = [tagsArray];
        }

        // Slug update logic: only update if slug is provided and different
        if (typeof slug === 'string' && slug.trim() !== '' && slug !== blog.slug) {
            const newSlug = slugify(slug, { lower: true, strict: true });
            // Check for duplicate slug
            const existing = await Blog.findOne({ slug: newSlug });
            if (existing && existing._id.toString() !== blog._id.toString()) {
                return res.status(400).json({ message: 'Slug already exists. Please choose a different slug.' });
            }
            blog.slug = newSlug;
        }

        if (title) blog.title = title;
        if (description) blog.description = description;
        if (metaTitle) blog.metaTitle = metaTitle;
        if (metaDescription) blog.metaDescription = metaDescription;
        if (publishedDate) blog.publishedDate = publishedDate;
        if (status) blog.status = status;
        if (mainCategory) blog.mainCategory = mainCategory;
        if (subcategories) blog.subcategories = subcategories;
        if (tagsArray) blog.tags = tagsArray;
        // Handle images
        if (req.files) {
            if (req.files.banner) blog.banner = '/uploads/' + req.files.banner[0].filename;
            if (req.files.thumbnail) blog.thumbnail = '/uploads/' + req.files.thumbnail[0].filename;
            if (req.files.mobileBanner) blog.mobileBanner = '/uploads/' + req.files.mobileBanner[0].filename;
        }
        blog.updates.push({ user: req.user._id, change: 'Updated' });
        await blog.save();
        res.json(blog);
    } catch (err) {
        console.error('Error updating blog:', err);
        console.error('Request body:', req.body);
        if (err.stack) console.error(err.stack);
        res.status(500).json({ message: 'Error updating blog', error: err.message });
    }
};

// Delete blog (superadmin only)
exports.deleteBlog = async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Not authorized' });
        const { idOrSlug } = req.params;
        const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
        const query = isObjectId
            ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }
            : { slug: idOrSlug };
        const blog = await Blog.findOneAndDelete(query);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json({ message: 'Blog deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting blog', error: err.message });
    }
};

// Get blog statistics (superadmin only)
exports.getBlogStats = async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') return res.status(403).json({ message: 'Not authorized' });

        // Calculate date for last month
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        // Get total blogs
        const totalBlogs = await Blog.countDocuments({});

        // Get blogs updated in last month
        const blogsUpdatedLastMonth = await Blog.countDocuments({
            updatedAt: { $gte: lastMonth }
        });

        res.json({
            totalBlogs,
            blogsUpdatedLastMonth
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching blog statistics', error: err.message });
    }
};

module.exports = exports; 