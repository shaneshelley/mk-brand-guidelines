var gulp          = require('gulp'),
    config        = require('./config').images,
    browserSync   = require('browser-sync'),
    rename        = require('gulp-rename');

gulp.task('images', function() {
  return gulp.src(config.src)
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.reload({stream:true}));
});
