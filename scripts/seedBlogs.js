const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const Category = require('../models/Category');
const User = require('../models/User');
require('dotenv').config();

const seedBlogs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find Dermatology category
        const dermatology = await Category.findOne({ name: 'Dermatology', type: 'main' });
        if (!dermatology) throw new Error('Dermatology category not found');

        // Find a superadmin user
        const superadmin = await User.findOne({ role: 'superadmin' });
        if (!superadmin) throw new Error('Superadmin user not found');

        // Create a test blog for Dermatology
        const blog = await Blog.create({
            title: 'Test Blog for Dermatology',
            slug: 'test-blog-dermatology',
            description: 'This is a test blog for Dermatology category.',
            mainCategory: dermatology._id,
            subcategories: [],
            status: 'published',
            createdBy: superadmin._id,
            publishedDate: new Date(),
        });
        console.log('Created blog:', blog.title);
    } catch (error) {
        console.error('Error seeding blog:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

seedBlogs(); 