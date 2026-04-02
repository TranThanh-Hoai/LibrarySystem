let mongoose = require('mongoose');

let authorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  bio: {
    type: String
  },
  birth_date: {
    type: Date
  }
})

module.exports = new mongoose.model('author', authorSchema)
