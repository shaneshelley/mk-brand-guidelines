/* Notes:
   - gulp/tasks/browserSync.js watches and reloads compiled files
*/

var browserSync = require('browser-sync'),
    config      = require('./config'),
    gulp        = require('gulp');

gulp.task('watch', ['browser-sync'], function() {
  gulp.watch(config.data.src, ['data']);
  gulp.watch(config.images.src, ['images']);
  gulp.watch(config.js.src, ['browserify']);
  gulp.watch(config.sass.src, ['sass']);
  gulp.watch(config.views.src, ['views']);
});
