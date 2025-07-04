const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const existing = await User.findOne({ email: 'sri_admin@domain.com' });
    if (!existing) {
        await User.create({
            name: 'Sri',
            email: 'sri_admin@domain.com',
            password: 'sri@123',
            role: 'superadmin',
        });
        console.log('Static Superadmin Created');
    } else {
        console.log('Superadmin already exists');
    }
    mongoose.disconnect();
});
