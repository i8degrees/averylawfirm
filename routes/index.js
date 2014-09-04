// Site (route) dependencies
var express = require('express');
var router = express.Router();
var fs = require('fs');

// Initialize page content (pulled from Markdown files)
var opts = { encoding: 'ascii' };

// \param title The page title
var topics = {
  about: {
    title: 'About',
    // id: 'about',
    // load: function load() { return fs.readFileSync('./data/pages/about.md', opts ); }
    load: null
  },
  privacy: {
    title: 'Privacy Policy',
    // id: 'privacy',
    load: function load() { return fs.readFileSync('./data/pages/privacy.md', opts ); }
  },
  disclaimer: {
    title: 'Email Disclaimer',
    // id: 'disclaimer',
    // load: function load() { return fs.readFileSync('./data/pages/disclaimer.md', opts ); }
    load: null
  }
};

router.get('/', function(req, res) {

  // Mock errors object
  // req.flash('notifications', res.locals.mock_errs );

  res.render('index', { topic: topics['about'], notifications: req.flash('notifications') } );
});

router.post('/', function(req, res) {

  res.locals.form_helpers.process_contact_form( req, res );

  res.render('index', { topic: topics['about'], notifications: req.flash('notifications') } );
});

router.get('/about', function(req, res) {
  res.render('about', { topic: topics['about'] } );
});

router.get('/disclaimer', function(req, res) {
  res.render('disclaimer', { topic: topics['disclaimer'] } );
});

router.get('/privacy', function(req, res) {
  res.render('privacy', { topic: topics['privacy'] } );
});

// router.get('/search_results', function(req, res) {
//   res.render('search_results', { cse_query: req.query['q'] } );
// });

router.get('/locations', function(req, res) {
  res.render('locations');
});

// TODO: Move blog routing into its own file -- routes/blog.js
router.get('/blog', function(req, res) {

  // https://github.com/google/google-api-nodejs-client/
  var google = require('googleapis');
  var OAuth2 = google.auth.OAuth2;

  // var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
  var oauth2Client = new OAuth2(process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_OAUTH_CLIENT_SECRET, process.env.GOOGLE_OAUTH_REDIRECT_URL);

  // generate a url that asks permissions for Blogger
  var scopes = [
    'https://www.googleapis.com/auth/blogger',
  ];

  var url = oauth2Client.generateAuthUrl({
    access_type: 'online', // 'online' (default) or 'offline' (gets refresh_token)
    scope: scopes,
  });

  // Visit this URL in your web browser to consent (authorize) app access
  console.log(url);

  // Light-weight (yeah, buddy!) RESTful API client; used for communication
  // between Google's Blogger v3 JSON service
  // var Client = require('node-rest-client').Client;
  // client = new Client();

  // Direct API
  // client.get('https://www.googleapis.com/blogger/v3/users/self/blogs?key=AIzaSyAy4Gb3ySz_4yDz5LJ_3k5LlMi4soRT5aA', function(data, response) {
    // parsed response body as js object
    // console.log('Data:');
    // console.log(data);

    // raw response
    // console.log('Response:');
    // console.log(response);
  // });

  // function respond_handler( req, res, next ) {
  //   res.send('');
  //   next();
  // }

  res.render('blog', { topic: topics['blog'] } );
});

module.exports = router;
