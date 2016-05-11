var modRewrite = require('connect-modrewrite');

var dest = "./public";
var src  = './app';

module.exports = {
  bower: {
    dir: './bower_components'
  },
  browserSync: {
    server: {
      // Serve up our build folder
      baseDir     : dest,
      debug       : true,

      middleware  : [
        modRewrite([
          '(^[^\\.]*)$ /$1.html [L]'
        ])
      ]
    },
    ghostMode   : false,
    open        : false
  },
  data: {
    src: src + "/data/**",
    dest: dest + "/data/"
  },
  js: {
    src: src + "/modules/**/*.js"
  },
  sass: {
    src: [src + "/core/assets/stylesheets/*.scss", src + "/modules/**/assets/stylesheets/**/*.scss"],
    dest: dest + "/css",
    settings: {
      indentedSyntax: false,
      imagePath: 'images',
      outputStyle: 'expanded'
    }
  },
  fonts: {
    src: src + "/core/assets/stylesheets/_fonts/**",
    dest: dest + "/css/fonts"
  },
  images: {
    src: src + "/core/assets/images/**",
    dest: dest + "/img"
  },
  views: {
    src: src + "/modules/views/**/*.jade",
    dest: dest
  },
  browserify: {
    entries: [
      src + '/assets/js/main.js',
      src + '/assets/js/size-guide.js'
    ],
    paths: [
      './node_modules',
      './app/core',
      './app/modules'
    ]
  }
};
