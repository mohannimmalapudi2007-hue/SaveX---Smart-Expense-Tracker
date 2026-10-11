const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const { BadRequestError, NotFoundError } = require('../utils/errors');

const getCategories = async (req, res, next) => {
  try {
    const { type, includeArchived } = req.query;
    const filter = {
      $or: [{ owner: req.user._id }, { owner: null }]
    };

    if (type) {
      filter.type = type;
    }

    if (includeArchived !== 'true') {
      filter.isArchived = false;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      throw new BadRequestError('Category name and type (expense or income) are required.');
    }

    if (!['expense', 'income'].includes(type)) {
      throw new BadRequestError('Type must be either "expense" or "income".');
    }

    const category = await Category.create({
      owner: req.user._id,
      name: name.trim(),
      type,
      icon: icon || 'tag',
      color: color || '#3978D4',
      isDefault: false
    });

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    const category = await Category.findOne({ _id: req.params.id, owner: req.user._id });

    if (!category) {
      throw new NotFoundError('Category not found or cannot be modified.');
    }

    if (name) category.name = name.trim();
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();

    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully.',
      category
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, owner: req.user._id });
    if (!category) {
      throw new NotFoundError('Category not found.');
    }

    const transactionCount = await Transaction.countDocuments({
      owner: req.user._id,
      category: category._id
    });

    if (transactionCount > 0) {
      // Archive instead of hard delete to keep history intact
      category.isArchived = true;
      await category.save();

      return res.status(200).json({
        status: 'success',
        message: 'Category is linked to existing transactions and has been archived.',
        category
      });
    }

    await Category.deleteOne({ _id: category._id });

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
