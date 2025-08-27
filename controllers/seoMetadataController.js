const SeoMetadata = require('../models/SeoMetadata');
const fs = require('fs');
const path = require('path');

// Try to import Cloudinary, but provide fallback if not configured
let uploadToCloudinary;
try {
    const cloudinary = require('../utils/cloudinary');
    uploadToCloudinary = cloudinary.uploadToCloudinary;
} catch (error) {
    console.log('Cloudinary not configured, using local file storage');
    uploadToCloudinary = null;
}

// Create new SEO metadata
const createSeoMetadata = async (req, res) => {
    try {
        const {
            pageIdentifier,
            pageName,
            metaTitle,
            metaDescription,
            ogTitle,
            ogDescription,
            keywords,
            canonicalUrl
        } = req.body;

        // Check if page identifier already exists
        const existingMetadata = await SeoMetadata.findOne({ pageIdentifier });
        if (existingMetadata) {
            return res.status(400).json({
                success: false,
                message: 'Page identifier already exists'
            });
        }

        // Handle social media image upload
        let socialMediaImage = '';
        if (req.file) {
            if (uploadToCloudinary) {
                try {
                    const uploadResult = await uploadToCloudinary(req.file.path, 'seo-images');
                    socialMediaImage = uploadResult.secure_url;
                } catch (error) {
                    console.error('Cloudinary upload failed:', error);
                    // Fallback to local storage
                    socialMediaImage = `/uploads/seo-images/${path.basename(req.file.path)}`;
                }
            } else {
                // Use local file storage
                socialMediaImage = `/uploads/seo-images/${path.basename(req.file.path)}`;
            }
        }

        const seoMetadata = new SeoMetadata({
            pageIdentifier,
            pageName,
            metaTitle,
            metaDescription,
            ogTitle: ogTitle || metaTitle,
            ogDescription: ogDescription || metaDescription,
            socialMediaImage,
            keywords: keywords || [],
            canonicalUrl,
            createdBy: req.user.id
        });

        await seoMetadata.save();

        res.status(201).json({
            success: true,
            message: 'SEO metadata created successfully',
            data: seoMetadata
        });
    } catch (error) {
        console.error('Error creating SEO metadata:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all SEO metadata
const getAllSeoMetadata = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, isActive } = req.query;

        let query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { pageIdentifier: { $regex: search, $options: 'i' } },
                { pageName: { $regex: search, $options: 'i' } },
                { metaTitle: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by active status
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const skip = (page - 1) * limit;

        const seoMetadata = await SeoMetadata.find(query)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await SeoMetadata.countDocuments(query);

        res.status(200).json({
            success: true,
            data: seoMetadata,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching SEO metadata:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get SEO metadata by page identifier
const getSeoMetadataByPage = async (req, res) => {
    try {
        const { pageIdentifier } = req.params;

        const seoMetadata = await SeoMetadata.findOne({
            pageIdentifier,
            isActive: true
        }).populate('createdBy', 'name email');

        if (!seoMetadata) {
            return res.status(404).json({
                success: false,
                message: 'SEO metadata not found'
            });
        }

        res.status(200).json({
            success: true,
            data: seoMetadata
        });
    } catch (error) {
        console.error('Error fetching SEO metadata:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get SEO metadata by ID
const getSeoMetadataById = async (req, res) => {
    try {
        const { id } = req.params;

        const seoMetadata = await SeoMetadata.findById(id)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');

        if (!seoMetadata) {
            return res.status(404).json({
                success: false,
                message: 'SEO metadata not found'
            });
        }

        res.status(200).json({
            success: true,
            data: seoMetadata
        });
    } catch (error) {
        console.error('Error fetching SEO metadata by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update SEO metadata
const updateSeoMetadata = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            pageName,
            metaTitle,
            metaDescription,
            ogTitle,
            ogDescription,
            keywords,
            canonicalUrl,
            isActive
        } = req.body;

        const seoMetadata = await SeoMetadata.findById(id);
        if (!seoMetadata) {
            return res.status(404).json({
                success: false,
                message: 'SEO metadata not found'
            });
        }

        // Handle social media image upload
        if (req.file) {
            if (uploadToCloudinary) {
                try {
                    const uploadResult = await uploadToCloudinary(req.file.path, 'seo-images');
                    seoMetadata.socialMediaImage = uploadResult.secure_url;
                } catch (error) {
                    console.error('Cloudinary upload failed:', error);
                    // Fallback to local storage
                    seoMetadata.socialMediaImage = `/uploads/seo-images/${path.basename(req.file.path)}`;
                }
            } else {
                // Use local file storage
                seoMetadata.socialMediaImage = `/uploads/seo-images/${path.basename(req.file.path)}`;
            }
        }

        // Update fields
        if (pageName !== undefined) seoMetadata.pageName = pageName;
        if (metaTitle !== undefined) seoMetadata.metaTitle = metaTitle;
        if (metaDescription !== undefined) seoMetadata.metaDescription = metaDescription;
        if (ogTitle !== undefined) seoMetadata.ogTitle = ogTitle;
        if (ogDescription !== undefined) seoMetadata.ogDescription = ogDescription;
        if (keywords !== undefined) seoMetadata.keywords = keywords;
        if (canonicalUrl !== undefined) seoMetadata.canonicalUrl = canonicalUrl;
        if (isActive !== undefined) seoMetadata.isActive = isActive;

        seoMetadata.lastUpdatedBy = req.user.id;

        await seoMetadata.save();

        res.status(200).json({
            success: true,
            message: 'SEO metadata updated successfully',
            data: seoMetadata
        });
    } catch (error) {
        console.error('Error updating SEO metadata:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete SEO metadata
const deleteSeoMetadata = async (req, res) => {
    try {
        const { id } = req.params;

        const seoMetadata = await SeoMetadata.findById(id);
        if (!seoMetadata) {
            return res.status(404).json({
                success: false,
                message: 'SEO metadata not found'
            });
        }

        await SeoMetadata.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'SEO metadata deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting SEO metadata:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Bulk update SEO metadata
const bulkUpdateSeoMetadata = async (req, res) => {
    try {
        const { updates } = req.body; // Array of {id, updates} objects

        const results = [];
        for (const item of updates) {
            try {
                const seoMetadata = await SeoMetadata.findByIdAndUpdate(
                    item.id,
                    {
                        ...item.updates,
                        lastUpdatedBy: req.user.id
                    },
                    { new: true }
                );

                if (seoMetadata) {
                    results.push({ id: item.id, success: true, data: seoMetadata });
                } else {
                    results.push({ id: item.id, success: false, message: 'Not found' });
                }
            } catch (error) {
                results.push({ id: item.id, success: false, message: error.message });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Bulk update completed',
            results
        });
    } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createSeoMetadata,
    getAllSeoMetadata,
    getSeoMetadataByPage,
    getSeoMetadataById,
    updateSeoMetadata,
    deleteSeoMetadata,
    bulkUpdateSeoMetadata
};
