let mongoose = require('mongoose');

let uploadSchema = mongoose.Schema({
  file_name: {
    type: String,
    required: true
  },
  file_path: {
    type: String,
    required: true
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = new mongoose.model('upload', uploadSchema)
