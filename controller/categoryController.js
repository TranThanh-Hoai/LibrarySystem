const Category = require('../schemas/Category');

/**
 * Handle errors with status codes
 */
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getAllCategories = async () => {
  return await Category.find().sort({ name: 1 });
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw createError('Category not found', 404);
  }
  return category;
};

const createCategory = async (data) => {
  const { name, description } = data;

  if (!name) {
    throw createError('Category name is required', 400);
  }

  // Check if category name already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw createError('Category already exists', 409);
  }

  const category = new Category({
    name,
    description
  });

  return await category.save();
};

const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!category) {
    throw createError('Category not found', 404);
  }
  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw createError('Category not found', 404);
  }
  return category;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
