/******************************************************************************

  www.averylawfirm.com

Copyright (c) 2014 Jeffrey Carpenter <i8degrees@gmail.com>
ALL RIGHTS RESERVED

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
******************************************************************************/

// Site dependencies
var express = require('express');
var app = express();
var router = express.Router();
var validator = require('express-validator');

// Blogger API back-end helper
var BloggerCommentFeed = require('./blogger/feed.js');

var blog_comment_form_helpers = module.exports = {

  process_form: function process_form( req, res, callback ) {

    // Save the state of the form input fields upon submission
    res.locals.blog_comment = req.body.blog_comment;

    // CAPTCHA accessor variables
    var challenge_field = res.locals.blog_comment['captcha_challenge_field'];
    var challenge_response_field = req.session.captcha['challenge_response_field'];

    // Equality check
    validator.validator.extend('eq', function(str, comp) {
      if( str != comp ) return false;

      return true;
    });

    // Do user input sanity checks
    req.checkBody( 'blog_comment.name', res.locals.input_errs['blog_comment'].name ).len(1,255);

    if( res.locals.blog_comment['email'] != '' ) {
      req.checkBody( 'blog_comment.email', res.locals.input_errs['blog_comment'].email ).len(1,255);
    }

    if( res.locals.blog_comment['website_url'] != '' ) {
      req.checkBody( 'blog_comment.website_url', res.locals.input_errs['blog_comment'].website_url ).len(1,255);
    }

    req.checkBody( 'blog_comment.message', res.locals.input_errs['blog_comment'].message ).len(1,4096);

    // CAPTCHA verification
    req.checkBody( 'blog_comment.captcha_challenge_field', res.locals.input_errs['blog_comment'].captcha ).eq( challenge_response_field );

    // Check the validation object for errors
    var errors = req.validationErrors();

    if( errors ) {
      if( app.get('env') === 'development' || app.get('env') === 'testing' ) {
        console.info( 'Blog Comment Form Errors:');
        console.info( errors );
      }

      // Store the validation errors inside a session store for user
      // notification; sessions grant us application state.
      for( var i = 0; i != errors.length; ++i ) {
        req.flash('notifications', { type: 'err', message: errors[i].msg } );
      }

      // WARNING: Logging req.flash messages will result in the clearing of the
      // notifications, thus never being shown to the web app. This is a
      // nightmare for debugging when we forget about this warning!
      // console.log(req.flash('notifications'));

      callback( { notifications: req.flash('notifications') } );
    }
    else {
      // Successful form validation logic

      // HTTP request
      var request = {};

      // Additional cURL options
      var options = {};

      // TODO: if 'development' || 'testing'
      options.verbose = true;
      options.stderr = true;

      // Control state of whether or not to actually send the API request to
      // Blogger's servers; in other words: a 'dry run' toggle.
      options.pretend = false;

      request.blog_id = res.locals.blog_comment['blog_id']
      request.post_id = res.locals.blog_comment['post_id']

      // Note that this does not require authentication to post to a comments
      // feed, due to the fact that anonymous comments are enabled.

      // request.token = req.session.tokens.auth.access_token;
      // console.log(req.session.tokens);

      // Container elements
      var post = {};
      post.author = {};

      // NOTE: The maximal post title length is 48; anything > 48 is clipped off
      // by by padding period symbols until the given title length == 51
      //
      // We let Google create the post title for us automatically.

      // NOTE: Maximal comment post size is 4096 characters
      post.content = res.locals.blog_comment['message'];

      // post.published = new Date().toString();  // RFC 3339
      // post.updated = new Date().toString();    // RFC 3339

      post.author.name = res.locals.blog_comment['name'];

      if( res.locals.blog_comment['email'] != '' ) {
        post.author.email = res.locals.blog_comment['email'];
      }
      else {
        post.author.email = 'noreply@blogger.com'
      }

      if( res.locals.blog_comment['website_url'] != '' ) {
        post.author.url = res.locals.blog_comment['website_url'];
      }

      // Initialize Blogger comment feed
      var feed = new BloggerCommentFeed( {} );
      feed.addPost( post );
      // console.log( feed.render() );

      feed.send( request, options );

      // Processed form successfully
      callback( { notifications: [] } );

    } // End else (successful form validation)

  }, // End function declaration
};
