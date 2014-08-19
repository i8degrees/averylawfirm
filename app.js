// Site dependencies; should always match the dependencies in package.json
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');

// SMTP provider for contact page; this is initialized to either a mock object
// or the real deal, depending on the environment.
var sendgrid = null;

// Site routes
var routes = require('./routes/index');
var practice = require('./routes/practice');
var contact = require('./routes/contact');

// Markdown filter
//
// This will be available to all routes via res.locals.md.
//
// Usage from within the Jade template:
//
// locals.md!=md('Hello, [world](/index)!')
//
// See also: http://stackoverflow.com/questions/7549627/passing-raw-markdown-text-to-jade
var md = require("node-markdown").Markdown;

// Local site dependencies
var form_helpers = require('./lib/form_helpers');

// Site configuration (configuration, port, site model, routes and so on)
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));

app.use( bodyParser() );

// this line must be immediately after express.bodyParser
app.use( validator() );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Global site settings
//
// These are globally accessible when the app var has been declared and
// initialized -- see above) at app.locals.settings.
//
// Global access from within Jade templates is (automatically) granted at
// locals.settings.

// TODO: This is a stubbed e-mail address; replace with the actual one before
// production deployment!
app.set('site_owner', { name: 'Laura Avery', company: 'Avery Law Firm', email: 'laura@averylawfirm.com' } );
app.set('site_developer', { name: 'Jeffrey Carpenter', email: 'i8degrees@gmail.com', website: 'https://github.com/i8degrees/' } );

// Site environment; this is a control flag for whether or not to allow loading
// of resources from the public networks (i.e.: Internet).
app.set('remote', true );

// http://stackoverflow.com/questions/5697863/dynamic-links-with-jade
var nav_links = {
    about: {
      title: 'About',
      href: '/index'
    },
    practice: {
      title: 'Areas of Practice',
      // href: '/practice?id=0'
      href: '/practice'
    },
    locations: {
      title: 'Locations',
      href: '/locations'
    },
    contact: {
      title: 'Contact',
      href: '/contact'
    },
    blog: {
      title: 'Blog',
      href: '/blog'
    }
};

var site_links = {
  privacy: {
      title: 'Privacy Policy',
      href: '/privacy'
    },
  disclaimer: {
      title: 'Disclaimer',
      href: '/disclaimer'
    }
};

app.set('nav_links', nav_links );
app.set('site_links', site_links );

// Local site library configuration; **must** go before router!
app.use( function(req, res, next) {
  res.locals.md = md;
  res.locals.form_helpers = form_helpers;

  // Avoid ReferenceError by creating the container used by the form elements
  // after form submission (HTTP 'POST') ahead of time; this is necessary so we
  // can pass the object to the Jade template for a HTTP 'GET' of the contact
  // page without first checking if the req.body.<field> object exists.
  //
  // See also: http://dailyjs.com/2012/09/13/express-3-csrf-tutorial/
  res.locals.contact = {};

  // Simple server-side site messaging
  res.locals.notifications = {
    // Type of message
    //
    // The value should be one of the following strings: success, err.
    type: 'success',

    // Array of messages
    //
    // The value should be object(s) containing the message string, labeled
    // 'msg'.
    //
    // i.e.: messages: [ { msg: 'err string 1' }, { msg: 'err string 2' } ]
    messages: [ ]
  };

  // TODO: clean up err messages
  //
  // contact page form validity err labels
  res.locals.input_errs = {
    contact: {
      first_name: 'Please leave your first name.',
      last_name: 'Please leave your last name.',
      email: 'Please leave your e-mail address.',
      // Not used
      confirm_email: 'Your e-mail address does not match.',
      phone: 'Your ten digit phone number is required.',
      phone_area: 'Your three digit area code is required.',
      phone_prefix: 'Your three digit phone prefix is required.',
      phone_suffix: 'Your four digit phone suffix is required.',
      // Optional
      phone_ext: 'Your phone extension can only contain numbers.',
      state: 'Your state is required.',
      zipcode: 'Your five digit zip code is required.',
      pref: 'Please choose your contact preference.',
      message: 'Please leave a message.',
      tos: 'You must agree to our disclaimer.'
    }
  };

  // SendGrid setup; this will send an email upon a successful form submission.
  //
  // We always provide a mock object instead when in development mode.
  //
  // See README.md for testing and production setup instructions.
  if( app.get('env') === 'development' ) {
    sendgrid = {
      send: function send( payload, callback ) {
        return payload;
      },
      Email: function Email( dummy ) { return dummy; }
    };
  } else {
    sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD );
  }

  res.locals.sendgrid = sendgrid;

  // Page tracking (href, query, pathname)
  res.locals.loc = req._parsedUrl;

  // Breadcrumbs (navigation aid).
  //
  // Implements simple URL tracking.
  //
  // Usage from within the Jade template: locals.breadcrumbs
  //
  // breadcrumbs is an array object that should contain zero or more objects,
  // with the member pairs: 'title' (string), 'href' (string), 'home' (string).
  res.locals.breadcrumbs = [];

  next();
});

app.use('/', routes );
app.use('/practice', practice );
app.use('/contact', contact );

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if( app.get('env') === 'development' || app.get('env') === 'testing' ) {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: { status: err.status }
    });
});

if( app.get('env') === 'development' ) {

  // Human-friendly (indented) HTML output from Jade templates
  app.locals.pretty = true;

  // Additional Jade control options
  app.locals.compileDebug = true;

} else {  // Assume production mode (live, public site)
  // Computer-friendly (no whitespace)
  //
  // Note that this is the current default; I reset it here to be safe.
  app.locals.pretty = false;

  // Additional Jade control options
  app.locals.compileDebug = false;
}

module.exports = app;

// Heroku deployments expect port 5000
var port = Number(process.env.PORT || 5000);

// Local site development router-friendly port for forwarding through NAT
if(app.get('env') === 'development') {
  port = 8222;
}

var server = app.listen(port, function() {
  console.log('Listening at TCP/IP %s: %s:%d', server.address().family, server.address().address, server.address().port);
  console.log('Site environment: %s', app.get('env') );
  console.log('Remote resource fetching: %s ', app.get('remote') );
});
