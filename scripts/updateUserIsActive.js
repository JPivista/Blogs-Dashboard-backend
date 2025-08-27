const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updateUserIsActive = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Update all existing users to have isActive: true
        const result = await User.updateMany(
            { isActive: { $exists: false } },
            { $set: { isActive: true } }
        );

        console.log(`✅ Updated ${result.modifiedCount} users with isActive field`);

        // Verify the update
        const users = await User.find({});
        console.log(`📊 Total users: ${users.length}`);

        users.forEach(user => {
            console.log(`👤 User: ${user.email}, Role: ${user.role}, isActive: ${user.isActive}`);
        });

        console.log('✅ User update completed successfully');

    } catch (error) {
        console.error('❌ Error updating users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run the script
updateUserIsActive();
