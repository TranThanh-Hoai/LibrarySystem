var express = require('express');
var router = express.Router();
var loanRouter = require('./loan');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.use('/loans', loanRouter);

module.exports = router;
