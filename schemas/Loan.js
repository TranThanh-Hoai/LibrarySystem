let mongoose = require('mongoose');

let loanSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true
  },
  loan_date: {
    type: Date,
    default: Date.now
  },
  due_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Đang mượn', 'Đã trả', 'Quá hạn'],
    default: 'Đang mượn'
  }
})

module.exports = new mongoose.model('loan', loanSchema)
