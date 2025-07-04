const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load environment variables from backend/.env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const promptUser = (query) => {
    return new Promise((resolve) => rl.question(query, resolve));
};

const setupSuperAdmin = async () => {
    try {
        await connectDB();

        console.log('--- Superadmin Setup ---');
        const email = await promptUser('Enter superadmin email: ');
        if (!email) {
            throw new Error('Email is required.');
        }

        const password = await promptUser('Enter superadmin password: ');
        if (!password) {
            throw new Error('Password is required.');
        }

        let superadmin = await User.findOne({ email });

        if (superadmin) {
            console.log('Superadmin with this email already exists. Updating password...');
            superadmin.password = password;
            superadmin.role = 'superadmin'; // Ensure role is correct
        } else {
            console.log('Creating new superadmin account...');
            superadmin = new User({
                name: 'Superadmin',
                email: email,
                password: password,
                role: 'superadmin',
            });
        }

        await superadmin.save();
        console.log('✅ Superadmin account has been successfully created/updated.');
        console.log('You can now log in with these credentials.');

    } catch (error) {
        console.error('❌ Error setting up superadmin:', error.message);
    } finally {
        rl.close();
        mongoose.disconnect();
    }
};

setupSuperAdmin(); 