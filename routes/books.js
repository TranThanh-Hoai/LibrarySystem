const express = require('express');
const router = express.Router();
const booksController = require('../controller/booksController');

// Route tìm kiếm sách
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

// Route xem chi tiết sách
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
