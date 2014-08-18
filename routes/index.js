// Site (route) dependencies
var express = require('express');
var router = express.Router();
var fs = require('fs');

// Initialize page content (pulled from Markdown files)
var opts = { encoding: 'ascii' };

var topics = {
  about: {
    title: 'About',
    // id: 'about',
    load: function load() { return fs.readFileSync('./data/pages/about.md', opts ); }
  },
  privacy: {
    title: 'Privacy Policy',
    // id: 'privacy',
    load: function load() { return fs.readFileSync('./data/pages/privacy.md', opts ); }
  }
};

router.get('/', function(req, res) {
  res.render('index', { topic: topics['about'] } );
});

router.get('/index', function(req, res) {
  res.render('index', { topic: topics['about'] } );
});

router.get('/about', function(req, res) {
  res.render('index', { topic: topics['about'] } );
});

router.get('/privacy', function(req, res) {
  res.render('privacy', { topic: topics['privacy'] } );
});

router.get('/search_results', function(req, res) {
  res.render('search_results', { cse_query: req.query['q'] } );
});

router.get('/locations', function(req, res) {
  res.render('locations');
});

module.exports = router;
