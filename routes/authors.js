const express = require('express');
const router = express.Router();
const authorController = require('../controller/authorController');
const { authenticateToken, authorizeRole } = require('../utils/auth');

// Get all authors
router.get('/', async (req, res) => {
  try {
    const authors = await authorController.getAllAuthors();
    return res.status(200).json({
      success: true,
      data: authors
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// Get author by ID
router.get('/:id', async (req, res) => {
  try {
    const author = await authorController.getAuthorById(req.params.id);
    return res.status(200).json({
      success: true,
      data: author
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// Create author (Admin only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const author = await authorController.createAuthor(req.body);
    return res.status(201).json({
      success: true,
      message: 'Author created successfully',
      data: author
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message
    });
  }
});

// Update author (Admin only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const author = await authorController.updateAuthor(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Author updated successfully',
      data: author
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete author (Admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const author = await authorController.deleteAuthor(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Author deleted successfully',
      data: author
    });
  } catch (error) {
    return res.status(error.statusCode || 404).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
