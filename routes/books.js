const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books');

// Route tìm kiếm sách
router.get('/search', booksController.searchBooks);

// Route xem chi tiết sách
router.get('/:id', booksController.getBookDetails);

module.exports = router;