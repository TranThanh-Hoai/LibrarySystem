const Publisher = require('../schemas/Publisher');

/**
 * Handle errors with status codes
 */
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getAllPublishers = async () => {
  return await Publisher.find().sort({ name: 1 });
};

const getPublisherById = async (id) => {
  const publisher = await Publisher.findById(id);
  if (!publisher) {
    throw createError('Publisher not found', 404);
  }
  return publisher;
};

const createPublisher = async (data) => {
  const { name, address, phone } = data;

  if (!name) {
    throw createError('Publisher name is required', 400);
  }

  // Check if publisher name already exists
  const existingPublisher = await Publisher.findOne({ name });
  if (existingPublisher) {
    throw createError('Publisher already exists', 409);
  }

  const publisher = new Publisher({
    name,
    address,
    phone
  });

  return await publisher.save();
};

const updatePublisher = async (id, data) => {
  const publisher = await Publisher.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!publisher) {
    throw createError('Publisher not found', 404);
  }
  return publisher;
};

const deletePublisher = async (id) => {
  const publisher = await Publisher.findByIdAndDelete(id);
  if (!publisher) {
    throw createError('Publisher not found', 404);
  }
  return publisher;
};

module.exports = {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher
};
