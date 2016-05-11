var browserSync  = require('browser-sync'),
    config       = require('./config'),
    gulp         = require('gulp');

gulp.task('default', ['init', 'sass', 'fonts', 'images', 'browser-sync'], function() {
  gulp.watch(config.images.src, ['images']);
  gulp.watch(config.js.src, ['browserify']);
  gulp.watch(config.sass.src, ['sass']);
  gulp.watch(config.views.src, ['browserify']);
});
