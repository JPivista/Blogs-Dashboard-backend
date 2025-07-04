const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const {
    createUser,
    updateUser,
    deleteUser,
    updateUserDetailsOnly,
    adminCreateUser,
    listUsers,
    updateProfile,
    changePassword,
    getProfile,
    updateSettings,
    getLoginHistory,
} = require('../controllers/userController');

// 🔐 Only Superadmin can create, update, delete any user or admin
router.post('/create', protect, roleMiddleware('superadmin'), createUser);
router.put('/update/:id', protect, roleMiddleware('superadmin'), updateUser);
router.delete('/delete/:id', protect, roleMiddleware('superadmin'), deleteUser);

// 🛠️ Admins can only update normal users
router.put('/edit-user/:id', protect, roleMiddleware('admin'), updateUserDetailsOnly);

// Admins can create users (not admins or superadmins)
router.post('/admin-create', protect, roleMiddleware('admin'), adminCreateUser);

// List all users (for admin and superadmin)
router.get('/list', protect, roleMiddleware('admin', 'superadmin'), listUsers);

// Profile management routes (for all authenticated users)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/settings', protect, updateSettings);
router.get('/login-history', protect, getLoginHistory);

module.exports = router;
