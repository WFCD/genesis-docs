const {task, series, src, dest} = require('gulp');
const minify = require('gulp-minify');
const cleanCss = require('gulp-clean-css');
const del = require('del');

task('clean-js', series((done) => {
  del([
    'public/js/main.js',
  ]);
  done();
}));

task('clean-css', series((done) => {
  del([
    'public/css/main.css',
    'public/css/main.night.css',
    'public/css/main.retro.css',
    'public/css/main.eidolon.css',
    'public/css/common.css',
  ]);
  done();
}));

task('pack-js', series(['clean-js'], (done) => {
  src(['assets/js/*.js'])
    .pipe(minify({
      ext: {
        min: '.js',
      },
      noSource: true,
    }))
    .pipe(dest('public/js'));
    done();
}));

task('pack-css', series(['clean-css'], (done) => {
  src(['assets/css/*.css'])
    .pipe(cleanCss())
    .pipe(dest('public/css'));
  done();
}));

task('default', series(['pack-js', 'pack-css'], (done) => {
  done();
}));
