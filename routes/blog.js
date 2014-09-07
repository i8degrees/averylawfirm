// Site routing dependencies
var express = require('express');
var app = express();
var router = express.Router();
var blogger = require('../lib/blogger');

// GET https://www.googleapis.com/blogger/v3/blogs/blogId/posts?access_token=
// https://developers.google.com/blogger/docs/3.0/using#WorkingWithPosts
function blog_posts( req, res, params ) {
  blogger.api.posts.list( params, function( err, response ) {

    if( err ) {
      console.info( "app-oauth2 [INFO]: \n", err );

      // FIXME: This is a short-term solution...
      // req.session.destroy();
      console.log( "FIXME: Destroy session DB, restart web server and reload blog page." );

      // TODO: Request new app token (i.e.: blogger.client.auth.getToken).
    }
    else {

      // console.log( response );

      var ts_published = '';
      var ts_updated = '';

      if( typeof response.items != 'undefined' ) {

        for( var i = 0; i != response.items.length; ++i ) {
          // Convert RFC 3339 timestamps to human friendly format
          //
          // http://momentjs.com/docs/#/parsing/string-format/
          ts_published = blogger.moment( new Date( response.items[i].published ) );
          ts_updated = blogger.moment( new Date( response.items[i].updated ) );

          response.items[i].published = ts_published.format( 'dddd MMMM DD, YYYY' );
          response.items[i].updated = ts_updated.format( 'dddd MMMM DD, YYYY' );
        }

        res.render('blog/blog', { posts: response.items } );

      } // if response.items != undefined
      else {
        res.render('blog/blog', { posts: {} } );
      }

    } // end if not err

  }); // end blogs callback
};

function blog_comments( req, res, params ) {

  // GET https://www.googleapis.com/blogger/v3/blogs/blogId/posts/postId/comments?access_token=
  // https://developers.google.com/blogger/docs/3.0/using#WorkingWithComments
  blogger.api.comments.list( params, function( err, response ) {
    if( err ) {
      console.info( "app-oauth2 [INFO]: \n", err );
    }
    else {

      // console.log( response );

      res.render('blog/comments', { post_id: params.postId, comments: response.items } );
    } // end if not err
  }); // end comments callback
};

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

  blog_posts( req, res, blogger.params );

});

router.get('/blog_comments', function(req, res) {

  // blogger.params.blogId = req.query.blog_id;
  blogger.params.postId = req.query.post_id;

  blog_comments( req, res, blogger.params );
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
