const Book = require('../schemas/Book');
const Publisher = require('../schemas/Publisher');
const Category = require('../schemas/Category');
const Upload = require('../schemas/Upload');
const path = require('path');

/**
 * Get all books with pagination and search
 * Query params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10)
 *   - search: search by title
 */
const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search filter
    const filter = search 
      ? { title: { $regex: search, $options: 'i' } } 
      : {};

    // Get total count
    const total = await Book.countDocuments(filter);

    // Get books with pagination
    const books = await Book
      .find(filter)
      .populate('publisher_id', 'name address phone')
      .populate('category_id', 'name description')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: {
        books,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllBooks:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving books',
      data: null,
      error: error.message
    });
  }
};

/**
 * Get book by ID
 */
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book
      .findById(id)
      .populate('publisher_id', 'name address phone')
      .populate('category_id', 'name description');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Book retrieved successfully',
      data: book
    });
  } catch (error) {
    console.error('Error in getBookById:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving book',
      data: null,
      error: error.message
    });
  }
};

/**
 * Create new book
 * Required fields: isbn, title, publisher_id, category_id, published_year, quantity, available_copies
 */
const createBook = async (req, res) => {
  try {
    const { isbn, title, publisher_id, category_id, published_year, quantity, available_copies } = req.body;

    // Validation
    if (!isbn || !title || !publisher_id || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: isbn, title, publisher_id, category_id',
        data: null
      });
    }

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: 'Book with this ISBN already exists',
        data: null
      });
    }

    // Verify publisher exists
    const publisher = await Publisher.findById(publisher_id);
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: 'Publisher not found',
        data: null
      });
    }

    // Verify category exists
    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        data: null
      });
    }

    // Create new book
    const newBook = new Book({
      isbn,
      title,
      publisher_id,
      category_id,
      published_year: published_year || new Date().getFullYear(),
      quantity: quantity || 0,
      available_copies: available_copies || 0
    });

    const savedBook = await newBook.save();

    // Populate references before sending response
    const populatedBook = await Book
      .findById(savedBook._id)
      .populate('publisher_id', 'name address phone')
      .populate('category_id', 'name description');

    return res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: populatedBook
    });
  } catch (error) {
    console.error('Error in createBook:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating book',
      data: null,
      error: error.message
    });
  }
};

/**
 * Update book
 */
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validation: ISBN uniqueness if being updated
    if (updateData.isbn) {
      const existingBook = await Book.findOne({ 
        isbn: updateData.isbn,
        _id: { $ne: id }
      });
      if (existingBook) {
        return res.status(409).json({
          success: false,
          message: 'ISBN already in use',
          data: null
        });
      }
    }

    // Validate publisher if provided
    if (updateData.publisher_id) {
      const publisher = await Publisher.findById(updateData.publisher_id);
      if (!publisher) {
        return res.status(404).json({
          success: false,
          message: 'Publisher not found',
          data: null
        });
      }
    }

    // Validate category if provided
    if (updateData.category_id) {
      const category = await Category.findById(updateData.category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
          data: null
        });
      }
    }

    const updatedBook = await Book
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('publisher_id', 'name address phone')
      .populate('category_id', 'name description');

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (error) {
    console.error('Error in updateBook:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating book',
      data: null,
      error: error.message
    });
  }
};

/**
 * Delete book
 */
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: deletedBook
    });
  } catch (error) {
    console.error('Error in deleteBook:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting book',
      data: null,
      error: error.message
    });
  }
};

/**
 * Upload book cover image
 * Stores upload info in database and returns upload URL
 */
const uploadBookCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        data: null
      });
    }

    const { bookId } = req.params;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
        data: null
      });
    }

    // Save upload info to database
    const uploadRecord = new Upload({
      file_name: req.file.filename,
      file_path: `/uploads/${req.file.filename}`
    });

    const savedUpload = await uploadRecord.save();

    // Note: For future enhancement, add cover_image field to Book schema
    // and update the book with: book.cover_image = savedUpload._id
    // Then save book: await book.save()

    return res.status(200).json({
      success: true,
      message: 'Book cover uploaded successfully',
      data: {
        upload_id: savedUpload._id,
        file_name: savedUpload.file_name,
        file_path: savedUpload.file_path,
        uploaded_at: savedUpload.uploaded_at
      }
    });
  } catch (error) {
    console.error('Error in uploadBookCover:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading book cover',
      data: null,
      error: error.message
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  uploadBookCover
};
