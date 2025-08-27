const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    createSeoMetadata,
    getAllSeoMetadata,
    getSeoMetadataByPage,
    getSeoMetadataById,
    updateSeoMetadata,
    deleteSeoMetadata,
    bulkUpdateSeoMetadata
} = require('../controllers/seoMetadataController');

const protect = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/seo-images';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'seo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Get SEO metadata by page identifier (Public route for frontend)
router.get('/page/:pageIdentifier', getSeoMetadataByPage);

// Get SEO metadata by ID (Public route for frontend)
router.get('/id/:id', getSeoMetadataById);

// Apply authentication middleware to protected routes
router.use(protect);

// Debug middleware to log user info
router.use((req, res, next) => {
    console.log('SEO Metadata Route - User:', req.user ? {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
    } : 'No user');
    next();
});

// Create new SEO metadata (Admin/Superadmin only)
router.post('/',
    checkRole(['admin', 'superadmin']),
    upload.single('socialMediaImage'),
    createSeoMetadata
);

// Get all SEO metadata with pagination and search
router.get('/',
    checkRole(['admin', 'superadmin']),
    getAllSeoMetadata
);

// Update SEO metadata (Admin/Superadmin only)
router.put('/:id',
    checkRole(['admin', 'superadmin']),
    upload.single('socialMediaImage'),
    updateSeoMetadata
);

// Delete SEO metadata (Admin/Superadmin only)
router.delete('/:id',
    checkRole(['admin', 'superadmin']),
    deleteSeoMetadata
);

// Bulk update SEO metadata (Admin/Superadmin only)
router.put('/bulk/update',
    checkRole(['admin', 'superadmin']),
    bulkUpdateSeoMetadata
);

module.exports = router;
