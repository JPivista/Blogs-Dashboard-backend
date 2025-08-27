const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'seo-images') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { width: 1200, height: 630, crop: 'fill', quality: 'auto' }
            ]
        });

        // Clean up local file after upload
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return result;
    } catch (error) {
        // Clean up local file if upload fails
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Cloudinary deletion failed: ${error.message}`);
    }
};

// Get Cloudinary URL with transformations
const getOptimizedUrl = (publicId, options = {}) => {
    const defaultOptions = {
        width: 1200,
        height: 630,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
    };

    const finalOptions = { ...defaultOptions, ...options };

    return cloudinary.url(publicId, finalOptions);
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    getOptimizedUrl
};
