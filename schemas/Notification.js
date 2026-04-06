let mongoose = require('mongoose');

let notificationSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    ref: 'user'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Nhắc trả sách', 'Sách mới', 'Hệ thống'],
    default: 'Hệ thống'
  },
  is_read: {
    type: Boolean,
    default: false
  }
})

module.exports = new mongoose.model('notification', notificationSchema)
