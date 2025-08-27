const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const ensureUploadDir = (uploadPath) => {
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
};

// Save file to local storage
const saveToLocalStorage = (file, folder = 'seo-images') => {
    try {
        const uploadDir = path.join(__dirname, '..', 'uploads', folder);
        ensureUploadDir(uploadDir);

        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        // Copy file to upload directory
        fs.copyFileSync(file.path, filePath);

        // Return the public URL path
        return `/uploads/${folder}/${fileName}`;
    } catch (error) {
        throw new Error(`Local storage save failed: ${error.message}`);
    }
};

// Delete file from local storage
const deleteFromLocalStorage = (filePath) => {
    try {
        const fullPath = path.join(__dirname, '..', filePath.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting local file:', error);
        return false;
    }
};

// Get file info
const getFileInfo = (filePath) => {
    try {
        const fullPath = path.join(__dirname, '..', filePath.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        }
        return null;
    } catch (error) {
        return null;
    }
};

module.exports = {
    saveToLocalStorage,
    deleteFromLocalStorage,
    getFileInfo,
    ensureUploadDir
};
