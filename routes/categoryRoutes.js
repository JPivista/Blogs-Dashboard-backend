const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const protect = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/main', categoryController.getMainCategories);
router.get('/subcategories/:parentId', categoryController.getSubcategories);
router.get('/:id', categoryController.getCategoryById);

// Blog count and list for categories
router.get('/blog-counts', protect, categoryController.getCategoryBlogCounts);
router.get('/:categoryId/blogs', categoryController.getBlogsByCategory);

// Protected routes (superadmin only)
router.post('/', protect, roleMiddleware('superadmin'), categoryController.createCategory);
router.put('/:id', protect, roleMiddleware('superadmin'), categoryController.updateCategory);
router.delete('/:id', protect, roleMiddleware('superadmin'), categoryController.deleteCategory);

module.exports = router; 