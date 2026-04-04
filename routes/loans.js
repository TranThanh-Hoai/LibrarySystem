const express = require('express');
const router = express.Router();
const loansController = require('../controller/loansController');
const loanController = require('../controller/loanController');

router.post('/return-book', async function (req, res) {
  try {
    const result = await loansController.returnBook(req.body);
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

router.post('/borrow', async (req, res) => {
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
