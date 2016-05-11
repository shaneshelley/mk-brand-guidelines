var gulp       = require('gulp'),
    config     = require('./config').bower,
    bower      = require('gulp-bower');

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest(config.dir));
});
