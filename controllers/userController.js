const User = require('../models/User');

// Only Superadmin can use these:
exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    // A superadmin can create 'superadmin', 'admin', or 'user'
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Not authorized to create users' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role });
    res.status(201).json({ message: 'User created successfully', user });
};

exports.updateUser = async (req, res) => {
    // Superadmin can update any user
    const { name, email, role } = req.body;
    try {
        // Prevent superadmin from changing their own role to non-superadmin
        if (req.params.id === req.user.id && role !== 'superadmin') {
            return res.status(403).json({ message: 'You cannot change your own role from superadmin' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { name, email, role }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated successfully by superadmin', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    // Prevent deletion of the main superadmin
    const protectedSuperadminEmail = 'sri_admin@domain.com';
    const userToDelete = await User.findById(req.params.id);
    if (userToDelete && userToDelete.email === protectedSuperadminEmail) {
        return res.status(403).json({ message: 'This superadmin cannot be deleted via the API.' });
    }

    // Prevent superadmin from deleting themselves
    if (req.params.id === req.user.id) {
        return res.status(403).json({ message: 'You cannot delete your own account.' });
    }

    // Superadmin can delete any other user
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully by superadmin' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// Admins can only update normal users:
exports.updateUserDetailsOnly = async (req, res) => {
    try {
        const userToUpdate = await User.findById(req.params.id);

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Admin can only update users with 'user' role
        if (req.user.role === 'admin' && userToUpdate.role !== 'user') {
            return res.status(403).json({ message: 'Admins are not allowed to edit admins or superadmins.' });
        }

        const { name, email } = req.body;
        userToUpdate.name = name || userToUpdate.name;
        userToUpdate.email = email || userToUpdate.email;

        await userToUpdate.save();

        res.json({ message: 'User details updated successfully by admin', user: userToUpdate });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user details', error: error.message });
    }
};

// Admins can create only users (not admins or superadmins)
exports.adminCreateUser = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can use this endpoint.' });
    }
    const { name, email, password, role } = req.body;
    if (role && role !== 'user') {
        return res.status(403).json({ message: 'Admins can only create users, not admins or superadmins.' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password, role: 'user' });
    res.status(201).json({ message: 'User created successfully by admin', user });
};

// List all users (for admin and superadmin)
exports.listUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json({
            users: users.map(user => ({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin,
                loginCount: user.loginCount,
                createdAt: user.createdAt,
                loginHistory: user.loginHistory || []
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Profile management functions
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id;

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true, select: '-password' }
        );

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin,
                loginCount: user.loginCount,
                createdAt: user.createdAt,
                settings: user.settings,
                loginHistory: user.loginHistory || []
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { darkMode, twoFactorAuth, emailNotifications } = req.body;
        const userId = req.user.id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                'settings.darkMode': darkMode,
                'settings.twoFactorAuth': twoFactorAuth,
                'settings.emailNotifications': emailNotifications
            },
            { new: true, select: '-password' }
        );

        res.json({
            message: 'Settings updated successfully',
            settings: updatedUser.settings
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
};

exports.getLoginHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('loginHistory');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ loginHistory: user.loginHistory || [] });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching login history', error: error.message });
    }
};
