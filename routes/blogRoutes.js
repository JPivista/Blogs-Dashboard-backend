const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const blogController = require('../controllers/blogController');
const protect = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Multer config for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, ''));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// List blogs (paginated)
router.get('/', blogController.listBlogs);
// Get blog statistics (superadmin only)
router.get('/stats', protect, roleMiddleware('superadmin'), blogController.getBlogStats);
// Get single blog by id or slug
router.get('/:idOrSlug', blogController.getBlog);
// Create blog (superadmin only)
router.post('/', protect, roleMiddleware('superadmin'), upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'mobileBanner', maxCount: 1 },
]), blogController.createBlog);
// Update blog (superadmin only)
router.put('/:idOrSlug', protect, roleMiddleware('superadmin'), upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'mobileBanner', maxCount: 1 },
]), blogController.updateBlog);
// Delete blog (superadmin only)
router.delete('/:idOrSlug', protect, roleMiddleware('superadmin'), blogController.deleteBlog);

module.exports = router; 