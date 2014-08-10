var express = require('express');
var router = express.Router();

var company_name = 'Avery Law Firm';
var email_addr = 'laura@averylawfirm.com';

// Markdown support
//
// See also: http://stackoverflow.com/questions/7549627/passing-raw-markdown-text-to-jade
var md = require("node-markdown").Markdown;

router.get('/', function(req, res) {
  res.render('index', { site_company: company_name });
});

router.get('/index', function(req, res) {
  res.render('index', { site_company: company_name });
});

router.get('/about', function(req, res) {
  res.render('index', { site_company: company_name });
});

router.get('/contact', function(req, res) {
  res.render('contact', { site_company: company_name, site_email: email_addr });
});

router.get('/privacy', function(req, res) {
  res.render('privacy', { site_company: company_name, md:md });
});

// TODO: Add additional routing links (i.e.: criminal_defense, ...) for this
// page.
router.get('/practice', function(req, res) {
  res.render('practice', { site_company: company_name, md:md });
});

router.get('/search_results', function(req, res) {
  res.render('search_results', { site_company: company_name, md:md, cse_query: req.query['q'] });
});

module.exports = router;
