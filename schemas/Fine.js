let mongoose = require('mongoose');

let fineSchema = mongoose.Schema({
  loan_id: {
    type: mongoose.Types.ObjectId,
    ref: 'loan',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  reason: {
    type: String
  },
  is_paid: {
    type: Boolean,
    default: false
  }
})

module.exports = new mongoose.model('fine', fineSchema)
