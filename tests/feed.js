// Post a comment through Blogger's comments feed for blog posts

// Dependencies
var fs = require('fs');

// Blogger API back-end helper
var BloggerCommentFeed = require('../lib/blogger/feed.js');

// Load optional shell environment config
var config = require('dotenv');
config._getKeysAndValuesFromEnvFilePath( './.env.curl' );
config.load();

// HTTP request
var req = {};

// Additional cURL options
var options = {};

options.verbose = true;
options.stderr = true;

// FIXME:
// options.pretend = process.env.DRY_RUN;

// Required
req.blog_id = process.env.BLOG_ID || '';

// Required
req.post_id = process.env.POST_ID || '';

// Required
req.token = process.env.TOKEN || '';

options.encoding = 'utf8';

// Container elements
var post = {};
post.author = {};

// NOTE: The maximal post title length is 48; anything > 48 is clipped off by
// by padding period symbols until the given title length == 51
post.title = '# Markdown Tests for Comments Header 1* [Markdow';

// NOTE: Maximal comment post size is 4096 characters
post.content = 'Research how best to go about sending a raw HTTP POST body';

// post.published = new Date().toString();  // RFC 3339
// post.updated = new Date().toString();    // RFC 3339

post.author.name = 'Anonymous Coward';
post.author.email = 'noreply@blogger.com';
post.author.url = 'https://github.com/i8degrees/';

// Initializing feed object
var feed = new BloggerCommentFeed();
feed.addPost( post );

// var output = feed.render();
// console.log( output );

console.log(req);
console.log(options);

// ...off you go, HTTP POST request!
feed.send( req, options );
