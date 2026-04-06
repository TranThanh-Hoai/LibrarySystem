var express = require('express');
var router = express.Router();
var loansRouter = require('./loans');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.use('/loans', loansRouter);

module.exports = router;
