let mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  }
})

module.exports = new mongoose.model('category', categorySchema)
