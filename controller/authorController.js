const Author = require('../schemas/Author');

/**
 * Handle errors with status codes
 */
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getAllAuthors = async () => {
  return await Author.find().sort({ name: 1 });
};

const getAuthorById = async (id) => {
  const author = await Author.findById(id);
  if (!author) {
    throw createError('Author not found', 404);
  }
  return author;
};

const createAuthor = async (data) => {
  const { name, bio, birth_date } = data;

  if (!name) {
    throw createError('Name is required', 400);
  }

  const author = new Author({
    name,
    bio,
    birth_date
  });

  return await author.save();
};

const updateAuthor = async (id, data) => {
  const author = await Author.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!author) {
    throw createError('Author not found', 404);
  }
  return author;
};

const deleteAuthor = async (id) => {
  const author = await Author.findByIdAndDelete(id);
  if (!author) {
    throw createError('Author not found', 404);
  }
  return author;
};

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
};
