let mongoose = require('mongoose');

let publisherSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  phone: {
    type: String
  }
})

module.exports = new mongoose.model('publisher', publisherSchema)
