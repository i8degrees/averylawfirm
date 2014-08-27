// Site (route) dependencies
var express = require('express');
var app = express();
var router = express.Router();

// contact page GET request
router.get('/', function(req, res) {

  // Mock error object that we can pass while doing layout work
  var mock_errs = [
    {
      type: 'err',
      message: res.locals.input_errs['contact'].name
    },
    {
      type: 'err',
      message: res.locals.input_errs['contact'].message
    }
  ];
  // req.flash('notifications', mock_errs );

  res.render('contact', { notifications: req.flash('notifications') } );
});

// contact page POST request
router.post('/', function(req, res) {

  res.locals.form_helpers.process_contact_form( req, res );

  res.render('contact', { notifications: req.flash('notifications') } );
});

module.exports = router;
