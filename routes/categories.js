const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');
const { authenticateToken, authorizeRole } = require('../utils/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await categoryController.getAllCategories();
    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await categoryController.getCategoryById(req.params.id);
    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// Create category (Admin only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const category = await categoryController.createCategory(req.body);
    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message
    });
  }
});

// Update category (Admin only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const category = await categoryController.updateCategory(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete category (Admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const category = await categoryController.deleteCategory(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: category
    });
  } catch (error) {
    return res.status(error.statusCode || 404).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
