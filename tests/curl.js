// Post a comment through Blogger's comments feed for blog posts

// Dependencies
var fs = require('fs');

// Blogger API back-end helper
var BloggerPostComment = require('../lib/blogger/post_comment.js');

// Load optional shell environment config
var config = require('dotenv');
config._getKeysAndValuesFromEnvFilePath( './.env.curl' );
config.load();

// HTTP request
var req = {};

// Additional cURL options
var options = {};

// options.verbose = false;

// FIXME:
options.pretend = process.env.DRY_RUN;

// Required
req.blog_id = process.env.BLOG_ID || '';

// Required
req.post_id = process.env.POST_ID || '';

// Required
req.token = process.env.TOKEN || '';

options.encoding = 'utf8';

if( process.env.CURL_FILE ) {
  req.body = fs.readFileSync( process.env.CURL_FILE, options.encoding );
}
else {
  req.body = fs.readFileSync( './post_comment.atom', options.encoding );
}

var post = new BloggerPostComment( req, options );
// console.log(post.options);

// ...off you go, HTTP POST request!
post.send( post.options, function on_response( err, data ) {
  if( err ) {
    console.error("app-blogger [ERROR]: ", err );
  }
  else {
    console.log( data );
  }
});
