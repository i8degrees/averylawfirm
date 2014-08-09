# www.averylawfirm.com

Local site configuration notes.

## Dependencies

* [git](http://git-scm.com/)
* [node.js](http://nodejs.org/)

* Optional (convenience) development tools
    * [nodemon](https://www.npmjs.org/package/nodemon) or [Foreman](https://github.com/ddollar/foreman)
    * [pow](http://pow.cx/)
    * [LiveReload app](http://go.livereload.com/)
        * [LiveReload Sublime Text 2/3 package](https://github.com/dz0ny/LiveReload-sublimetext2)
        * [LiveReload browser extensions](http://go.livereload.com/)

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
```

```
git clone git@github.com:i8degrees/averylawfirm.git averylawfirm.git
cd averylawfirm.git/www

# Install deps required for running site
npm install

# Run a local web server on port 8222 in the background
npm start &
```

**Note:** The app's local web server is configured to use port 8222 and must not be in use; see also: app.js.

You should now be able to access the local site at the [node.js local host](http://localhost:8222) when everything is setup properly.

##### nodemon

This optional package restarts the web server anytime the configuration files -- i.e.: app.js, www/routes/index.js -- are modified.

Simply swap out the use of ```npm start``` with:

```
# averylawfirm.git/www
nodemon app.js
```

##### foreman

**NOTE:** This is part of Heroku's [toolchain](https://devcenter.heroku.com/articles/getting-started-with-nodejs).

This optional package restarts the web server anytime the configuration files -- i.e.: app.js, www/routes/index.js -- are modified.

Create a [Procfile](https://devcenter.heroku.com/articles/procfile), a text file in the root directory of the application, to explicitly declare what command should be executed to start a web host:

```
cd averylawfirm.git/
touch Procfile
cat 'web: node www/app.js' > Procfile
```

Simply swap out the use of ```npm start``` with:

```
# averylawfirm.git/
foreman start
```

##### Pow

Create a symbolic link from the project's root directory to your user's .pow directory:

```
ln -s ~/Projects/averylawfirm ~/.pow/averylawfirm
```

You should now be able to access the local site at the following URLs if everything was setup properly (**NOTE:** Replace the public IP [1] and private LAN address [2] according to your site network):

1. [Pow host via xip.io domain](http://averylawfirm.70.178.134.15.xip.io:8222/)

2. [Pow host via LAN](http://averylawfirm.192.168.151.126.xip.io:80/)

###### Troubleshooting

* See the project's config.ru in the project root directory.

### Further Reading

* [Official Express guide](http://expressjs.com/guide.html)
* [Node.js & Express Tutorial](http://shapeshed.com/creating-a-basic-site-with-node-and-express/)
* [Pow User's Manual](http://pow.cx/manual.html)

## References

* http://cwbuecheler.com/web/tutorials/2013/node-express-mongo/
* https://www.npmjs.org/package/nodemon
