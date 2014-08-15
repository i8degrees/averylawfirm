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

var form_helpers = module.exports = {

  // \brief Search the logged errors for a matching err
  //
  // \remarks This is used in matching an err with an input field; so we can
  // group the err message with it, making the form process a bit more user-
  // friendly.
  //
  // \param errs  The object containing the array of logged errors.
  // \param err   The error string to compare against the errs object.
  has_err: function has_err( errs, err ) {

    if( errs.type != 'err' ) {
      // Not an err object.
      return false;
    }

    for( var i = 0; i < this.count_errs(errs); ++i ) {

      if( errs.messages[i].msg === err ) {

        // Matched one of the logged validation errs to the input field
        return true;
      }
    }

    // No matching found
    return false;
  },

  class_selector: function class_selector( errs, err ) {
    // Putting a red border around the input fields seems to cause more trouble
    // than it is worth (i.e.: ugly select field under Safari for iOS).
    return 'gray_border';

    if( this.has_err( errs, err ) == true ) {

      // Matched error
      return 'red_border';
    }

    // Validation OK
    return 'gray_border';
  },

  // Get the total number of errors for the page.
  //
  // \param errs  The object containing the array of logged errors.
  count_errs: function count_errs( errs ) {

    if( errs.type != 'err' ) {
      // Not an err object.
      return 0;
    }

    return errs.messages.length;
  },

  // \param errs  The object containing the array of logged errors.
  has_errs: function has_errs( errs ) {

    if( this.count_errs( errs ) > 0 ) return true;

    return false;
  },

  phone_number_prettify: function phone_number_prettify( area, prefix, suffix ) {
    return( '(' + area + ')' + ' ' + prefix + '-' + suffix )
  }
};
