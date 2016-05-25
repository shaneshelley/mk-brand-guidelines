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
  js: {
    src: src + "/modules/**/*.js",
    dest: dest + "/js"
  },
  sass: {
    src: [src + "/modules/brand-guidelines/assets/stylesheets/**/*.scss"],
    dest: dest + "/css",
    settings: {
      indentedSyntax: false,
      imagePath: 'images',
      outputStyle: 'expanded'
    }
  },
  fonts: {
    src: src + "/modules/brand-guidelines/assets/stylesheets/_fonts/**",
    dest: dest + "/css/fonts"
  },
  images: {
    src: src + "/modules/brand-guidelines/assets/images/**",
    dest: dest + "/images"
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
