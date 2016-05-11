var browserSync = require('browser-sync');
var config      = require('./config').views;
var gulp        = require('gulp');

gulp.task('views', function () {
  return gulp.src(config.src)
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.reload({stream:true}));
});
