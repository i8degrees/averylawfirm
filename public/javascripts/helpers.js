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

// Input form helpers

// Input form helpers (getters)

function get_value( target ) {
  return target.value;
}

function null_value( target ) {
  if( get_value( target ) === '' )
  {
    return true;
  }
  else
  {
    return false;
  }
}

// Input form helpers (setters)

function clear_value( target ) {
  set_value(target, '');
}

function set_value( target, value ) {
  target.value = value;
}

function clear_value_if_default( target, default_value )
{
  if( get_value( target ) === default_value )
  {
    clear_value( target );
  }
}

function set_default_value_if_null( target, default_value )
{
  if( null_value( target ) == true )
  {
    set_value( target, default_value )
  }
}

/* Test for the element's support of an attribute */
/* css-tricks.com: "Test if Element Supports Attribute" */
function attribute_exists(element, attr) {
  var test = document.createElement(element);

  if( attr in test ) {
    // Used for testing functionality
    // return false;
    return true;
  }
  else {
    return false;
  }
}
