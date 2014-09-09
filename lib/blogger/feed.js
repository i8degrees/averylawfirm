// Dependencies:

// XML Parser for generating the Blogger Comment feed
//
// https://github.com/dylang/node-xml
var xml = require('xml');

// Blogger API back-end helper
var BloggerPostComment = require('./post_comment.js');

/// \brief Blogger Comments Feed API
///
/// \remarks Inspired loosely by the [Feed](https://github.com/jpmonette/feed)
/// module; unfortunately, we're dealing with only a partial feed submission
/// here, as Blogger's API is very particular about what it is willing to accept
/// here... Feed didn't much care for us at all, throwing errs left and right!
///
/// \param options Not implemented
///
/// see https://developers.google.com/blogger/docs/2.0/developers_guide_protocol#Comments
/// \see https://developers.google.com/blogger/docs/3.0/reference/comments#resource
function BloggerCommentFeed( options ) {

  // Top-level container
  this.container = [];

  // Post (comment) entry
  this.entry = [];

  // Sub-element of the overall entry
  this.author = [];

  /// \brief Post a new comment to a Blogger comments feed
  this.addPost = function( post ) {

    this.container.push( { entry: this.entry } );
    this.entry.push( { _attr: { xmlns: 'http://www.w3.org/2005/Atom' } } );

    if( post.title ) {
      this.entry.push( { title: [ { _attr: { type: 'text' } }, post.title ] } );
    }

    if( post.content ) {
      this.entry.push( { content: [ { _attr: { type: 'html' } }, post.content ] } );
    }

    // Not implemented (but supported by Blogger's Comment Posting API)
    if( post.published ) {
      this.entry.push( { published: [ post.published ] } );
    }

    if( post.updated ) {
      this.entry.push( { updated: [ post.updated ] } );
    }

    if( post.author ) {
      this.author = [];

      if( post.author.name ) {
        this.author.push( { name: post.author.name } );
      }

      if( post.author.email ) {
        this.author.push( { email: post.author.email } );
      }

      if( post.author.url ) {
        this.author.push( { uri: post.author.url } );
      }

      this.entry.push( { author: this.author } );
    }

    // console.log( this.entry );
  },

  /// Output feed structure (Atom XML feed)
  ///
  /// \param params Not implemented
  this.render = function( params ) {

    // Second argument toggles whether or not to indent output (defaults to true)
    var output = xml( this.container, true );

    // console.log( output );
    return output;
  },

  /// \brief Use the feed as the raw body of a HTTP POST request.
  ///
  /// \remarks This uses Blogger's API to post a new comment for a blog post.
  ///
  /// \note Requires an app consent to obtain an authorization token (Google
  /// OAuth).
  ///
  /// \see ./lib/blogger/post_comment.js and ./tests/curl.js
  this.send = function( req, options ) {

    // console.log('---mark---');

    req.body = this.render();

    var post = new BloggerPostComment( req, options );

    // ...off you go, HTTP POST request!
    post.send( post.options, function on_response( err, data ) {
      if( err ) {
        console.error("app-blogger [ERROR]: ", err );
      }
      else {
        console.log( data );
      }
    }); // end curl request
  } // end function send

};

module.exports = BloggerCommentFeed;
