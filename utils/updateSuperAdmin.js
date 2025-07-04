require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function updateSuperAdmin() {
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI not set in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const email = 'sri_admin@domain.com';
    const plainPassword = 'sri@123';

    let superadmin = await User.findOne({ email });

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    if (!superadmin) {
        superadmin = await User.create({
            name: 'Sri Admin',
            email,
            password: hashedPassword,
            role: 'superadmin',
        });
        console.log('✅ Superadmin created');
    } else {
        // Update password if needed
        const isSame = await bcrypt.compare(plainPassword, superadmin.password);
        if (!isSame) {
            superadmin.password = hashedPassword;
            await superadmin.save();
            console.log('🔁 Superadmin password updated');
        } else {
            console.log('ℹ️ Superadmin already exists with correct password');
        }
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected');
}

updateSuperAdmin().catch((err) => {
    console.error('❌ Error creating superadmin:', err);
});
