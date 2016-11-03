const path = require('path')
const gulp = require('gulp')
const watch = require('gulp-watch')
const gutil = require('gulp-util')
// const concat = require('gulp-concat')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const htmlmin = require('gulp-htmlmin')
const imagemin = require('gulp-imagemin')
const connect = require('gulp-connect')
// const babel = require('gulp-babel')
// const babelify = require('babelify')
const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const source = require('vinyl-source-stream')
const watchify = require('watchify')
const uglify = require('gulp-uglify')
const gulpif = require('gulp-if')
const gnf = require('gulp-npm-files')
const postcss = require('gulp-postcss')
const cssnano = require('cssnano')
const autoprefixer = require('autoprefixer')
const colorfunction = require('postcss-color-function')
const precss = require('precss')
const animation = require('postcss-animation')
const del = require('del')

const srcDir = path.resolve(__dirname, 'src')
const buildDir = path.resolve(__dirname, 'build')
const productionDir = path.resolve(buildDir, 'production')
const developmentDir = path.resolve(buildDir, 'development')
const envDir = process.env.NODE_ENV === 'production' ? productionDir : developmentDir
const destDir = path.resolve(envDir, 'dist')

const paths = {
  html: [srcDir + '/*.html'],
  img: [srcDir + '/images/**/*'],
  js: [srcDir + '/scripts/app.js'],
  scss: [srcDir + '/styles/sass/**/*.scss'],
  postcss: [srcDir + '/styles/postcss/**/*.css'],
}

gulp.task('env', () => {
  gutil.log('NODE_ENV is ' + process.env.NODE_ENV)
})

// gulp.task('js', () => {
//   return gulp.src(paths.js)
//     .pipe(sourcemaps.init())
//     .pipe(babel({presets: ['es2015', 'stage-0']}))
//     .pipe(concat('app.js'))
//     .pipe(gulpif(process.env.NODE_ENV === 'production', uglify()))
//     .pipe(sourcemaps.write('./'))
//     .pipe(connect.reload())
//     .pipe(gulp.dest(destDir + '/js'))
// })

gulp.task('js', () => {
  watchify(browserify(paths.js), { debug: true })
    .transform('babelify', {presets: ['es2015', 'stage-0']})
    .bundle()
    .on('error', (err) => { console.error(err) })
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulpif(process.env.NODE_ENV === 'production', uglify()))
    .pipe(sourcemaps.write('./'))
    .pipe(connect.reload())
    .pipe(gulp.dest(destDir + '/js'))
})

gulp.task('copyNpmDependenciesOnly', () => {
  gulp.src(gnf(), {base: './'}).pipe(gulp.dest(envDir))
})

gulp.task('scss', () => {
  return gulp.src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(connect.reload())
    .pipe(gulp.dest(destDir + '/css'))
})

gulp.task('postcss', () => {
  let processors = [
    autoprefixer(),
    colorfunction(),
    precss(),
    animation(),
  ]

  if (process.env.NODE_ENV === 'production') {
    processors.push(cssnano())
  }

  return gulp.src(srcDir + '/styles/postcss/app.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(connect.reload())
    .pipe(gulp.dest(destDir + '/css'))
})

gulp.task('img', () => {
  gulp.src(paths.img)
    .pipe(imagemin())
    .pipe(connect.reload())
    .pipe(gulp.dest(destDir + '/images'))
})

gulp.task('connect', () => {
  connect.server({
    root: envDir,
    livereload: true
  })
})

gulp.task('htmlmin', () => {
  return gulp.src(paths.html)
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest(envDir))
})

gulp.task('clean', () => {
  del([envDir])
})

gulp.task('watch', () => {
  htmlCopyAndWatch()
  imagesCopyAndWatch()
  gulp.watch(paths.img, ['img'])
  gulp.watch([srcDir + '/scripts/**/*.js'], ['js'])
  // gulp.watch(paths.scss, ['scss'])
  gulp.watch(paths.postcss, ['postcss'])
})

function htmlCopyAndWatch() {
  return gulp.src(paths.html, {base: srcDir})
    .pipe(watch(paths.html, {base: srcDir}))
    .pipe(connect.reload())
    .pipe(gulp.dest(envDir))
}

function imagesCopyAndWatch() {
  return gulp.src(paths.img, {base: srcDir})
    .pipe(watch(paths.img, {base: srcDir}))
    .pipe(connect.reload())
    .pipe(gulp.dest(destDir))
}

// gulp.task('default', ['env', 'copyNpmDependenciesOnly', 'connect', 'js', 'scss', 'watch'])
gulp.task('default', ['env', 'copyNpmDependenciesOnly', 'connect', 'js', 'postcss', 'watch'])
