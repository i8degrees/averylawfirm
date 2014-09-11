// Site routing dependencies
var express = require('express');
var app = express();
var router = express.Router();
var blogger = require('../lib/blogger');

// https://www.npmjs.org/package/recaptcha
var Recaptcha = require('recaptcha').Recaptcha;

// GET https://www.googleapis.com/blogger/v3/blogs/blogId/posts?access_token=
// https://developers.google.com/blogger/docs/3.0/using#WorkingWithPosts
function blog_posts( req, res, params, callback ) {
  blogger.api.posts.list( params, function( err, response ) {

    if( err ) {
      console.info( "app-oauth2 [INFO]: \n", err );
      console.log(params);

      // FIXME: This is a short-term solution...
      // req.session.destroy();
      console.log( "FIXME: Destroy session DB, restart web server and reload blog page." );

      // TODO: Request new app token (i.e.: blogger.client.auth.getToken).
      return res.render('blog/blog', { topic: res.app.locals.settings.nav_links['blog'], auth_url: blogger.auth_url } );
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

        callback( { posts: response.items, notifications: req.flash('notifications') } );
        // res.render('blog/blog', { posts: response.items, notifications: req.flash('notifications') } );

      } // if response.items != undefined
      else {
        callback( { posts: {}, notifications: req.flash('notifications') } );
        // res.render('blog/blog', { posts: {}, notifications: req.flash('notifications') } );
      }

    } // end if not err

  }); // end blogs callback
};

function blog_comments( req, res, params, callback ) {

  // GET https://www.googleapis.com/blogger/v3/blogs/blogId/posts/postId/comments?access_token=
  // https://developers.google.com/blogger/docs/3.0/using#WorkingWithComments
  blogger.api.comments.list( params, function( err, response ) {
    if( err ) {
      console.info( "app-oauth2 [INFO]: \n", err );
      console.log(params);

      // FIXME: This message does not get displayed to the end-user.
      req.flash('notifications', { type: 'err', message: err.message, code: err.code } );

      // TODO: Remove blog_id, post_id
      res.render('blog/comments', { blog_id: params.blogId, post_id: params.postId, comments: {}, recaptcha_resposne_field: params.recaptcha_response_field, notifications: req.flash('notifications') } );
    }
    else {

      // console.log( response );

      // TODO: Remove blog_id, post_id
      callback( { blog_id: params.blogId, post_id: params.postId, comments: response.items, notifications: req.flash('notifications') } );
      // res.render('blog/comments', { blog_id: params.blogId, post_id: params.postId, comments: response.items, recaptcha_resposne_field: params.recaptcha_response_field, notifications: req.flash('notifications'), recaptcha_form: recaptcha.toHTML() } );

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

  blog_posts( req, res, blogger.params, function( response ) {
    res.render('blog/blog', { posts: response.posts, notifications: response.notifications } );
  });

});

router.get('/blog_comments', function(req, res) {

  blogger.params.blogId = req.query.blog_id;
  blogger.params.postId = req.query.post_id;

  res.locals.blog_comment['blog_id'] = req.query.blog_id;
  res.locals.blog_comment['post_id'] = req.query.post_id;
  // res.locals.recaptcha_response_field = '';

  // var recaptcha = new Recaptcha( process.env.RECAPTCHA_PUBLIC_KEY, process.env.RECAPTCHA_PRIVATE_KEY );

  // res.render('form.jade', {
  //   layout: false,
  //   locals: { recaptcha_form: recaptcha.toHTML() }
  // });

  blog_comments( req, res, blogger.params, function( response ) {
    var recaptcha = new Recaptcha( process.env.RECAPTCHA_PUBLIC_KEY, process.env.RECAPTCHA_PRIVATE_KEY );

    res.render('blog/comments', { blog_id: response.blogId, post_id: response.postId, comments: response.comments, notifications: req.flash('notifications'), recaptcha_form: recaptcha.toHTML() } );

  });
});

router.post('/blog_comments', function( req, res ) {

  // Save the state of the form input fields upon submission
  res.locals.blog_comment = req.body.blog_comment;
  res.locals.recaptcha_response_field = req.body.recaptcha_response_field;

  // https://github.com/aldipower/nodejs-recaptcha
  // var recaptcha = require('recaptcha-async');
  // recaptcha = new recaptcha.reCaptcha();

  // // Eventhandler that is triggered by checkAnswer()
  // recaptcha.on( 'data', function( response ) {

  //   if( response.is_valid ) {
  //     html = "valid answer"
  //     // console.log(html);
  //   }
  //   else {
  //     html = recaptcha.getCaptchaHtml(  process.env.RECAPTCHA_PUBLIC_KEY,
  //                                       response.error );
  //     // console.log(html);
  //     console.log(response.error);
  //   }

  // }); // end func callback

  // Check the user response by calling the google servers and sends a
  // 'data'-event
  // recaptcha.checkAnswer(  process.env.RECAPTCHA_PRIVATE_KEY,
                          // req.connection.remoteAddress,
                          // req.body.recaptcha_challenge_field,
                          // req.body.recaptcha_response_field );

  blogger.params.blogId = req.body.blog_comment['blog_id'];
  blogger.params.postId = req.body.blog_comment['post_id'];

  var data = {
    remoteip: req.connection.remoteAddress,
    challenge: req.body.recaptcha_challenge_field,
    response: req.body.recaptcha_response_field
  };

  var recaptcha = new Recaptcha( process.env.RECAPTCHA_PUBLIC_KEY, process.env.RECAPTCHA_PRIVATE_KEY, data );

  recaptcha.verify( function( success, error_code ) {
    if( success ) {
      res.send('Recaptcha response valid.');
    }
    else {

      console.log(error_code);

      blog_comments( req, res, blogger.params, function( response ) {

        res.render('blog/comments', { blog_id: response.blogId, post_id: response.postId, comments: response.comments, notifications: req.flash('notifications'), recaptcha_form: recaptcha.toHTML() } );

      });
    }
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
