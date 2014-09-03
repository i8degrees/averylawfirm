// Site dependencies; should always match the dependencies in package.json
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');
var helmet = require('helmet');
var RedisSessionStore = require('connect-redis')(session);

// Heroku deployment-specific dependencies

// RedisCloud
var url = require('url');
var redis = require('redis'); // Used for createClient function

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

// Default options used during session initialization
//
// https://github.com/expressjs/session
var session_opts = {
  secret: 'Not a well kept secret!',
  cookie: {
    maxAge: null,           // Default value from express-session docs
    httpOnly: true
    // HTTPS only
    // secure: true
  },

  // Default values for getting rid of deprecated warnings logging from
  // express-session
  resave: true,             // Default value from express-session docs
  saveUninitialized: true,  // Default value from express-session docs

  // Session storage; MemoryStore is the default, and is not "production-ready".
  store: null,
};

// Redis-powered session storage initialization
//
// https://github.com/visionmedia/connect-redis
if( app.get('env') === 'development' ) {

  // Do nothing; use session store defaults (MemoryStore).
}

// Provide mock testing object (experimental as in I haven't tested this much!)
else if( app.get('env') === 'testing' ) {

  console.info( "app-redis [INFO]: Initializing Redis-backend session store..." );

  var redis_store_opts = {
    // Local Redis session store defaults -- requires local installation of
    // Redis server.
    store: {
      host: 'localhost',
      port: 6379
    },
  };

  session_opts.store = new RedisSessionStore( redis_store_opts );

  // Initialize default error handler...
  session_opts.store.client.on( 'error', function( err ) {
    console.error( "app-redis [ERROR]: Could not connect to Redis-backend session store." );
  });
}

// Heroku Deployment production environment (requires RedisCloud add-on)
//
// 1. https://app.redislabs.com/main/dashboard
// 2. https://devcenter.heroku.com/articles/rediscloud
// 3. ```heroku config:get REDISCLOUD_URL```
else if( app.get('env') === 'production' ) {

  if( process.env.REDISCLOUD_URL != null ) {
    var redisURL = url.parse(process.env.REDISCLOUD_URL);
    var client = redis.createClient(redisURL.port, redisURL.hostname, { no_ready_check: true });
    client.auth(redisURL.auth.split(":")[1]);

    console.info( "app-redis [INFO]: Initializing Redis-backend session store..." );

    session_opts.store = new RedisSessionStore( { client: client } );

    // Initialize default error handler...
    session_opts.store.client.on( 'error', function( err ) {
      console.error( "app-redis [ERROR]: Could not connect to Redis-backend session store." );
    });
  } else {
    console.error( "app-redis [ERROR]: Could not connect to Redis-backend session store; REDISCLOUD_URL environment variable is not set." );
  }
}

// Initialize session; what is used to sign the cookie with is dependent upon
// the underlying environment (SESSION_SECRET) at the time of app startup.
//
// This is a required dependency for the connect-flash module
if( process.env.SESSION_SECRET != null ) {
  session_opts.secret = process.env.SESSION_SECRET;
} else {
  console.warn( "app [WARNING]: SESSION_SECRET environment variable is not set; using **insecure** default..." );
}

app.use( session( session_opts ) );

// Use connect-flash module for passing notification messaging across defined
// routes
app.use( flash() );

// Use Helmet security header defaults
//
// See also: https://github.com/evilpacket/helmet
app.use( helmet() );

app.use(express.static(path.join(__dirname, 'public')));

// Global site settings
//
// These are globally accessible when the app var has been declared and
// initialized -- see above) at `app.locals.settings` or
// `res.app.locals.settings`.
//
// Global access from within Jade templates is (automatically) granted at
// locals.settings.

var site_owner = {
  name: 'Laura Avery',
  company: 'Avery Law Firm',
  // TODO: This is a stubbed e-mail address; replace with the actual one before
  // production deployment!
  email: 'averyfirm@gmail.com',
  support_email: 'averyfirm@gmail.com',
  phone: '+1 (479) 739-1903',
  // https://developer.apple.com/library/ios/featuredarticles/iPhoneURLScheme_Reference/PhoneLinks/PhoneLinks.html
  phone_url: 'tel:1-479-739-1903',
  fax: '+1 (479) 439-8283',
  addr1: '103 N College Ave Ste 5',
  addr2: 'Fayetteville, AR 72701',
  // TODO: Add applicable links for the URLs below:
  facebook_url: 'https://www.facebook.com/laurasusanavery',
  twitter_url: '',
  linkedin_url: '',
  rss_url: ''
};

var site_developer = {
  name: 'Jeffrey Carpenter',
  email: 'i8degrees@gmail.com',
  website: 'https://github.com/i8degrees/'
};

app.set('site_owner', site_owner );
app.set('site_developer', site_developer );

// Site environment; this is a control flag for whether or not to allow loading
// of resources from the public networks (i.e.: Internet).
app.set('remote', true );

// http://stackoverflow.com/questions/5697863/dynamic-links-with-jade
var nav_links = {
    about: {
      title: 'About',
      href: '/about'
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
      title: 'Contact Us',
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
    title: 'Email Disclaimer',
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

  // TODO: clean up err messages
  //
  // contact page form validity err labels
  res.locals.input_errs = {
    contact: {
      name: 'Please leave your full name.',
      email: 'Please leave your e-mail address.',
      // confirm_email: 'Your e-mail address does not match.',
      // phone: 'Your ten digit phone number is required.',
      phone_area: 'Your 3-digit area code is required.',
      phone_prefix: 'Your 3-digit phone prefix is required.',
      phone_suffix: 'Your 4-digit phone suffix is required.',
      // phone_ext: 'Your phone extension can only contain numbers.',
      // state: 'Your state is required.',
      // zipcode: 'Your five digit zip code is required.',
      // pref: 'Please choose your contact preference.',
      message: 'Please leave a message.',
      tos: 'You must agree to our disclaimer.'
    }
  };

  mock_errs = null;

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
  // res.locals.breadcrumbs = [];

  next();
});

// Mock errors object that we can pass around to use while developing contact
// form features.
//
// Depends on res.locals.input_errs object being set (see above).
app.use( function( req, res, next ) {

  res.locals.mock_errs = [
    {
      type: 'err',
      message: res.locals.input_errs['contact'].name
    },
    {
      type: 'err',
      message: res.locals.input_errs['contact'].message
    }
  ];

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

var port = Number(process.env.PORT || 5000);

var server = app.listen(port, function() {
  console.log('Listening at TCP/IP %s: %s:%d', server.address().family, server.address().address, server.address().port);
  console.log('Site environment: %s', app.get('env') );
  console.log('Remote resource fetching: %s ', app.get('remote') );
});
