var express = require('express');
var router = express.Router();

var app_name = 'www.averylawfirm.com';

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: app_name });
});

router.get('/index', function(req, res) {
  res.render('index', { title: app_name });
});

router.get('/home', function(req, res) {
  res.render('index', { title: app_name });
});

module.exports = router;
