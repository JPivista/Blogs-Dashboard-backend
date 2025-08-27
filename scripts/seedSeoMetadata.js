const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SeoMetadata = require('../models/SeoMetadata');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const connectDB = require('../config/db');

const initialSeoMetadata = [
    {
        pageIdentifier: 'home',
        pageName: 'Home Page',
        metaTitle: 'Nypunya Aesthetics - Premium Beauty & Wellness Solutions',
        metaDescription: 'Discover premium beauty and wellness solutions at Nypunya Aesthetics. Expert treatments, personalized care, and transformative results for your beauty journey.',
        ogTitle: 'Nypunya Aesthetics - Premium Beauty & Wellness Solutions',
        ogDescription: 'Transform your beauty journey with expert treatments and personalized care at Nypunya Aesthetics.',
        keywords: ['beauty', 'wellness', 'aesthetics', 'treatments', 'skincare', 'beauty clinic'],
        canonicalUrl: 'https://nypunyaaesthetics.com',
        isActive: true
    },
    {
        pageIdentifier: 'about',
        pageName: 'About Us',
        metaTitle: 'About Nypunya Aesthetics - Our Story & Mission',
        metaDescription: 'Learn about Nypunya Aesthetics journey, our mission to provide premium beauty solutions, and the team of experts behind our success.',
        ogTitle: 'About Nypunya Aesthetics - Our Story & Mission',
        ogDescription: 'Discover the story behind Nypunya Aesthetics and our commitment to premium beauty solutions.',
        keywords: ['about us', 'our story', 'mission', 'team', 'expertise', 'beauty clinic'],
        canonicalUrl: 'https://nypunyaaesthetics.com/about',
        isActive: true
    },
    {
        pageIdentifier: 'services',
        pageName: 'Our Services',
        metaTitle: 'Beauty & Wellness Services - Nypunya Aesthetics',
        metaDescription: 'Explore our comprehensive range of beauty and wellness services including skincare, treatments, and personalized beauty solutions.',
        ogTitle: 'Beauty & Wellness Services - Nypunya Aesthetics',
        ogDescription: 'Comprehensive beauty and wellness services tailored to your unique needs.',
        keywords: ['beauty services', 'wellness treatments', 'skincare', 'beauty procedures', 'treatments'],
        canonicalUrl: 'https://nypunyaaesthetics.com/services',
        isActive: true
    },
    {
        pageIdentifier: 'contact',
        pageName: 'Contact Us',
        metaTitle: 'Contact Nypunya Aesthetics - Get In Touch',
        metaDescription: 'Contact Nypunya Aesthetics for consultations, appointments, and inquiries. We\'re here to help with your beauty and wellness needs.',
        ogTitle: 'Contact Nypunya Aesthetics - Get In Touch',
        ogDescription: 'Get in touch with us for consultations and appointments.',
        keywords: ['contact', 'appointments', 'consultations', 'inquiries', 'location', 'phone'],
        canonicalUrl: 'https://nypunyaaesthetics.com/contact',
        isActive: true
    },
    {
        pageIdentifier: 'blog-list',
        pageName: 'Blog & Articles',
        metaTitle: 'Beauty & Wellness Blog - Nypunya Aesthetics',
        metaDescription: 'Read expert insights, beauty tips, and wellness advice from our team of professionals at Nypunya Aesthetics.',
        ogTitle: 'Beauty & Wellness Blog - Nypunya Aesthetics',
        ogDescription: 'Expert insights and tips for your beauty and wellness journey.',
        keywords: ['blog', 'articles', 'beauty tips', 'wellness advice', 'expert insights'],
        canonicalUrl: 'https://nypunyaaesthetics.com/blog',
        isActive: true
    },
    {
        pageIdentifier: 'gallery',
        pageName: 'Treatment Gallery',
        metaTitle: 'Before & After Gallery - Nypunya Aesthetics',
        metaDescription: 'View our impressive before and after results showcasing the transformative power of our beauty and wellness treatments.',
        ogTitle: 'Before & After Gallery - Nypunya Aesthetics',
        ogDescription: 'See the amazing transformations from our beauty and wellness treatments.',
        keywords: ['gallery', 'before after', 'results', 'transformations', 'treatments', 'beauty'],
        canonicalUrl: 'https://nypunyaaesthetics.com/gallery',
        isActive: true
    },
    {
        pageIdentifier: 'testimonials',
        pageName: 'Client Testimonials',
        metaTitle: 'Client Testimonials - Nypunya Aesthetics Reviews',
        metaDescription: 'Read authentic reviews and testimonials from our satisfied clients about their experiences with Nypunya Aesthetics treatments.',
        ogTitle: 'Client Testimonials - Nypunya Aesthetics Reviews',
        ogDescription: 'Real stories from our satisfied clients about their beauty transformations.',
        keywords: ['testimonials', 'reviews', 'client feedback', 'satisfaction', 'experiences'],
        canonicalUrl: 'https://nypunyaaesthetics.com/testimonials',
        isActive: true
    },
    {
        pageIdentifier: 'appointments',
        pageName: 'Book Appointment',
        metaTitle: 'Book Your Appointment - Nypunya Aesthetics',
        metaDescription: 'Schedule your beauty consultation or treatment appointment with Nypunya Aesthetics. Easy online booking available.',
        ogTitle: 'Book Your Appointment - Nypunya Aesthetics',
        ogDescription: 'Schedule your beauty consultation or treatment appointment today.',
        keywords: ['appointments', 'booking', 'consultations', 'schedule', 'online booking'],
        canonicalUrl: 'https://nypunyaaesthetics.com/appointments',
        isActive: true
    }
];

const seedSeoMetadata = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('Connected to database');

        // Find a super admin user to assign as creator
        const superAdmin = await User.findOne({ role: 'superadmin' });
        if (!superAdmin) {
            console.error('No super admin user found. Please create one first.');
            process.exit(1);
        }

        // Clear existing SEO metadata
        await SeoMetadata.deleteMany({});
        console.log('Cleared existing SEO metadata');

        // Create new SEO metadata entries
        const seoMetadataEntries = initialSeoMetadata.map(metadata => ({
            ...metadata,
            createdBy: superAdmin._id,
            lastUpdatedBy: superAdmin._id
        }));

        await SeoMetadata.insertMany(seoMetadataEntries);
        console.log(`Successfully seeded ${seoMetadataEntries.length} SEO metadata entries`);

        // Display created entries
        const createdEntries = await SeoMetadata.find({}).populate('createdBy', 'name email');
        console.log('\nCreated SEO metadata entries:');
        createdEntries.forEach(entry => {
            console.log(`- ${entry.pageName} (${entry.pageIdentifier})`);
        });

        console.log('\nSEO metadata seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding SEO metadata:', error);
        process.exit(1);
    }
};

// Run the seeding function
seedSeoMetadata();
