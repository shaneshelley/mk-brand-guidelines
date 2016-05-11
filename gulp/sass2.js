var gulp            = require('gulp'),
    config          = require('./config').sass,
    handleErrors    = require('./util/handleErrors'),
    sass            = require('gulp-sass'),
    sourcemaps      = require('gulp-sourcemaps');

gulp.task('sass2', function () {
  return gulp.src(config.src)
    .pipe(sourcemaps.init())
    .pipe(sass({
        indentedSyntax: false,
        imagePath: 'images',
        outputStyle: 'expanded'
      }))
      .on('error', handleErrors)
    .pipe(sourcemaps.write('map'))
    .pipe(gulp.dest(config.dest));
});
