const express = require('express');
const router = express.Router();
const loansController = require('../controller/loansController');
const loanController = require('../controller/loanController');
const { authenticateToken } = require('../utils/auth');

router.post('/return-book', authenticateToken, async function (req, res) {
  try {
    const result = await loansController.returnBook(req.body, req.user);
    return res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data || null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/borrow', authenticateToken, async (req, res) => {
  try {
    const result = await loanController.borrowBook(req);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
