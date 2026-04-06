let mongoose = require('mongoose');

let bookSchema = mongoose.Schema({
  isbn: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  publisher_id: {
    type: mongoose.Types.ObjectId,
    ref: 'publisher',
    required: true
  },
  category_id: {
    type: mongoose.Types.ObjectId,
    ref: 'category',
    required: true
  },
  author_id: {
    type: mongoose.Types.ObjectId,
    ref: 'author',
    required: true
  },
  published_year: {
    type: Number
  },
  quantity: {
    type: Number,
    default: 0
  },
  available_copies: {
    type: Number,
    default: 0
  },
  upload_id: {
    type: mongoose.Types.ObjectId,
    ref: 'upload',
    default: null
  },
  cover_url: {
    type: String,
    default: ''
  }
})

module.exports = new mongoose.model('book', bookSchema)
