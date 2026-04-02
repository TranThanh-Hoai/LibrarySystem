const express = require('express');
const router = express.Router();
const loanController = require('../controller/loanController');

// Route for borrowing books: POST /api/loans/borrow
router.post('/borrow', loanController.borrowBook);

module.exports = router;
