// Site route dependencies
var express = require('express');
var router = express.Router();
var fs = require('fs');

// practice view
router.get('/', function(req, res) {

  var opts = { encoding: 'ascii' };

  // \param id Anchor used to jump to topic entry (not implemented)
  var topics = [
    {
      title: 'Areas of Practice',
      // id: 'intro',
      load: function load() { return fs.readFileSync('./data/pages/services/intro.md', opts ); }
    },
    {
      title: 'Family Law',
      // id: 'familylaw',
      load: function load() { return fs.readFileSync('./data/pages/services/familylaw.md', opts ); }
    },
    {
      title: 'Criminal Defense',
      // id: 'criminaldefense',
      load: function load() { return fs.readFileSync('./data/pages/services/criminaldefense.md', opts ); }
    },
    {
      title: 'Social Security Disability',
      // id: 'social_security_disability',
      load: function load() { return fs.readFileSync('./data/pages/services/social_security_disability.md', opts ); }
    },
    // TODO
    {
      title: 'Personal Injury',
      // id: 'personal_injury',
      load: null
    },
    // TODO
    {
      title: 'Bankruptcy',
      // id: 'bankruptcy',
      load: null
    }
  ];

  // Parent page has special needs (no ID parameter) -- this could probably be
  // cleaned up...
  topics[0].href = '/practice';

  for( var i = 1; i != topics.length; ++i ) {
    // topics[i].href = '/practice?id=' + i + '#' + topics[i].id;
    topics[i].href = '/practice?id=' + i;
  }

  if( req.query['id'] >= 0 && req.query['id'] < topics.length ) {
    var id = req.query['id'];
    res.locals.breadcrumbs = [ { title: topics[id].title, href: res.locals.loc.href, home: '/practice' } ];
    res.render('practice', { topics: topics, topic: topics[id] } );
  } else {
    // console.info("Invalid topic ID %d was passed.", req.query['id'] );
    res.render('practice', { topics: topics, topic: topics[0] } );
  }
});

module.exports = router;
