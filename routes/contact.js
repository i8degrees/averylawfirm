// Site (route) dependencies
var express = require('express');
var app = express();
var router = express.Router();

// contact page GET request
router.get('/', function(req, res) {

  // Mock errors object
  // req.flash('notifications', res.locals.mock_errs );

  res.render('contact', { notifications: req.flash('notifications') } );
});

// contact page POST request
router.post('/', function(req, res) {

  res.locals.form_helpers.process_contact_form( req, res );

  res.render('contact', { notifications: req.flash('notifications') } );
});

module.exports = router;
