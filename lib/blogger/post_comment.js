// Dependencies
var curl = require('curlrequest');

/// \brief Google's API library does not offer support for posting comments
/// through the comments feed, yet it is supported (as of v2 API).
///
/// \param options Additional options to give to cURL; this shouldn't be
/// necessary normally, and is provided for the convenience of future debugging
/// and API changes.
///
/// \note Anonymous comment posts **must** be enabled in order for this
/// functionality to work, otherwise the server will do nothing with the raw
/// request body.
///
/// \see ./lib/feed.js, ./lib/blogger.js
///
/// \see Google's official [API documentation](https://developers.google.com/blogger/docs/2.0/developers_guide_protocol#Comments)
/// describes the process we do in this script.
///
/// \see Consult [curlrequest's](https://github.com/chriso/curlrequest) project
/// README for how to use the available options.
function BloggerPostComment( req, options ) {

  this.req = {};

  /// Request options; all parameters are required
  this.req.blog_id = req.blog_id;
  this.req.post_id = req.post_id;

  this.req.token = {};

  /// This object should be filled with the values from Google's official
  /// Node.JS API for OAuth (see also: lib/blogger.js) -- i.e.: the oauth2Client
  /// object.
  ///
  /// \see https://github.com/google/google-api-nodejs-client/
  this.req.token = req.token || '';

  /// The refresh token is only sent during authorization requests, and should
  /// be stored...
  // this.token.refresh_token = req.token.refresh_token || '';
  this.req.token_type = req.token.token_type || 'Bearer';

  /// Bearer 1/<token> -- used in forming authorization headers
  this.req.token_ver = '1';

  /// Raw request body sent; i.e.: comment feed created from BloggerCommentFeed.
  /// Could also be the dumped buffer of a file read.
  this.req.body = req.body;

  /// Blogger's API end-point for comment feeds
  this.req.url =  'https://www.blogger.com/feeds/' + this.req.blog_id + '/' +
                  this.req.post_id + '/comments/default';

  /// cURL options
  this.options = {};

  this.options.url = options.url || this.req.url;
  this.options.method = options.method || 'POST';

  /// Request timeout
  this.options.timeout = options.timeout || 60;

  /// Encoding type used for both file and HTTP request
  this.options.encoding = options.encoding || 'utf8';

  /// Raw request body
  this.options.data = options.body || this.req.body;

  if( typeof options.headers === 'undefined' ) {
    options.headers = {};
  }

  /// HTTP Request headers
  this.options.headers = {};

  this.options.headers['Encoding'] = options.encoding || this.options.encoding;
  this.options.headers['Accept'] = options.headers['Accept'] || 'text/*';

  /// File size for request body
  this.options.headers['Content-Length'] =  options.headers['Content-Length'] ||
                                            this.req.body.length;

  /// Raw request body file type
  this.options.headers['Content-Type'] =  options.headers['Content-Type'] ||
                                          'application/atom+xml';

  this.options.headers['Connection'] =  options.headers['Connection'] ||
                                        'keep-alive';

  /// Google OAuth (access or refresh token)
  /// Example auth header: 'Authorization': 'Bearer 1/<token>',
  this.options.headers['Authorization'] = options.headers['Authorization'] ||
                                          this.req.token_type + ' ' +
                                          this.req.token_ver + '/' +
                                          this.req.token;

  // console.log(this.req);
  // console.log(this.options);

  /// cURL debugging options
  this.options.verbose = options.verbose || true;
  this.options.stderr = options.stderr || false;
  this.options.pretend = options.pretend || false;  // Dry-run

  /// \brief Default callback for curl.request used when user-defined error
  /// handling is not defined.
  this.on_response = function( err, data ) {
    if( err ) {
      console.error("app-blogger [ERROR]: ", err );
    }
    else {
      console.log( data );
    }
  }

  /// \brief Send the HTTP POST request
  ///
  /// \remarks Use your own callback here to do error handling if necessary
  this.send = function( options, callback ) {
    // console.log('---mark---');

    if( typeof callback != 'undefined' ) {
      curl.request( options, callback );
    }
    else {
      curl.request( options, this.on_response );
    }

    if( options.pretend || options.verbose ) {
      console.log( options.data );
    }
  }
};

module.exports = BloggerPostComment;
