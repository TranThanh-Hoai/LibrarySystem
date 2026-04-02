const express = require('express');
const router = express.Router();
const bookController = require('../controller/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

/**
 * BOOK MANAGEMENT ROUTES
 * 
 * Public Routes (GET):
 *   GET /api/v1/books - Get all books with pagination & search
 *   GET /api/v1/books/:id - Get book by ID
 * 
 * Protected Routes (POST, PUT, DELETE) - Admin only:
 *   POST /api/v1/books - Create new book
 *   PUT /api/v1/books/:id - Update book
 *   DELETE /api/v1/books/:id - Delete book
 *   POST /api/v1/books/:bookId/upload-cover - Upload book cover
 */

// Public routes - Read only
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);

// Protected routes - Admin only
router.post('/', authMiddleware('admin'), bookController.createBook);
router.put('/:id', authMiddleware('admin'), bookController.updateBook);
router.delete('/:id', authMiddleware('admin'), bookController.deleteBook);

// Upload book cover - Admin only
router.post('/:bookId/upload-cover', 
  authMiddleware('admin'), 
  upload.single('cover'), 
  bookController.uploadBookCover
);

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({
        success: false,
        message: 'File is too large (max 5MB)',
        data: null
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }
  next();
});

module.exports = router;
