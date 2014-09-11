// Site routing dependencies
var express = require('express');
var app = express();
var router = express.Router();
var blogger = require('../lib/blogger');

// https://github.com/GeorgeChan/captchapng
var captchapng = require('captchapng');

function generate_captcha_image() {
  // width, height, numeric captcha
  var p = new captchapng( 80, 30, parseInt( Math.random() * 9000 + 1000 ) );

  // First color: background (red, green, blue, alpha)
  p.color( 115, 95, 197, 100 );

  // Second color: paint (red, green, blue, alpha)
  p.color( 30, 104, 21, 255 );

  var img = p.getBase64();
  var imgbase64 = new Buffer( img, 'base64' );

  return imgbase64;
}

// Required routing for Google OAuth v2 implementation
router.use( function( req, res, next ) {

  var tokens = null;
  if( req.session.tokens ) {
    tokens = req.session.tokens;
    blogger.client.auth.setCredentials( req.session.tokens );
    // Redis session store (see app.js)
    console.info('app-session [INFO]: Using existing tokens in session store.');
  }
  else {
    tokens = blogger.client.auth.credentials;

    // Redis session store (see app.js)
    console.info('app-session [INFO]: Storing new tokens in session store.');

    console.log( 'access_token: %s', tokens.access_token );
    console.log( 'refresh_token: %s', tokens.refresh_token );

    if( ! tokens.access_token ) {
      console.log( 'app-oauth2 [INFO]: User authorization needed for Blogger API access.' );
      res.render('blog/blog', { topic: res.app.locals.settings.nav_links['blog'], auth_url: blogger.auth_url } );
    }

    req.session.tokens = blogger.client.auth.credentials;
  }

  next();
});

// Required routing for Google OAuth v2 implementation
router.get('/oauth2callback', function( req, res ) {

  blogger.client.auth_code = req.query.code;

  console.log('Authorization Code:');
  console.log(blogger.client.auth_code);

  // Use the authorization code generated from a successful app consent request
  // to generate our access tokens.
  blogger.client.auth.getToken( blogger.client.auth_code, function( err, tokens ) {
    // Now tokens contains an access_token and an optional refresh_token.
    // Save them.
    if( ! err ) {

      blogger.client.auth.setCredentials( tokens );

      // Non-persistent storage; the tokens are lost upon server restarts,
      // failures, etc.
      //
      // Note that this forces the end-user (visitor) to re-authenticate;
      // this typically entails revisiting the blogger_auth page so that a
      // authorization code URL can be generated to compare against Google's
      // records, and does not result in an app request consent unless the
      // token has expired, been revoked, etc.
      // oauth2Client.setCredentials(tokens);

      // Persistent storage across restarts, failures, etc.
      //
      // This feature depends on the availability of a database back-end;
      // The connect-redis module is used for session storage when running in
      // 'testing' and 'production' environments.
    }
    else {
      console.error('app-auth [ERROR]: %s', err);
    }
  }); // end token callback

  res.render('blog/blog', { notifications: req.flash('notifications') } );
});


router.get('/', function(req, res) {

  blogger.blog_posts( req, res, blogger.params, function( response ) {
    res.render('blog/blog', { posts: response.posts, notifications: response.notifications } );
  });

});

router.get('/blog_comments', function(req, res) {

  blogger.params.blogId = req.query.blog_id;
  blogger.params.postId = req.query.post_id;

  res.locals.blog_comment['blog_id'] = req.query.blog_id;
  res.locals.blog_comment['post_id'] = req.query.post_id;

  blogger.blog_comments( req, res, blogger.params, function( response ) {

    // The validation code is passed to the page for the rendering of the image
    // and in a hidden field (name = blog_comment[captcha_response] for the
    // expected response handling upon form submission.
    var validation_code = new Buffer( generate_captcha_image() ).toString( 'base64' );

    // Store the expected CAPTCHA response in user's session
    req.session.validation_code = validation_code;

    res.render('blog/comments', { blog_id: response.blogId, post_id: response.postId, comments: response.comments, notifications: req.flash('notifications'), validation_code : validation_code } );

  });

});

router.post('/blog_comments', function( req, res ) {

  // Save the state of the form input fields upon submission
  res.locals.blog_comment = req.body.blog_comment;

  // CAPTCHA verification
  var captcha_response = res.locals.blog_comment['captcha_response'];

  // Blogger API call
  blogger.params.blogId = req.body.blog_comment['blog_id'];
  blogger.params.postId = req.body.blog_comment['post_id'];

  var validation_code = new Buffer( generate_captcha_image() ).toString( 'base64' );

  if( captcha_response != req.session.validation_code ) {

    // Store the new expected CAPTCHA response string in user's session
    req.session.validation_code = validation_code;
    console.info( "app [INFO]: CAPTCHA response: ", req.body.captcha );
    console.info( "app [INFO]: CAPTCHA response was invalid." );
  }
  else {
    console.info( "app [INFO]: CAPTCHA response was successful." );

    blogger.blog_comments( req, res, blogger.params, function( response ) {
      res.render('blog/comments', { blog_id: response.blogId, post_id: response.postId, comments: response.comments, notifications: req.flash('notifications'), validation_code : validation_code } );
    });
  }

  blogger.blog_comments( req, res, blogger.params, function( response ) {
    res.render('blog/comments', { blog_id: response.blogId, post_id: response.postId, comments: response.comments, notifications: req.flash('notifications'), validation_code : validation_code } );
  });

});

// TODO
router.get('/search', function(req, res) {
  // ...
});

router.param( 'year', function( req, res, next, year ) {

  // TODO: year validation
  ts_year = blogger.moment( new Date( year ) );

  // ts_year = ts_year.format();
// ts_year = ts_year.year()+1;

  // FIXME: Why do we have to add one here?
  // ts_year = ts_year.year() + 1;
  // ts_year.year();

  // console.log( ts_year );
  req.year = ts_year.utc().format();

  next();
});

router.param( 'month', function( req, res, next, month ) {

  // TODO: month validation
  ts_month = blogger.moment( new Date( month ) );
  // FIXME: Why do we have to add one here?
  // ts_month = ts_month.month() + 1;

  console.log( ts_month );
  req.month = ts_month;

  next();
});

router.get( '/search/:year', function( req, res ) {

  var d = new Date(req.year).getUTCFullYear() - 1;
  console.log( d );

  // FIXME:
  // blogger.params.startDate = '1986-12-31T18:00:00-06:00';
  blogger.params.startDate = blogger.moment( req.year ).utc().format();
  blogger.params.endDate = req.year;

  blog_posts( res, req, blogger.params );
  console.log( blogger.params );

  // next();
});

router.get( '/search/:year/:month', function( req, res, next ) {

  res.send( req.year + ' ' + req.month );

  next();
});

module.exports = router;
