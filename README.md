# www.averylawfirm.com

Local site configuration notes.

## Dependencies

* [git](http://git-scm.com/)
* [node.js](http://nodejs.org/)
* [SASS](http://sass-lang.com/)
* [Grunt](http://gruntjs.com)

* Optional (convenience) development tools
    * [nodemon](https://www.npmjs.org/package/nodemon)
    * [pow](http://pow.cx/)
    * [LiveReload app](http://go.livereload.com/)

### Local Development Site Setup

#### Windows

1. Buy a MacBook.
2. Refer to the local site setup section for Mac OS X.
3. Profit!

#### Linux

See the local site setup section for Mac OS X.

#### Mac OS X

Install software dependencies via [Homebrew](http://brew.sh):

```
brew install -vd git 
brew install -vd node 

# Be sure to read the caveats here to finish setup
brew install -vd pow

gem install sass
npm install -g grunt-cli
```

```
git clone git@github.com:i8degrees/averylawfirm.git averylawfirm.git
cd averylawfirm.git/

# Install deps required for running site
npm install

# Run a local web server in the background on a local port number that is free.
PORT=<LOCAL_PORT_NUMBER> NODE_ENV=development npm start &
```

You should now be able to access the local site at the http://localhost:<LOCAL_PORT_NUMBER> when everything is setup properly.

##### nodemon

This optional package restarts the web server anytime the configuration files -- i.e.: app.js, routes/index.js -- are modified.

Simply swap out the use of ```npm start``` with:

```
# averylawfirm.git
PORT=<LOCAL_PORT_NUMBER> NODE_ENV=development nodemon app.js &
```

##### Pow

Create a symbolic link from the project's root directory to your user's .pow directory:

```
ln -s ~/Projects/averylawfirm ~/.pow/averylawfirm
```

You should now be able to access the local site at the following URL if everything was setup properly (**NOTE:** Replace the private LAN address [1] according to your site network):

1. [Pow host via LAN](http://averylawfirm.192.168.151.126.xip.io)

###### Troubleshooting

* See the project's config.ru in the project root directory.

### Testing Site Setup

* Defaults to the listening port 5000.

* All site pages generated from Jade templates:
    * Exclude LiveReload script.
    * ~~Minified Modernizr script is used.~~
    
* Error page:
    * Error status number is not shown.
    
* Contact page:
    * Email will be sent out upon successful form submission.

```
 NODE_ENV=testing SENDGRID_USERNAME=<username> SENDGRID_PASSWORD=<password> nodemon app.js &
```

**Note:** You should ensure that you include the space as the first character of the command when running from the shell (assuming BASH), so that your password is not accidentally committed to your BASH history file.

### Production Site Setup

* Defaults to the listening port 5000.

* All site pages generated from Jade templates:
    * Exclude LiveReload script.
    * ~~Minified Modernizr script is used.~~
    
* Error page:
    * Error status number is not shown.
    * Error stack traces are disabled.
    
* Contact page:
    * Email will be sent out upon successful form submission.
    * No dumping of form submission input on successful form submission.

```
 NODE_ENV=production SENDGRID_USERNAME=<username> SENDGRID_PASSWORD=<password> nodemon app.js &
```

**Note:** You should ensure that you include the space as the first character of the command when running from the shell (assuming BASH), so that your password is not accidentally committed to your BASH history file.

### Further Reading

* [Official Express guide](http://expressjs.com/guide.html)
* [Node.js & Express Tutorial](http://shapeshed.com/creating-a-basic-site-with-node-and-express/)
* [Pow User's Manual](http://pow.cx/manual.html)
* [Heroku: Deploying with Git](https://devcenter.heroku.com/articles/git)

## References

* http://cwbuecheler.com/web/tutorials/2013/node-express-mongo/
* https://www.npmjs.org/package/nodemon
* http://ryanchristiani.com/getting-started-with-grunt-and-sass/
* http://gruntjs.com/getting-started
* https://www.codefellows.org/blog/create-a-node-js-project-from-scratch-with-node-sass
