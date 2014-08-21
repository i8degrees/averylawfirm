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

// Reference implementation:
// 1. http://filamentgroup.com/lab/responsive-design-approach-for-navigation.html
// 2. http://filamentgroup.com/examples/rwd-nav-patterns/js/rwd-nav.js

// Test the menu to see if all items in layout fit horizontally
jQuery( function($) {
  $('.nav-primary').bind('testfit', function() {
    var nav = $(this), items = nav.find('a');

    // Needs to be removed after the first call below is made
    $('body').removeClass('nav-menu');

    // When the nav wraps under the logo, or when options are stacked,
    // display the nav as a menu
    if( (nav.offset().top > nav.prev().offset().top) || ($(items[items.length-1]).offset().top > $(items[0]).offset().top) ) {

      // Add a class for mobile (small window) navigation
      $('body').addClass('nav-menu');
    }
  }) // End 'testfit' binding
});

// Toggle the menu item's visibility
//
// NOTE: Binding to the focus event here (as per the reference code)
// creates an interface 'bug' where the first mouse click (and only
// the first) will cause the drop-down menu to collapse (as expected)
// but then fold back up immediately. It begins operates normally
// afterwards.
jQuery( function($) {
  $('.mobile-nav').find('.chrome-btn').bind('click', function() {
    $('.nav-primary').toggleClass('expanded');
  })
});

// ...Update on window events: load, resize and orientation change.
jQuery( function($) {
  $(window).bind('load resize orientationchange', function() {
    $('.nav-primary').trigger('testfit');
  })
});
