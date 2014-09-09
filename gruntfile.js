// Grunt build tasks for averylawfirm.com
//
// See also: package.json

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      // Environment: Development
      debug: {
        options: {
          style: 'expanded',
          debugInfo: false
        },
        files: {
          'public/css/style.css' : 'sass/style.scss',
          'public/css/mobile.css' : 'sass/mobile.scss',
          'public/css/common.css' : 'sass/common.scss',
          'public/css/error.css' : 'sass/error.scss',
          'public/css/font-awesome-4.1.0.css' : 'sass/font-awesome-4.1.0.scss',
          'public/css/modal.css' : 'sass/modal.scss'
        }
      },
      // Environment: Production
      release: {
        options: {
          style: 'compressed',
          debugInfo: false
        },
        files: [{
          expand: true,
          cwd: 'sass',
          src: ['*.scss'],
          dest: './public/css',
          ext: '.css'
        }]
      },
    },
    // Convenience developer tasks
    shell: {
      exec_redis: {
        // Assumes default Homebrew redis package installation (see README.md)
        command: "killall -9 'redis-server 127.0.0.1:6379'; redis-server /usr/local/etc/redis-heroku.conf"
      }
    }
  });

  // Dependencies

  // https://github.com/gruntjs/grunt-contrib-sass
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['sass:debug']);
  grunt.registerTask('redis', ['shell:exec_redis']);

  // Called from package.json, via bin/heroku_deploy.sh
  grunt.registerTask('heroku', ['sass:release']);
}
