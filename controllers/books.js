const Book = require('../schemas/Book');
const Publisher = require('../schemas/Publisher');
const Category = require('../schemas/Category');

// Tìm kiếm sách
exports.searchBooks = async (req, res) => {
  try {
    const { query, category, publisher } = req.query;
    let filter = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { isbn: { $regex: query, $options: 'i' } }
      ];
    }

    if (category) {
      const categoryDoc = await Category.findOne({ name: { $regex: category, $options: 'i' } });
      if (categoryDoc) {
        filter.category_id = categoryDoc._id;
      }
    }

    if (publisher) {
      const publisherDoc = await Publisher.findOne({ name: { $regex: publisher, $options: 'i' } });
      if (publisherDoc) {
        filter.publisher_id = publisherDoc._id;
      }
    }

    const books = await Book.find(filter)
      .populate('publisher_id', 'name')
      .populate('category_id', 'name')
      .select('isbn title published_year quantity available_copies publisher_id category_id');

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xem chi tiết sách
exports.getBookDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id)
      .populate('publisher_id', 'name address phone')
      .populate('category_id', 'name description');

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};