// Site dependencies
var express = require('express');
var app = express();
var router = express.Router();
var validator = require('express-validator');

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/index', function(req, res) {
  res.render('index');
});

router.get('/about', function(req, res) {
  res.render('index');
});

router.get('/contact', function(req, res) {
  res.render('contact', { input_errs: res.locals.input_errs['contact'] } );
});

router.post('/contact', function(req, res) {

  // Convenience vars
  var first_name = req.body.contact['first_name'];
  var last_name = req.body.contact['last_name'];
  var email = req.body.contact['email'];
  // var confirm_email = req.body.contact['confirm_email'];
  var phone_area = req.body.contact['phone_area'];
  var phone_prefix = req.body.contact['phone_prefix'];
  var phone_suffix = req.body.contact['phone_suffix'];
  var phone_ext = req.body.contact['phone_ext'];
  var state = req.body.contact['state'];
  var zipcode = req.body.contact['zipcode'];
  var preference = req.body.contact['pref'];
  var message = req.body.contact['message'];
  var tos = req.body.contact['tos'];

  var input_errs = res.locals.input_errs['contact'];

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
  // validator.validator.extend('meq', function(str, comp1, comp2 ) {
  //   if( str === comp1 || str === comp2  ) return true;

  //   return false;
  // });

  // Do user input sanity checks
  req.checkBody( 'contact.first_name', input_errs['first_name'] ).len(1,255);
  req.checkBody( 'contact.last_name', input_errs['last_name'] ).len(1,255);
  req.checkBody( 'contact.email', input_errs['email'] ).len(1,255);
  // req.checkBody( 'contact.confirm_email', input_errs['confirm_email'] ).eq(email);

  // FIXME: Figure out how to chain isInt && len together without creating
  // separate err messages for them.
  req.checkBody( 'contact.phone_area', input_errs['phone_area'] ).isInt();
  req.checkBody( 'contact.phone_prefix', input_errs['phone_prefix'] ).isInt();
  req.checkBody( 'contact.phone_suffix', input_errs['phone_suffix'] ).isInt();

  // Optional field; check only if input has been entered
  if( phone_ext != '' ) {
    req.checkBody( 'contact.phone_ext', input_errs['phone_ext']).isInt();
  }

  req.checkBody( 'contact.state', input_errs['state'] ).neq('Select State');

  // FIXME: Figure out how to chain isInt && len together without creating
  // separate err messages for them.
  req.checkBody( 'contact.zipcode', input_errs['zipcode'] ).isInt();

  req.checkBody( 'contact.pref', input_errs['pref'] ).neq('Select Preference');
  req.checkBody( 'contact.message', input_errs['message'] ).len(1,8192);
  req.checkBody( 'contact.tos', input_errs['tos'] ).eq('agree');

  // Check the validation object for errors
  var errors = req.validationErrors();

  if (errors) {
    if( app.get('env') === 'development' ) {
      // console.log(errors);
    }

    res.locals.notifications = { type: 'err', messages: errors };
    res.locals.contact = req.body.contact;

    res.render('contact', { input_errs: res.locals.input_errs['contact'] } );
  } else {
    // console.log('Success!');

    res.locals.contact = req.body.contact;
    res.render('contact_success' );
  }
});

router.get('/privacy', function(req, res) {
  res.render('privacy');
});

router.get('/practice', function(req, res) {
  res.render('practice');
});

router.get('/search_results', function(req, res) {
  res.render('search_results', { cse_query: req.query['q'] } );
});

module.exports = router;
