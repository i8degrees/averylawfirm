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

module.exports = router;
