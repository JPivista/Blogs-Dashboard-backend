const Category = require('../models/Category');
const Blog = require('../models/Blog');

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .populate('parentCategory', 'name')
            .sort({ type: 1, name: 1 });

        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// Get main categories only
exports.getMainCategories = async (req, res) => {
    try {
        const categories = await Category.find({
            type: 'main',
            isActive: true
        }).sort({ name: 1 });

        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching main categories', error: error.message });
    }
};

// Get subcategories by parent category
exports.getSubcategories = async (req, res) => {
    try {
        const { parentId } = req.params;
        const subcategories = await Category.find({
            type: 'sub',
            parentCategory: parentId,
            isActive: true
        }).sort({ name: 1 });

        res.json(subcategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subcategories', error: error.message });
    }
};

// Create a new category
exports.createCategory = async (req, res) => {
    console.log('User in createCategory:', req.user);
    try {
        const { name, type, parentCategory, description } = req.body;

        // Check if category with same name already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category with this name already exists' });
        }

        const category = new Category({
            name,
            type,
            parentCategory: type === 'sub' ? parentCategory : undefined,
            description
        });

        await category.save();

        const populatedCategory = await Category.findById(category._id)
            .populate('parentCategory', 'name');

        res.status(201).json(populatedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    console.log('User in updateCategory:', req.user);
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;

        // Check if name is being changed and if it conflicts
        if (name) {
            const existingCategory = await Category.findOne({
                name,
                _id: { $ne: id }
            });
            if (existingCategory) {
                return res.status(400).json({ message: 'Category with this name already exists' });
            }
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { name, description, isActive },
            { new: true }
        ).populate('parentCategory', 'name');

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    console.log('User in deleteCategory:', req.user);
    try {
        const { id } = req.params;

        // Check if category is being used in blogs
        const blogsUsingCategory = await Blog.find({
            $or: [
                { mainCategory: id },
                { subcategories: id }
            ]
        });
        console.log('Trying to delete category:', id);
        console.log('Blogs using this category:', blogsUsingCategory.map(b => ({ _id: b._id, title: b.title, mainCategory: b.mainCategory, subcategories: b.subcategories })));

        if (blogsUsingCategory.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete category as it is being used by blogs',
                blogsCount: blogsUsingCategory.length
            });
        }

        // Check if category has subcategories
        const subcategories = await Category.find({ parentCategory: id });
        if (subcategories.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete category as it has subcategories',
                subcategoriesCount: subcategories.length
            });
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id)
            .populate('parentCategory', 'name');

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category', error: error.message });
    }
};

// Get blog count for each category
exports.getCategoryBlogCounts = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        console.log('Fetched categories for blog counts:', categories);
        const mainCounts = await Promise.all(categories.filter(cat => cat.type === 'main').map(async cat => {
            const count = await Blog.countDocuments({ mainCategory: cat._id });
            return { _id: cat._id.toString(), count: Number(count) };
        }));
        const subCounts = await Promise.all(categories.filter(cat => cat.type === 'sub').map(async cat => {
            const count = await Blog.countDocuments({ subcategories: cat._id });
            return { _id: cat._id.toString(), count: Number(count) };
        }));
        const total = mainCounts.reduce((sum, c) => sum + c.count, 0) + subCounts.reduce((sum, c) => sum + c.count, 0);
        res.json({ main: mainCounts, sub: subCounts, total });
    } catch (error) {
        console.error('Error in getCategoryBlogCounts:', error);
        res.status(500).json({ message: 'Error fetching blog counts', error: error.message });
    }
};

// List blogs for a specific category (main or sub)
exports.getBlogsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        // Find blogs where mainCategory or subcategories contains categoryId
        const blogs = await Blog.find({
            $or: [
                { mainCategory: categoryId },
                { subcategories: categoryId }
            ]
        }).populate('mainCategory', 'name').populate('subcategories', 'name');
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs for category', error: error.message });
    }
}; 