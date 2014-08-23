# Grunt deployment tasks for averylawfirm.com (Heroku deployment)
#
# I never could get the nodejs-grunt-compass custom buildpack [1] to work for
# me, so I took the idea behind it and re-implemented what I needed from it
# as a 'postinstall' script (this file). See also: this project's package.json,
# 'scripts' object.
#
# 1. https://github.com/stephanmelzer/heroku-buildpack-nodejs-grunt-compass/blob/master/bin/compile

# Install SASS gem (dependency for grunt-contrib-sass)
echo "Installing SASS"
export GEM_HOME=$HOME/.gem/ruby/1.9.1
export PATH="$GEM_HOME/bin:$PATH"
gem install sass --user-install --no-rdoc --no-ri

# Run grunt deployment tasks
echo "Executing deployment tasks..."
grunt heroku
