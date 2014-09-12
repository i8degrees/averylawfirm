// Site routing dependencies
var express = require('express');
var app = express();
var router = express.Router();
var blogger = require('../lib/blogger');

// https://github.com/GeorgeChan/captchapng
var captchapng = require('captchapng');

/// \returns An object with two name/value pairs: image, answer. The image is
/// a base64 encoded string with the mime-type of 'image/png'. It can be used
/// in an image element like so (assuming you've used the generate_captcha_image
/// function to create a variable called captcha and passed this onwards to the
/// route's 'captcha' variable):
/// \code
/// <img src='data:image/png; base64,'+ captcha.image />
/// \endcode
/// The CPATHCA answer is the second pair, and is the displayed CAPTCHA
/// challenge answer.
///
/// \see views/captcha.jade
function generate_captcha_image() {

  var challenge_answer = parseInt( Math.random() * 9000 + 1000 );

  // width, height, numeric CAPTCHA
  var p = new captchapng( 80, 30, challenge_answer );

  // First color: background (red, green, blue, alpha)
  p.color( 115, 95, 197, 100 );

  // Second color: paint (red, green, blue, alpha)
  p.color( 30, 104, 21, 255 );

  var img = p.getBase64();
  var imgbase64 = new Buffer( img, 'base64' ).toString('base64');

  return { image: imgbase64, answer: challenge_answer };
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

  // Get post for comments
  blogger.post( req, res, blogger.params, function( response ) {

    var post = response;

    // Form the post's URL to this server
    post.post.selfLink = '/blog?blog_id=' + blogger.params.blogId + '&post_id=' + blogger.params.postId;

    blogger.blog_comments( req, res, blogger.params, function( response ) {

      // base64 encoded image string in captcha.image
      var captcha = generate_captcha_image();
      // console.info( 'app [INFO]: CAPTCHA answer: ', captcha.answer );

      // Store the correct CAPTCHA response in user's session
      req.session.captcha = {
        challenge_response_field: captcha.answer
      };

      // console.log(post);
      // console.log(response.comments);

      res.render('blog/comments', { blog_id: response.blogId, post_id: response.postId, posts: post, comments: response.comments, notifications: req.flash('notifications'), captcha: captcha } );

    }); // end blog comments callback

  }); // end blog post callback

});

router.post('/blog_comments', function( req, res ) {

  // Save the state of the form input fields upon submission
  res.locals.blog_comment = req.body.blog_comment;

  // Blogger API call for grabbing comments
  blogger.params.blogId = res.locals.blog_comment['blog_id'];
  blogger.params.postId = res.locals.blog_comment['post_id'];

  // CAPTCHA accessor variables
  var challenge_field = res.locals.blog_comment['captcha_challenge_field'];
  var challenge_response_field = req.session.captcha['challenge_response_field'];

  // Generate a new CAPTCHA, regardless of success state, in preparation of the
  // possible event that the end-user attempts submission of another comment.

  // base64 encoded image string in captcha.image
  var captcha = generate_captcha_image();

  // CAPTCHA verification; check the user's answer with the correct answer
  // (stored in session).
  if( challenge_field != challenge_response_field ) {

    console.info( "app [INFO]: CAPTCHA response was invalid." );
    console.info( "app [INFO]: User's answer was: ", challenge_field );
    console.info( "app [INFO]: The answer was: ", captcha.answer );
  }
  else {
    console.info( "app [INFO]: CAPTCHA response was successful." );

    // Store the new expected CAPTCHA response string in user's session, in
    // preparation of the possible event that the end-user attempts submission
    // of another comment.
    // req.session.captcha = {
      // challenge_response_field: captcha.answer
    // };

    // blogger.blog_comments( req, res, blogger.params, function( response ) {
      // res.render('blog/comments', { blog_id: response.blogId, post_id: response.postId, comments: response.comments, notifications: req.flash('notifications'), captcha: captcha } );
    // });
  }

  // Get post for comments
  blogger.post( req, res, blogger.params, function( response ) {

    var post = response;

    // Form the post's URL to this server
    post.post.selfLink = '/blog?blog_id=' + blogger.params.blogId + '&post_id=' + blogger.params.postId;

    res.locals.blog_comment_form_helpers.process_form( req, res, function(process_form) {

      // if process_form success logic

      blogger.blog_comments( req, res, blogger.params, function( response ) {

        // WARNING: Logging req.flash messages will result in the clearing of the
        // notifications, thus never being shown to the web app. This is a
        // nightmare for debugging when we forget about this warning!
        // console.log( process_form.notifications );

        // Store the new expected CAPTCHA response string in user's session, in
        // preparation of the possible event that the end-user attempts submission
        // of another comment.
        req.session.captcha = {
          challenge_response_field: captcha.answer
        };

        res.render('blog/comments', { blog_id: response.blogId, post_id: response.postId, posts: post, comments: response.comments, notifications: process_form.notifications, captcha: captcha } );
      }); // end blog_comments callback

    }); // end process_form callback

  }); // end blog post callback

});

router.get('/delete_comment', function( req, res ) {

  blogger.params.blogId = req.query['blog_id'];
  blogger.params.postId = req.query['post_id'];
  blogger.params.commentId = req.query['comment_id'];

  // Blog name
  var blog = {};

  // Post name
  var post = {};

  // Get post title
  blogger.post( req, res, blogger.params, function( response ) {

    post.title = response.post.title;

    // Form the post's URL
    post.url = '/blog?blog_id=' + blogger.params.blogId + '&post_id=' + blogger.params.postId;

  }); // end blog post callback

  // Get blog name
  blogger.blog( req, res, blogger.params, function( response ) {

    blog.name = response.blog.name;

    // Get the comment
    blogger.comment( req, res, blogger.params, function( response ) {

      res.render( 'blog/delete_comment', { blog_id: response.blogId, post_id: response.postId, comment_id: response.commentId, blog: blog, post: post, comment: response.comment, notifications: req.flash('notifications') } );

    }); // end blog_comment callback

  }); // end blog callback

});

router.post('/delete_comment', function( req, res ) {

  //

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
