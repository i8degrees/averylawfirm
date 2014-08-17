// Site (route) dependencies
var express = require('express');
var app = express();
var router = express.Router();
var jade = require('jade');
var validator = require('express-validator');

// contact GET view
router.get('/', function(req, res) {
  res.render('contact', { input_errs: res.locals.input_errs['contact'] } );
});

// contact POST view
router.post('/', function(req, res) {

  // Save the state of the form input fields upon submission
  res.locals.contact = req.body.contact;

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

    // Render the whole page again, with passing of the validation errors for
    // display back to the end-user.
    res.locals.notifications = { type: 'err', messages: errors };
    res.render('contact', { input_errs: res.locals.input_errs['contact'] } );
  }
  else {
    // Successful form validation logic

    // Generate plain-text and HTML emails from a template with the user's
    // input data; it is up to the end-user's email client which to render.
    //
    // Note that these calls are synchronous.
    var text = jade.renderFile("./views/email_text_template.jade", res.locals );
    var html = jade.renderFile("./views/email_html_template.jade", res.locals );

    // TODO: Use real email addresses; these are stubs.
    var mail = {
      to: 'i8degrees@gmail.com',
      from: 'i8degrees@gmail.com',
      subject: 'Contact Form Inquiry',
      text: text,
      html: html
    };

    // Dummy email objects if in development environment
    var email = new res.locals.sendgrid.Email( mail );
    console.log( email );

    res.locals.sendgrid.send( email, function(err, json ) {
      if( err ) {
        console.error("[SendGrid]: %s", err );
      }
      else {
        console.log( json );
      }
    });

    res.render('contact_success' );
  }
});

module.exports = router;
