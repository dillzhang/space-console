var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Control Console' });
});

router.get('/console', function(req, res, next) {
  res.render('console', { title: 'Space Ship' });
});

module.exports = router;
