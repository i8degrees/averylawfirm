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

// var flash = {
//   type: 'alert-success',
//   messages: [ {
//     msg: 'Successful form submission'
//   } ]
// };
var flash = null;

// Offline mode -- enable with the string literal 'offline', or pass a blank
// string '' to disable; this controls whether or not to load content over the
// net (i.e.: fonts, javasccripts, etc.).
var site_env = 'offline';

var ENV = {
  app: app.get('env'),
  site: site_env
};

// contact page form validity err labels
var req_input_errs = {
  first_name: 'Please leave your first name.',
  last_name: 'Please leave your last name.',
  email_address: 'Please leave your e-mail address.',
  // TODO: clean up err message
  confirm_email: 'Your e-mail address does not match.',
  phone: 'Your ten (10) digit phone number is required.',
  phone: 'Your phone extension can only include numbers.',
  state: 'Your state is required.',
  zipcode: 'Your five (5) digit zip code is required.',
  contact_pref: 'Please choose your contact preference.',
  message: 'Please leave a message.',
  tos: 'You must agree to our disclaimer.'
};

console.log('Site Mode: %s: ', site_env );

router.get('/', function(req, res) {
  res.render('index', { ENV: ENV, site_company: company_name } );
});

router.get('/index', function(req, res) {
  res.render('index', { ENV: ENV, site_company: company_name } );
});

router.get('/about', function(req, res) {
  res.render('index', { ENV: ENV, site_company: company_name } );
});

router.get('/contact', function(req, res) {
  res.render('contact', { ENV: ENV, site_company: company_name, site_email: email_addr, req_input_errs: req_input_errs, flash: flash } );
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

  // Equality check
  validator.validator.extend('eq', function(str, comp) {
    if( str != comp ) return false;

    return true;
  });

  // Inequality check
  validator.validator.extend('neq', function(str, comp) {
    if( str != comp ) return true;

    return false;
  });

  // OR equality check
  validator.validator.extend('meq', function(str, comp1, comp2 ) {
    if( str === comp1 || str === comp2  ) return true;

    return false;
  });

  //- FIXME:
  // Non-empty, five (5) digit number check
  validator.validator.extend('zip', function(str) {

    // return( str === '' && typeof str === 'number' && str.length == 5 );
    // console.log( typeof str === 'number' ? true : false );

    // TODO: Try match reg exp:
    // console.log("zip: %d", str[0].match('[0-9]') && str[1].match('[0-9]'));

    return( str.length == 5 );
  });

  // Do user input sanity checks
  req.checkBody( 'first_name', req_input_errs['first_name'] ).notEmpty();
  req.checkBody( 'last_name', req_input_errs['last_name'] ).notEmpty();
  req.checkBody( 'email', req_input_errs['email'] ).notEmpty();
  req.checkBody( 'confirm_email', req_input_errs['confirm_email'] ).eq(email);

  // TODO: phone && phone extension
  req.checkBody( 'phone', req_input_errs['phone'] ).notEmpty();
  // req.checkBody( 'phone', req_input_errs['phone'] ).isInt();
  // req.checkBody( 'phone_ext', req_input_errs['phone_ext'] ).isInt();

  req.checkBody( 'state', req_input_errs['state'] ).neq('DID NOT RESPOND');
  // req.checkBody( 'zipcode', req_input_errs['zipcode'] ).isInt();

  //- FIXME:
  req.checkBody( 'zipcode', req_input_errs['zipcode'] ).zip();

  req.checkBody( 'contact_pref', req_input_errs['contact_pref'] ).meq('email', 'phone');

  req.checkBody( 'message', req_input_errs['message'] ).notEmpty();
  req.checkBody( 'tos', req_input_errs['tos'] ).eq('agree');

  // Check the validation object for errors
  var errors = req.validationErrors();

  if (errors) {
    if( app.get('env') === 'development' ) {
      // console.log(errors);
    }
    res.render('contact', { ENV: ENV, site_company: company_name, site_email: email_addr, req_input_errs: req_input_errs, flash: { type: 'alert-danger', messages: errors }, post_data: req.body } );
  }
  else {
    console.log('success!');
    res.render('contact_success', { ENV: ENV, site_company: company_name, site_email: email_addr, post_data: req.body } );
  }
});

router.get('/privacy', function(req, res) {
  res.render('privacy', { ENV: ENV, site_company: company_name, md:md } );
});

router.get('/practice', function(req, res) {
  res.render('practice', { ENV: ENV, site_company: company_name, md:md } );
});

router.get('/search_results', function(req, res) {
  res.render('search_results', { ENV: ENV, site_company: company_name, md:md, cse_query: req.query['q'] } );
});

module.exports = router;
