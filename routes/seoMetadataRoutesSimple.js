const express = require('express');
const router = express.Router();

// Simple test route without middleware
router.get('/test', (req, res) => {
    res.json({ message: 'SEO metadata route is working!' });
});

// Simple route with basic controller
router.get('/simple', (req, res) => {
    res.json({
        message: 'Simple SEO metadata route',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
