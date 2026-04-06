const Book = require('../schemas/Book');
const Publisher = require('../schemas/Publisher');
const Category = require('../schemas/Category');
const Upload = require('../schemas/Upload');
const path = require('path');
const { getIO } = require('../config/socketConfig');

/**
 * Handle errors with status codes
 */
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Get all books with pagination and search
 * Params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10)
 *   - search: search by title
 */
const getAllBooks = async ({ page = 1, limit = 10, search = '' }) => {
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

  return {
    books,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      limit: parseInt(limit)
    }
  };
};

/**
 * Get book by ID
 */
const getBookById = async (id) => {
  const book = await Book
    .findById(id)
    .populate('publisher_id', 'name address phone')
    .populate('category_id', 'name description');

  if (!book) {
    throw createError('Book not found', 404);
  }

  return book;
};

/**
 * Create new book
 * Required fields: isbn, title, publisher_id, category_id, published_year, quantity, available_copies
 */
const createBook = async (bookData) => {
  const { isbn, title, publisher_id, category_id, published_year, quantity, available_copies } = bookData;

  // Validation
  if (!isbn || !title || !publisher_id || !category_id) {
    throw createError('Missing required fields: isbn, title, publisher_id, category_id', 400);
  }

  // Check if ISBN already exists
  const existingBook = await Book.findOne({ isbn });
  if (existingBook) {
    throw createError('Book with this ISBN already exists', 409);
  }

  // Verify publisher exists
  const publisher = await Publisher.findById(publisher_id);
  if (!publisher) {
    throw createError('Publisher not found', 404);
  }

  // Verify category exists
  const category = await Category.findById(category_id);
  if (!category) {
    throw createError('Category not found', 404);
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

  // Emit New Book Event via WebSocket
  try {
    const io = getIO();
    io.emit('newBook', { title: populatedBook.title });
  } catch (error) {
    console.error('⚠️ Socket.io emitting error:', error.message);
  }

  return populatedBook;
};

/**
 * Update book
 */
const updateBook = async (id, updateData) => {
  // Validation: ISBN uniqueness if being updated
  if (updateData.isbn) {
    const existingBook = await Book.findOne({ 
      isbn: updateData.isbn,
      _id: { $ne: id }
    });
    if (existingBook) {
      throw createError('ISBN already in use', 409);
    }
  }

  // Validate publisher if provided
  if (updateData.publisher_id) {
    const publisher = await Publisher.findById(updateData.publisher_id);
    if (!publisher) {
      throw createError('Publisher not found', 404);
    }
  }

  // Validate category if provided
  if (updateData.category_id) {
    const category = await Category.findById(updateData.category_id);
    if (!category) {
      throw createError('Category not found', 404);
    }
  }

  const updatedBook = await Book
    .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate('publisher_id', 'name address phone')
    .populate('category_id', 'name description');

  if (!updatedBook) {
    throw createError('Book not found', 404);
  }

  return updatedBook;
};

/**
 * Delete book
 */
const deleteBook = async (id) => {
  const deletedBook = await Book.findByIdAndDelete(id);

  if (!deletedBook) {
    throw createError('Book not found', 404);
  }

  return deletedBook;
};

/**
 * Upload book cover image
 * Stores upload info in database and returns upload URL
 */
const uploadBookCover = async (bookId, file) => {
  if (!file) {
    throw createError('No file uploaded', 400);
  }

  // Check if book exists
  const book = await Book.findById(bookId);
  if (!book) {
    throw createError('Book not found', 404);
  }

  // Save upload info to database
  const uploadRecord = new Upload({
    file_name: file.filename,
    file_path: `/uploads/${file.filename}`
  });

  const savedUpload = await uploadRecord.save();

  return {
    upload_id: savedUpload._id,
    file_name: savedUpload.file_name,
    file_path: savedUpload.file_path,
    uploaded_at: savedUpload.uploaded_at
  };
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  uploadBookCover
};
