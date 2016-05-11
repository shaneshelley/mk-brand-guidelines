'use strict';

var gulp        = require('gulp'),
    aliasify    = require('aliasify'),
    browserify  = require('browserify'),
    browserSync = require('browser-sync'),
    buffer      = require('vinyl-buffer'),
    config      = require('./config').browserify,
    es          = require('event-stream'),
    rename      = require('gulp-rename'),
    source      = require('vinyl-source-stream'),
    sourcemaps  = require('gulp-sourcemaps'),
    uglify      = require('gulp-uglify');

gulp.task('browserify', function () {
  /* Define input files for bundling */
  var files = config.entries;

  var app = files.map(function(entry) {
    return browserify({
      entries: [entry],
      paths  : config.paths,
      debug  : true
    })
    .exclude('jquery')
    .bundle()
    .pipe(source(entry))
    .pipe(buffer())
    .pipe(rename({
      dirname: '',
      extname: '.js'
    }))
    .pipe(gulp.dest('./public/js'))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify({ mangle: true }))
      .on('error', util.log)
    .pipe(rename({
      dirname: '',
      extname: '.min.js'
    }))
    .pipe(sourcemaps.write('map'))
    .pipe(gulp.dest('./public/js'));
  });

  // create a merged stream
  return es.merge.apply(null, app);
});
