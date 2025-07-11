const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = require('../utils/generateToken'); // assuming you have this

exports.register = async (req, res) => {
    const { name, email, password } = req.body; // Role is intentionally omitted

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // All public registrations are for 'user' role only.
        const user = await User.create({
            name,
            email,
            password,
            role: 'user',
        });

        // Log in the new user automatically
        const token = generateToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 86400000, // 24 hours
        });

        res.status(201).json({
            message: 'User registered successfully.',
            user: { id: user._id, email: user.email, role: user.role },
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log("coming here1");
    console.log(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Update login statistics with IP and user agent
    await user.updateLoginStats(ipAddress, userAgent);

    const jwtToken = generateToken(user._id);
    res.cookie('token', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
    });

    res.json({
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            lastLogin: user.lastLogin,
            loginCount: user.loginCount,
            settings: user.settings
        }
    });
};

exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    });
    res.json({ message: 'Logged out successfully' });
};
