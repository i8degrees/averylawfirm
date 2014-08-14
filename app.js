// Site dependencies; should always match the dependencies in package.json
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var routes = require('./routes/index');

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
app.set('site_company', 'Avery Law Firm');

// TODO: This is a stubbed e-mail address; replace with the actual one before
// production deployment!
app.set('email_address', 'laura@averylawfirm.com');

// Site environment; this is a control flag for whether or not to allow loading
// of resources from the public networks (i.e.: Internet).
app.set('remote', false );

// http://stackoverflow.com/questions/5697863/dynamic-links-with-jade
var nav_links = {
    about: {
      title: 'About',
      href: '/about'
    },
    practice: {
      title: 'Areas of Practice',
      href: '/practice'
    },
    contact: {
      title: 'Contact',
      href: '/contact'
    },
    blog: {
      title: 'Blog',
      href: '/index'
    }
};

app.set('nav_links', nav_links );

// Local site library configuration; **must** go before router!
app.use( function(req, res, next) {
  res.locals.md = md;

  next();
});

app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });

    // Human-friendly (indented) HTML output from Jade templates
    app.locals.pretty = true;
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
