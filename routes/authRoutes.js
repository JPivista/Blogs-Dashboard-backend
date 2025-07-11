const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
console.log("coming here");
// Auth
router.post('/login', login); // IP restriction removed for simplicity
router.post('/logout', logout);
// Public registration for the first user, otherwise protected.
// The controller logic now handles the authorization.
router.post('/register', register);

// Profile
router.get('/profile', protect, (req, res) => {
    console.log('Profile accessed by:', req.user);
    res.json({ user: req.user });
});

module.exports = router;
