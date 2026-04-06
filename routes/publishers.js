const express = require('express');
const router = express.Router();
const publisherController = require('../controller/publisherController');
const { authenticateToken, authorizeRole } = require('../utils/auth');

// Get all publishers
router.get('/', async (req, res) => {
  try {
    const publishers = await publisherController.getAllPublishers();
    return res.status(200).json({
      success: true,
      data: publishers
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// Get publisher by ID
router.get('/:id', async (req, res) => {
  try {
    const publisher = await publisherController.getPublisherById(req.params.id);
    return res.status(200).json({
      success: true,
      data: publisher
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
});

// Create publisher (Admin only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const publisher = await publisherController.createPublisher(req.body);
    return res.status(201).json({
      success: true,
      message: 'Publisher created successfully',
      data: publisher
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message
    });
  }
});

// Update publisher (Admin only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const publisher = await publisherController.updatePublisher(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Publisher updated successfully',
      data: publisher
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete publisher (Admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const publisher = await publisherController.deletePublisher(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Publisher deleted successfully',
      data: publisher
    });
  } catch (error) {
    return res.status(error.statusCode || 404).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
