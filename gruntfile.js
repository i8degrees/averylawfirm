module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        options: {
          style: 'expanded',
          debugInfo: false
        },
        files: {
          'public/css/style.css' : 'sass/style.scss',
          'public/css/mobile.css' : 'sass/mobile.scss',
          'public/css/common.css' : 'sass/common.scss',
          'public/css/error.css' : 'sass/error.scss',
          'public/css/testme.css' : 'sass/testme.scss',
          'public/css/font-awesome-4.1.0.css' : 'sass/font-awesome-4.1.0.scss'
        }
      }
    }});

  grunt.registerTask('default',['sass']);
  grunt.registerTask('heroku', ['sass:dist'] );
  grunt.loadNpmTasks('grunt-contrib-sass');
}
