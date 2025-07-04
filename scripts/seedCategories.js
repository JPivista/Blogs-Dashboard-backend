const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const seedCategories = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('Cleared existing categories');

        // Create main categories
        const plasticSurgery = await Category.create({
            name: 'Plastic Surgery',
            type: 'main',
            description: 'Plastic surgery procedures and treatments'
        });

        const dermatology = await Category.create({
            name: 'Dermatology',
            type: 'main',
            description: 'Dermatological treatments and procedures'
        });

        console.log('Created main categories');

        // Create subcategories for Plastic Surgery
        const plasticSurgerySubs = [
            'Rhinoplasty',
            'Liposuction',
            'Breast Augmentation',
            'Facelift',
            'Tummy Tuck',
            'Blepharoplasty'
        ];

        for (const subName of plasticSurgerySubs) {
            await Category.create({
                name: subName,
                type: 'sub',
                parentCategory: plasticSurgery._id,
                description: `${subName} procedure`
            });
        }

        // Create subcategories for Dermatology
        const dermatologySubs = [
            'Acne Treatment',
            'Laser Hair Removal',
            'Chemical Peels',
            'PRP Therapy',
            'Skin Rejuvenation',
            'Scar Revision'
        ];

        for (const subName of dermatologySubs) {
            await Category.create({
                name: subName,
                type: 'sub',
                parentCategory: dermatology._id,
                description: `${subName} treatment`
            });
        }

        console.log('Created subcategories');
        console.log('Category seeding completed successfully!');

        // Display created categories
        const allCategories = await Category.find({}).populate('parentCategory', 'name');
        console.log('\nCreated categories:');
        allCategories.forEach(cat => {
            if (cat.type === 'main') {
                console.log(`- ${cat.name} (Main)`);
            } else {
                console.log(`  └─ ${cat.name} (Sub of ${cat.parentCategory.name})`);
            }
        });

    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the seeding
seedCategories(); 