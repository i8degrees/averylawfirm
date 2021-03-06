/******************************************************************************

  www.averylawfirm.com

Copyright (c) 2014 Jeffrey Carpenter <i8degrees@gmail.com>
ALL RIGHTS RESERVED

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
******************************************************************************/

// Site dependencies
var express = require('express');
var app = express();
var router = express.Router();
var jade = require('jade');
var validator = require('express-validator');

var form_helpers = module.exports = {

  process_contact_form: function process_contact_form( req, res ) {

    // Save the state of the form input fields upon submission
    res.locals.contact = req.body.contact;

    // Equality check
    validator.validator.extend('eq', function(str, comp) {
      if( str != comp ) return false;

      return true;
    });

    // Inequality check
    // validator.validator.extend('neq', function(str, comp) {
    //   if( str != comp ) return true;

    //   return false;
    // });

    // OR equality check
    // validator.validator.extend('meq', function(str, comp1, comp2 ) {
    //   if( str === comp1 || str === comp2  ) return true;

    //   return false;
    // });

    // Do user input sanity checks
    req.checkBody( 'contact.name', res.locals.input_errs['contact'].name ).len(1,255);
    req.checkBody( 'contact.email', res.locals.input_errs['contact'].email ).len(1,255);
    // req.checkBody( 'contact.confirm_email', res.locals.input_errs['contact'].confirm_email ).eq(email);

    // FIXME: Figure out how to chain isInt && len together without creating
    // separate err messages for them.
    req.checkBody( 'contact.phone_area', res.locals.input_errs['contact'].phone_area ).isInt();
    req.checkBody( 'contact.phone_prefix', res.locals.input_errs['contact'].phone_prefix ).isInt();
    req.checkBody( 'contact.phone_suffix', res.locals.input_errs['contact'].phone_suffix ).isInt();

    // Optional field; check only if input has been entered
    // if( phone_ext != '' ) {
      // req.checkBody( 'contact.phone_ext', res.locals.input_errs['contact'].phone_ext ).isInt();
    // }

    // req.checkBody( 'contact.state', res.locals.input_errs['contact'].state ).neq('Select State');

    // FIXME: Figure out how to chain isInt && len together without creating
    // separate err messages for them.
    // req.checkBody( 'contact.zipcode', res.locals.input_errs['contact'].zipcode ).isInt();

    // req.checkBody( 'contact.pref', res.locals.input_errs['contact'].pref ).neq('Select Preference');
    req.checkBody( 'contact.message', res.locals.input_errs['contact'].message ).len(1,4096);
    req.checkBody( 'contact.tos', res.locals.input_errs['contact'].tos ).eq('agree');

    // Check the validation object for errors
    var errors = req.validationErrors();

    if( errors ) {
      if( app.get('env') === 'development' || app.get('env') === 'testing' ) {
        console.info( 'Contact Form Errors:');
        console.info( errors );
      }

      // Store the validation errors inside a session store for user
      // notification; sessions grant us application state.
      for( var i = 0; i != errors.length; ++i ) {
        req.flash('notifications', { type: 'err', message: errors[i].msg } );
      }

      // WARNING: Logging req.flash messages will result in the clearing of the
      // notifications, thus never being shown to the web app. This is a
      // nightmare for debugging when we forget about this warning!
      // console.log(req.flash('notifications'));
    }
    else {
      // Successful form validation logic

      // Generate plain-text and HTML emails from a template with the user's
      // input data; it is up to the end-user's email client which to render.
      //
      // Note that these calls are synchronous.
      var text = jade.renderFile("./views/email_text_template.jade", res.locals );
      var html = jade.renderFile("./views/email_html_template.jade", res.locals );

      var email_headers = {
        // TODO: Use real email address
        to: 'i8degrees@gmail.com',
        // to: res.app.locals.settings.site_owner['email'],

        from: res.app.locals.settings.site_owner['support_email'],
        subject: 'New Message From Your Web Site',
        text: text,
        html: html
      };

      // NOTE: These will be dummy email objects if in 'development' environment
      var email = new res.locals.sendgrid.Email( email_headers );

      // In case we ever need to debug or audit the mail trail... we might have
      // a few days worth in logs storage if we're lucky! :-P
      console.log( 'Email Headers:');
      console.log( email );

      // The real (non-dummy) send function callback (email delivery); used in
      // testing && production environments
      //
      // FIXME (?): Bad credential errors are not properly caught here; only
      // the err logging functions as intended -- the intended page to route to,
      // 'error', refuses to be rendered, and instead choosing to render the
      // 'contact_success' page (reasons unknown).
      //
      // A preliminary look through the sendgrid module source, tests and
      // documentation makes me speculate that testing for this scenario is not
      // directly intended / supported.
      //
      // In either regard, it probably is not a big deal, as long as we can
      // capture the err condition accurately in our alert notifications --
      // hence all the console logging that occurs below.
      res.locals.sendgrid.send( email, function(err, json ) {

        // Log the response header (just in case!)
        console.log( 'Response Headers:');
        console.log( json );

        // Error handler for primary err object
        if( err ) {

          // ...Pray that our alert notifications are working properly, so we
          // get notified of this error event
          console.error("app-SendGrid [ERROR]: %s", err );

          // Contact failure; unable to deliver email...
          res.render('error', {
            message: 'Sorry, but we were unable to send your message.',
            error: { status: 503 }
          });
        }
        else {
          // Error handler for response headers
          if( json.message != 'success' ) {

            // ...Pray that our alert notifications are working properly, so we
            // get notified of this error event
            console.error("app-SendGrid [ERROR]: response != 'success'" );

            // Contact failure; unable to deliver email...
            res.render('error', {
              message: 'Sorry, but we were unable to send your message.',
              error: { status: 503 }
            });
          }
        }
      }); // End send function

      // Processed contact form successfully; validation && email delivery OK
      res.render('contact_success' );

    } // End else (successful form validation)
  }, // End function declaration

  // \brief Search the logged errors for a matching err
  //
  // \remarks This is used in matching an err with an input field; so we can
  // group the err message with it, making the form process a bit more user-
  // friendly.
  //
  // \param errs  req.flash object containing the errors; i.e.:
  //              req.flash('notifications').
  // \param err   The error string to compare against the errs object.
  has_err: function has_err( errs, err ) {

    for( var i = 0; i < this.count_errs(errs); ++i ) {

      if( errs[i].message === err ) {

        // Matched one of the logged validation errs to the input field
        return true;
      }
    }

    // No matching found
    return false;
  },

  // \param errs  req.flash object containing the errors; i.e.:
  //              req.flash('notifications').
  //
  // \param err   The error string to compare against the errs object.
  class_selector: function class_selector( errs, err ) {
    // Putting a red border around the input fields seems to cause more trouble
    // than it is worth (i.e.: ugly select field under Safari for iOS).
    return 'gray-border';

    if( this.has_err( errs, err ) == true ) {

      // Matched error
      return 'red-border';
    }

    // Validation OK
    return 'gray-border';
  },

  // Get the total number of errors for the page.
  //
  // \param errs  req.flash object containing the errors; i.e.:
  //              req.flash('notifications').
  count_errs: function count_errs( errs ) {

    var num_errs = 0; // loop counter

    for( var i = 0; i != errs.length; ++i ) {

      if( errs[i].type === 'err' ) {
        ++num_errs;
      }
    }

    return num_errs;
  },

  // \param errs  req.flash object containing the errors; i.e.:
  //              req.flash('notifications').
  has_errs: function has_errs( errs ) {

    if( this.count_errs( errs ) > 0 ) return true;

    return false;
  },

  phone_number_prettify: function phone_number_prettify( area, prefix, suffix ) {
    var output = '';

    output = '(' + area + ')' + ' ' + prefix + '-' + suffix;

    return output;
  }
};
