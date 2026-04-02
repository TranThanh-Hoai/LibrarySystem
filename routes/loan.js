const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.post('/return-book', async function (req, res) {
  try {
    const result = await loanController.returnBook(req.body);
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

module.exports = router;
