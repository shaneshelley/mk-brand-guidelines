var gulp       = require('gulp');
var config     = require('./config').data;
var browserSync  = require('browser-sync');

gulp.task('data', function() {
  return gulp.src(config.src)
    .pipe(gulp.dest(config.dest));
});
