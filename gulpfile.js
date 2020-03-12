const { src, dest, task, watch, parallel, series } = require('gulp');

// PLUGINS
const browser = require('browser-sync').create();
const merge = require('merge-stream');
const sourceMaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const autoPrefixer = require('gulp-autoprefixer');
const image = require('gulp-image');

// ROUTES
const nodeMods = './node_modules';
const dev = './src';
const production = './dist';

// STATIIC SERVER
function browserSync() {
  browser.init({
    server: {
      baseDir: production
    }
  });
}

//RELOAD THE BROWSER WHEN CHANGES HAPPEND.
function reload(done) {
  browser.reload;
  done();
}

// TASKS

//ASSETS
function assetsFiles(done) {
  //BULMA | CSS FRAMEWORK
  const bulma = src(`${nodeMods}/bulma/*.sass`)
    .pipe(
      sass({
        outputStyle: 'expended'
      }).on('Error', sass.logError)
    )
    .pipe(dest(`${production}/css/assets`));
  //FONTAWESOME | FONT ICONS
  const fontawesome_css = src(
    `${nodeMods}/@fortawesome/fontawesome-free/css/all.css`
  ).pipe(dest(`${production}/fonts/fontawesome/css`));
  //WEBFONTS DIR
  const webfonts = src(
    `${nodeMods}/@fortawesome/fontawesome-free/webfonts/*`
  ).pipe(dest(`${production}/fonts/fontawesome/webfonts`));

  //JQUERY.JS
  const jQuery = src(`${nodeMods}/jquery/dist/jquery.min.js`).pipe(
    dest(`${production}/js/assets`)
  );
  //HTML5SHIV.JS
  const HTML5shiv = src(`${nodeMods}/html5shiv/dist/html5shiv.min.js`).pipe(
    dest(`${production}/js/assets`)
  );
  //RESPOND.JS
  const respond = src(`${nodeMods}/respond.js/dest/respond.min.js`).pipe(
    dest(`${production}/js/assets`)
  );

  //OWL CAROUSEL
  const carouselCss = src(
    `${nodeMods}/owl.carousel/dist/assets/owl.carousel.min.css`
  ).pipe(dest(`${production}/css/assets`));

  const carouselJs = src(
    `${nodeMods}/owl.carousel/dist/owl.carousel.min.js`
  ).pipe(dest(`${production}/js/assets`));

  return merge(
    bulma,
    fontawesome_css,
    webfonts,
    jQuery,
    HTML5shiv,
    respond,
    carouselCss,
    carouselJs
  );

  done();
}

// HTML
function buildHTML(done) {
  src(`${dev}/pages/**/*.html`)
    .pipe(dest(production))
    .pipe(browser.stream());
  done();
}

//CSS TASK
function buildStyle(done) {
  src(`${dev}/scss/**/*.scss`)
    .pipe(sourceMaps.init())
    .pipe(
      sass({
        outputStyle: 'expanded'
      }).on('error', sass.logError)
    )
    .pipe(
      autoPrefixer({
        cascade: false
      })
    )
    .pipe(sourceMaps.write('.'))
    .pipe(dest(`${production}/css/`))
    .pipe(browser.stream());
  done();
}

//JS TASK
function buildScript(done) {
  src(`${dev}/script/**/*.js`)
    .pipe(dest(`${production}/js/`))
    .pipe(browser.stream());
  done();
}

//IMAGE TASK
function images(done) {
  src(`${dev}/images/*`)
    .pipe(image())
    .pipe(dest(`${production}/img/`));
  done();
}

// DEFINE TASKS
task('assets', assetsFiles);
task('HTML', buildHTML);
task('CSS', buildStyle);
task('JS', buildScript);
task('IMG', images);

// WATCH FILES SETUP
function watchFiles() {
  watch(`${dev}/pages/**/*.html`, series(buildHTML, reload));
  watch(`${dev}/scss/**/*.scss`, series(buildStyle, reload));
  watch(`${dev}/script/**/*.js`, series(buildScript, reload));
  watch(`${dev}/images/*`, series(images, reload));
}

// DEFAULT TASK
task(
  'default',
  parallel(assetsFiles, buildHTML, buildStyle, buildScript, images, browserSync)
);

// WATCH TASK
task('watch', parallel(browserSync, watchFiles));
