var express = require('express');
var app = express();
var router = express.Router();
var validator = require('express-validator');

// Markdown filter
//
// See also: http://stackoverflow.com/questions/7549627/passing-raw-markdown-text-to-jade
var md = require("node-markdown").Markdown;

var company_name = 'Avery Law Firm';
var email_addr = 'laura@averylawfirm.com';

// Offline mode -- enable with the string literal 'offline', or pass a blank
// string '' to disable; this controls whether or not to load content over the
// net (i.e.: fonts, javasccripts, etc.).
var site_env = 'offline';

// contact page form validity err labels
var req_input_errs = {
  first_name: 'Please leave your first name.',
  last_name: 'Please leave your last name.',
  email_address: 'Please leave your e-mail address.',
  confirm_email: 'Please confirm your e-mail address.',
  phone: 'Your ten (10) digit phone number is required.',
  state: 'Your state is required.',
  zipcode: 'Your five (5) digit zip code is required.',
  message: 'Please leave a message.',
  tos: 'You must agree to our disclaimer.'
};

router.get('/', function(req, res) {
  res.render('index', { ENV: site_env, site_company: company_name });
});

router.get('/index', function(req, res) {
  res.render('index', { ENV: site_env, site_company: company_name });
});

router.get('/about', function(req, res) {
  res.render('index', { ENV: site_env, site_company: company_name });
});

router.get('/contact', function(req, res) {
  res.render('contact', { ENV: site_env, site_company: company_name, site_email: email_addr, req_input_errs: req_input_errs });
});

router.post('/contact', function(req, res) {
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var email = req.body.email;
  var confirm_email = req.body.confirm_email;
  var phone = req.body.phone;
  var phone_ext = req.body.phone_ext;
  var state = req.body.state;
  var zipcode = req.body.zipcode;
  var contact_pref = req.body.contact_pref;
  var message = req.body.message;
  var tos = req.body.tos;

  // Do user input sanity checks
  req.checkBody( 'first_name', req_input_errs['first_name'] ).notEmpty();
  req.checkBody( 'last_name', req_input_errs['last_name'] ).notEmpty();
  req.checkBody( 'email', req_input_errs['email'] ).notEmpty();

  // TODO: email == confirm_email
  req.checkBody( 'confirm_email', req_input_errs['confirm_email'] ).notEmpty();

  // TODO: phone
  req.checkBody( 'phone', req_input_errs['phone'] ).notEmpty();

  // TODO: state (not default)
  req.checkBody( 'state', req_input_errs['state'] ).notEmpty();
  req.checkBody( 'zipcode', req_input_errs['zipcode'] ).isInt();

  req.checkBody( 'contact_pref', req_input_errs['contact_pref'] ).notEmpty();
  req.checkBody( 'message', req_input_errs['message'] ).notEmpty();
  req.checkBody( 'tos', req_input_errs['tos'] ).notEmpty();

  // Check the validation object for errors
  var errors = req.validationErrors();

  if( site_env === 'development' ) {
    console.log(errors);
  }

  if (errors) {
    res.render('contact', { ENV: site_env, site_company: company_name, site_email: email_addr, req_input_errs: req_input_errs, flash: { type: 'alert-danger', messages: errors }} );
  }
  else {
    res.render('contact', { ENV: site_env, site_company: company_name, site_email: email_addr, req_input_errs: req_input_errs, flash: { type: 'alert-success', messages: [ { msg: 'No errors!' } ] }} );
  }
});

router.get('/privacy', function(req, res) {
  res.render('privacy', { ENV: site_env, site_company: company_name, md:md });
});

// TODO: Add additional routing links (i.e.: criminal_defense, ...) for this
// page.
router.get('/practice', function(req, res) {
  res.render('practice', { ENV: site_env, site_company: company_name, md:md });
});

router.get('/search_results', function(req, res) {
  res.render('search_results', { ENV: site_env, site_company: company_name, md:md, cse_query: req.query['q'] });
});

module.exports = router;
