const { src, dest, watch, parallel, series } = require("gulp");

const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const babel = require("gulp-babel");
const clean = require("gulp-clean");
const imagemin = require("gulp-imagemin");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fileinclude = require("gulp-file-include");

const path = {
  dev: {
    src: "src/",
    html: "src/html/",
    scss: "src/scss/",
    css: "src/css/",
    js: "src/js/",
    img: "src/img/",
    fonts: "src/fonts/",
  },
  prod: {
    src: "dist/",
  },
};

function html() {
  return src(`${path.dev.html}/**.html`)
    .pipe(fileinclude())
    .pipe(dest(path.dev.src))
    .pipe(browserSync.stream());
}

function styles() {
  return src(`${path.dev.scss}*.scss`)
    .pipe(concat("style.min.css"))
    .pipe(autoprefixer())
    .pipe(sass({ includePaths: ["./node_modules"] }).on("error", sass.logError))
    .pipe(dest(path.dev.css))
    .pipe(browserSync.stream());
}

function scripts() {
  return src([`${path.dev.js}*.js`, `!${path.dev.js}script.min.js`])
    .pipe(concat("script.min.js"))
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(dest(path.dev.js))
    .pipe(browserSync.stream());
}

function images() {
  return src(`${path.dev.img}*`)
    .pipe(imagemin())
    .pipe(dest(`${path.prod.src}img`));
}

function fontsConvert() {
  src(`${path.dev.fonts}*.ttf`).pipe(ttf2woff()).pipe(dest(path.dev.fonts));
  return src(`${path.dev.fonts}*.ttf`)
    .pipe(ttf2woff2())
    .pipe(dest(path.dev.fonts));
}

function watching() {
  watch([`${path.dev.scss}*.scss`], styles);
  watch([`${path.dev.js}*.js`, `!${path.dev.js}script.min.js`], scripts);
  watch([`${path.dev.html}**/*.html`], html);
  watch([`${path.dev.src}index.html`]).on("change", browserSync.reload);
}

function server() {
  browserSync.init({
    server: {
      baseDir: path.dev.src,
    },
  });
}

function cleanDist() {
  return src(path.prod.src).pipe(clean());
}

function building() {
  return src(
    [
      `${path.dev.css}style.min.css`,
      `${path.dev.js}script.min.js`,
      `${path.dev.src}index.html`,
      `${path.dev.fonts}*`,
      `!${path.dev.img}*`,
      `!${path.dev.html}*`,
    ],
    {
      base: path.dev.src,
    }
  ).pipe(dest(path.prod.src));
}

exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.server = server;
exports.images = images;
exports.fontsConvert = fontsConvert;

exports.build = series(cleanDist, building, images);
exports.default = parallel(html, styles, scripts, server, watching);
