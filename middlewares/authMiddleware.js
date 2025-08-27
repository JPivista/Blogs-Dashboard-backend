const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: 'Not authenticated',
            code: 'NO_TOKEN'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        // Check if user still exists
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Check if user is active (only if field exists)
        if (user.isActive === false) {
            return res.status(401).json({
                message: 'User account is deactivated',
                code: 'USER_DEACTIVATED'
            });
        }

        req.user = user;
        console.log('User authenticated:', user.email, 'Role:', user.role);
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }

        res.status(401).json({
            message: 'Authentication failed',
            code: 'AUTH_FAILED'
        });
    }
};

module.exports = protect;
