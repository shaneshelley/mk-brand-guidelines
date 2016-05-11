var browserSync  = require('browser-sync'),
    config       = require('./config').sass,
    gulp         = require('gulp'),
    gulpFilter   = require('gulp-filter'),
    handleErrors = require('./util/handleErrors'),
    path         = require('path'),
    rename       = require('gulp-rename'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    through      = require('through2');

gulp.task('sass', function () {
  /* TODO: I think this is failing to inject CSS because of the double-compile
   *       Fix this by breaking these tasks out and setting ENV vars */
  return gulp.src(config.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
      .on('error', handleErrors)
    .pipe(rename(function(filepath){
      filepath.dirname = filepath.dirname.split(path.sep)[0];
    }))
    .pipe(gulp.dest(config.dest))

    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(rename({
        extname: '.min.css'
      }))
    .pipe(sourcemaps.write('map'))
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.stream());
});
