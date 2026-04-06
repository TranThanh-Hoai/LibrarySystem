const express = require('express');
const router = express.Router();
const booksController = require('../controller/booksController');
const bookController = require('../controller/bookController');
const upload = require('../config/multerConfig');
const { authenticateToken, authorizeRole } = require('../utils/auth');

router.get('/', async (req, res) => {
  try {
    const result = await bookController.getAllBooks(req.query);
    return res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: 'Error retrieving books',
      error: error.message
    });
  }
});

router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const book = await bookController.createBook(req.body);
    return res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: 'Error creating book',
      error: error.message
    });
  }
});

router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const book = await bookController.updateBook(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
});

router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const book = await bookController.deleteBook(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: book
    });
  } catch (error) {
    return res.status(error.statusCode || 404).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
});

router.post('/:bookId/cover', authenticateToken, authorizeRole(['admin']), upload.single('cover'), async (req, res) => {
  try {
    const result = await bookController.uploadBookCover(req.params.bookId, req.file);
    return res.status(200).json({
      success: true,
      message: 'Book cover uploaded successfully',
      data: result
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: 'Error uploading book cover',
      error: error.message
    });
  }
});

router.get('/search', async (req, res) => {
  try {
    const books = await booksController.searchBooks(req.query);
    return res.json(books);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await booksController.getBookDetails(req.params.id);
    return res.json(book);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message
    });
  }
});

module.exports = router;
