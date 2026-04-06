const Book = require('../schemas/Book');
const Publisher = require('../schemas/Publisher');
const Category = require('../schemas/Category');
const Author = require('../schemas/Author');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Tìm kiếm sách
exports.searchBooks = async ({ query, category, publisher, author } = {}) => {
  const filter = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { isbn: { $regex: query, $options: 'i' } }
    ];
  }

  if (category) {
    const categoryDoc = await Category.findOne({
      name: { $regex: category, $options: 'i' }
    });

    if (categoryDoc) {
      filter.category_id = categoryDoc._id;
    }
  }

  if (publisher) {
    const publisherDoc = await Publisher.findOne({
      name: { $regex: publisher, $options: 'i' }
    });

    if (publisherDoc) {
      filter.publisher_id = publisherDoc._id;
    }
  }

  if (author) {
    const authorDoc = await Author.findOne({
      name: { $regex: author, $options: 'i' }
    });

    if (authorDoc) {
      filter.author_id = authorDoc._id;
    }
  }

  return Book.find(filter)
    .populate('publisher_id', 'name')
    .populate('category_id', 'name')
    .populate('author_id', 'name')
    .select('isbn title published_year quantity available_copies publisher_id category_id author_id');
};

// Xem chi tiết sách
exports.getBookDetails = async (id) => {
  const book = await Book.findById(id)
    .populate('publisher_id', 'name address phone')
    .populate('category_id', 'name description')
    .populate('author_id', 'name bio');

  if (!book) {
    throw createError('Book not found', 404);
  }

  return book;
};
