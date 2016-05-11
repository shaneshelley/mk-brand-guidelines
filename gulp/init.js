var gulp        = require('gulp'),
    buffer      = require('vinyl-buffer'),
    del         = require('del'),
    rename      = require('gulp-rename'),
    source      = require('vinyl-source-stream'),
    sourcemaps  = require('gulp-sourcemaps'),
    uglify      = require('gulp-uglify');;

gulp.task('init', [ 'copy-jquery', 'copy-checkout-js', 'copy-static-js', 'copy-reference', 'copy-projects' ]);

gulp.task('copy-jquery', function() {
  return gulp.src('./node_modules/jquery/dist/*.*')
    .pipe(gulp.dest('./public/js'));
});

gulp.task('copy-static-js', function() {
  return gulp.src('./app/assets/js/static/*.js')
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

gulp.task('copy-checkout-js', function() {
  return gulp.src('./app/modules/checkout/assets/js/**/*.js')
    .pipe(gulp.dest('./public/js'));
});

gulp.task('copy-reference', function() {
  return gulp.src('./reference/**/*.*')
    .pipe(gulp.dest('./public/reference'));
});

gulp.task('copy-projects', function() {
  return gulp.src('./projects/**/*.*')
    .pipe(gulp.dest('./public/projects'));
});
