var gulp        = require('gulp'),
    config      = require('./config').browserify,
    path        = require('path'),
    rename      = require('gulp-rename'),
    size        = require('gulp-filesize'),
    sourcemaps  = require('gulp-sourcemaps'),
    uglify      = require('gulp-uglify')
    util        = require('gulp-util');

gulp.task('uglifyJs', ['browserify-stage'], function(cb) {
  return gulp.src('./public/js/filters.js')
    .pipe(sourcemaps.init())
    .pipe(uglify({ mangle: true }))
      .on('error', util.log)
    .pipe(rename(function(path){
      path.basename += ".min"
    }))
    .pipe(sourcemaps.write('map'))
    .pipe(gulp.dest('./public/js'));
});
