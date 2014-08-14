// Site dependencies
var express = require('express');
var app = express();
var router = express.Router();
var validator = require('express-validator');

// Local site dependencies

// var flash = {
//   type: 'alert-success',
//   messages: [ {
//     msg: 'Successful form submission'
//   } ]
// };
var flash = null;

// TODO: clean up err messages
//
// contact page form validity err labels
var req_input_errs = {
  first_name: 'Please leave your first name.',
  last_name: 'Please leave your last name.',
  email: 'Please leave your e-mail address.',
  // confirm_email: 'Your e-mail address does not match.',
  phone: 'Your ten (10) digit phone number is required.',
  state: 'Your state is required.',
  zipcode: 'Your five (5) digit zip code is required.',
  contact_pref: 'Please choose your contact preference.',
  message: 'Please leave a message.',
  tos: 'You must agree to our disclaimer.'
};

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
  res.render('contact', { req_input_errs: req_input_errs, flash: flash } );
});

router.post('/contact', function(req, res) {
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var email = req.body.email;
  // var confirm_email = req.body.confirm_email;
  var phone = req.body.phone;
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
  // req.checkBody( 'confirm_email', req_input_errs['confirm_email'] ).eq(email);

  // TODO: phone && phone extension
  req.checkBody( 'phone', req_input_errs['phone'] ).notEmpty();
  // req.checkBody( 'phone', req_input_errs['phone'] ).isInt();

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
    res.render('contact', { req_input_errs: req_input_errs, flash: { type: 'alert-danger', messages: errors }, post_data: req.body } );
  } else {
    console.log('Success!');

    // TODO: Redirect instead???
    res.render('contact_success', { post_data: req.body } );
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
