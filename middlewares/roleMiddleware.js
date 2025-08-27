// middlewares/roleMiddleware.js

const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        console.log('Role Check - User:', req.user ? req.user.role : 'No user');
        console.log('Role Check - Allowed Roles:', allowedRoles);

        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Access denied',
                userRole: req.user.role,
                allowedRoles: allowedRoles
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
