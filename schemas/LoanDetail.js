let mongoose = require('mongoose');

let loanDetailSchema = mongoose.Schema({
  loan_id: {
    type: mongoose.Types.ObjectId,
    ref: 'loan',
    required: true
  },
  book_id: {
    type: mongoose.Types.ObjectId,
    ref: 'book',
    required: true
  },
  return_date: {
    type: Date
  },
  condition: {
    type: String
  }
})

module.exports = new mongoose.model('loanDetail', loanDetailSchema)
