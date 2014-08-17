// Site (route) dependencies
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/index', function(req, res) {
  res.render('index');
});

router.get('/about', function(req, res) {
  res.render('index');
});

router.get('/privacy', function(req, res) {
  res.render('privacy');
});

router.get('/search_results', function(req, res) {
  res.render('search_results', { cse_query: req.query['q'] } );
});

router.get('/locations', function(req, res) {
  res.render('locations');
});

module.exports = router;
