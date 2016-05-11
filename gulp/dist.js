'use strict';

var gulp            = require('gulp'),
    rename          = require('gulp-rename'),
    sourcemaps      = require('gulp-sourcemaps'),
    uglify          = require('gulp-uglify'),
    util            = require('gulp-util');

gulp.task('dist', ['dist-assets', 'dist-views']);

gulp.task('dist-assets', ['dist-js', 'dist-css']);

gulp.task('dist-css', function(files) {
  return gulp.src([ assetsRoot + '/css/mk-style.css' ])
    // .pipe(minifyCSS({ 'keepbreaks': true }))
    .pipe(rename('mk-style.min.css'))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('dist-js', ['dist-uglify'], function(files) {
  return gulp.src('./public/js/*.js')
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('dist-uglify', function(files) {
  return gulp.src('./public/js/refresh.js')
    // .pipe(sourcemaps.init({ loadMaps: true, debug: false }))
    .pipe(uglify({ mangle: true }))
      .on('error', util.log)
    .pipe(rename(function(path){
      path.basename += ".min"
    }))
    // .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('dist-views', function(files) {
  return gulp.src('./app/views/content/*.html')
    .pipe(gulp.dest('./dist'));
});
