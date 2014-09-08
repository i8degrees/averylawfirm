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
// Dependencies
var express = require('express');
var app = express();

// The following environment variables must be set within .env.keys:
// GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URL
//
// See also: README.md
var dotenv = require('dotenv');
dotenv._getKeysAndValuesFromEnvFilePath( './.env.keys' );
dotenv.load();

// Date library for converting timestamps
//
// This dependency is intended to be used externally;
// i.e.: blogger.moment( new Date() );
var moment = require('moment');

// https://github.com/google/google-api-nodejs-client/
var google = require('googleapis');
var api = google.blogger('v3');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_OAUTH_CLIENT_SECRET, process.env.GOOGLE_OAUTH_REDIRECT_URL);

google.options = { auth: oauth2Client };

// Generate URL for requesting permissions for Blogger
var scopes = [
  'https://www.googleapis.com/auth/blogger'
];

var auth_url = oauth2Client.generateAuthUrl( {
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  scope: scopes
});

// Default parameters for passing to Blogger API
//
// See also: routes/blog.js
//
// Note that Google's official API methods require blod_id, post_id to be
// string values, otherwise a response of '404: Not Found' is returned.
var params = {
  // FIXME:
  // blogId: app.locals.settings['blog'].blog_id,
  // blogId: app.get('blog'),
  blogId: '1358910749199223219',
  auth: google.options.auth,
  // auth: 'AIzaSyA9epI58R4vt3eQxAlOPYvLtgZ5RajJ1Ow',
};

module.exports.auth_url = auth_url;
module.exports.client = google.options;
module.exports.api = api;
module.exports.params = params;
module.exports.moment = moment;

// Use a function for the exact format desired (RFC 3339)
//
// See also: routes/blog.js
//
// Source: http://stackoverflow.com/a/7244288
// function timestamp( type, d ) {
//   function pad( n ) {
//     return n < 10 ? '0' + n : n
//   }

//   if( typeof type === 'undefined' ) {
//     return 'err';
//   }
//   else if( type === 'rfc3339' ) {
//     return d.getUTCFullYear() + '-'
//     + pad( d.getUTCMonth() +1 ) + '-'
//     + pad( d.getUTCDate() ) + 'T'
//     + pad( d.getUTCHours() ) + ':'
//     + pad( d.getUTCMinutes() ) + ':'
//     + pad( d.getUTCSeconds() ) + 'Z'
//   }
//   // TODO: Rename type name (update comments, too!)
//   // TODO: Finish implementation (make human friendly)
//   else if( type === 'c' ) {
//     return d.getUTCMonth() +1 + ' '
//     + pad( d.getUTCDay() ) + ' , '
//     + pad( d.getUTCFullYear() );
//   }
//   else {
//     return 'unknown err';
//   }
// }

// module.exports.timestamp = timestamp;
