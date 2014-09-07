# www.averylawfirm.com

Local site configuration notes.

## Dependencies

* [git](http://git-scm.com/)
* [node.js](http://nodejs.org/)
* [SASS](http://sass-lang.com/)
* [Grunt](http://gruntjs.com)
* [Redis Server](//redis.io/)

* Optional (convenience) development tools
    * [nodemon](https://www.npmjs.org/package/nodemon)
    * [pow](http://pow.cx/)
    * [LiveReload app](http://go.livereload.com/)

## Site Environment Configuration

I use the [dotenv node module](https://www.npmjs.org/package/dotenv) for keeping up with the site environments.

1. Create a .env file at the project's repository root with the bare minimum environment requirements:

```
cd ~/Projects/averylawfirm.git
touch .env
echo "NODE_ENV=development" > .env
```

Available environment variables:

* ```NODE_DB_HOST```
* ```NODE_DB_PORT```
* ```NODE_DB_PASS```
* ```SESSION_SECRET```
* ```NODE_ENV```
* ```PORT```
* ```SENDGRID_USERNAME```
* ```SENDGRID_PASSWORD```

**See also:** app.js, Heroku build config vars

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
brew install -vd redis

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

redis-server /usr/local/etc/redis.conf &

# Run a local web server in the background on a local port number that is free.
PORT=<LOCAL_PORT_NUMBER> NODE_ENV=development npm start &
```

You should now be able to access the local site at the http://localhost:<LOCAL_PORT_NUMBER> when everything is setup properly.

##### nodemon

This optional package restarts the web server anytime the configuration files -- i.e.: app.js, routes/index.js -- are modified.

Simply swap out the use of ```npm start``` with:

```
# averylawfirm.git
 NODE_ENV=development nodemon app.js &
```

##### Pow

Create a symbolic link from the project's root directory to your user's .pow directory:

```
ln -s ~/Projects/averylawfirm ~/.pow/averylawfirm
```

You should now be able to access the local site at the following URL if everything was setup properly (**NOTE:** Replace the private LAN address [1] according to your site network):

1. [Pow host via LAN](http://averylawfirm.192.168.15.100.xip.io)

###### Troubleshooting

* See the project's config.ru in the project root directory.

### Testing Site Setup

#### Testing Site Dependencies

* ~~Defaults to the listening port 5000.~~

* All site pages generated from Jade templates:
    * Exclude LiveReload script.
    * ~~Minified Modernizr script is used.~~
    
* Error page:
    * Error status number is not shown.
    
* Contact page:
    * Email will be sent out upon successful form submission.

```
redis-server /usr/local/etc/redis.conf &
 NODE_ENV=testing nodemon app.js &
```

**NOTE:** The database connection environment variables ```NODE_DB_HOST```, ```NODE_DB_PORT``` and ```NODE_DB_PASS``` should be set to the Redis URL used by Heroku deployments.

**Note:** You should ensure that you include the space as the first character of the command when running from the shell (assuming BASH), so that your password is not accidentally committed to your BASH history file.

### Production Site Setup

* ~~Defaults to the listening port 5000.~~

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
redis-server /usr/local/etc/redis.conf &
 NODE_ENV=production nodemon app.js &
```

**NOTE:** The database connection environment variables ```NODE_DB_HOST```, ```NODE_DB_PORT``` and ```NODE_DB_PASS``` should be set to the Redis URL used by Heroku deployments.

**Note:** You should ensure that you include the space as the first character of the command when running from the shell (assuming BASH), so that your password is not accidentally committed to your BASH history file.

## Miscellaneous Notes

### Heroku Staging Deployment URL

[averylawfirm-staging.herokuapp.com](http://averylawfirm-staging.herokuapp.com)

```
# Local 'dev' branch to Heroku staging app's 'master' branch
git push staging dev:master

# Local 'master' branch to Heroku staging app's 'master' branch
git push staging master
```

```
heroku logs --app averylawfirm-staging
```

### Heroku Production Deployment URL

[averylawfirm.herokuapp.com](http://averylawfirm.herokuapp.com)

```
# Local 'dev' branch to Heroku app's 'master' branch
git push heroku dev:master

# Local 'master' branch to Heroku app's 'master' branch
git push heroku master
```

```
heroku logs --app averylawfirm
```

### Alert Notifications for Log Levels >= 'WARNING'

The format in which logs are output must follow a particular style in order to 
work automatically with an automated notification system (powered by [LogEntries](https://logentries.com)).

* The following logging output formats have been configured for email alert notifications:
    * ```app [ERROR]: ...message...``` 
    * ```app [CRITICAL]: ...message...```
    * ~~```app [WARNING]: ...message...```~~
    * ~~```app [DEBUG]: ...message...```~~

**NOTE:** Log output formatting that begins with ```app-subname``` where *subname* is any alphanumeric combination is also matched for alert notifications.

## References

* http://cwbuecheler.com/web/tutorials/2013/node-express-mongo/
* https://www.npmjs.org/package/nodemon
* http://ryanchristiani.com/getting-started-with-grunt-and-sass/
* http://gruntjs.com/getting-started
* https://www.codefellows.org/blog/create-a-node-js-project-from-scratch-with-node-sass

### Further Reading

* [Official Express guide](http://expressjs.com/guide.html)
* [Node.js & Express Tutorial](http://shapeshed.com/creating-a-basic-site-with-node-and-express/)
* [Pow User's Manual](http://pow.cx/manual.html)
* [Heroku: Deploying with Git](https://devcenter.heroku.com/articles/git)
* [Redis: Quick Start](http://redis.io/topics/quickstart)
