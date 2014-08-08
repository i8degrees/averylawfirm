var express = require('express');
var router = express.Router();
var company_name = 'Avery Law Firm';

// http://stackoverflow.com/questions/7549627/passing-raw-markdown-text-to-jade
// var md = require("node-markdown").Markdown;
// var md_data = '[About](index) [Office Location](index) [Areas of Practice](index) [Contact](index) [Blog](index)';
// res.render('/index', { site_company: company_name, md:md, navi_links: md_data });

// layout.jade
//- != md(navi_links)

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { site_company: company_name });
});

router.get('/index', function(req, res) {
  res.render('index', { site_company: company_name });
});

router.get('/contact', function(req, res) {
  res.render('contact', { site_company: company_name });
});

module.exports = router;
