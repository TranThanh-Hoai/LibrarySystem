let mongoose = require('mongoose');

let reviewSchema = mongoose.Schema({
  book_id: {
    type: mongoose.Types.ObjectId,
    ref: 'book',
    required: true
  },
  user_id: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'hidden'],
    default: 'pending'
  },
  likes_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = new mongoose.model('review', reviewSchema)
