var gulp = require('gulp');

gulp.task('staging', ['bower', 'init', 'data', 'sass', 'browserify', 'fonts', 'images', 'views']);
