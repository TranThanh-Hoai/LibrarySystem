let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password_hash: {
    type: String,
    required: true
  },
  full_name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role_id: {
    type: mongoose.Types.ObjectId,
    ref: 'role',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = new mongoose.model('user', userSchema)
