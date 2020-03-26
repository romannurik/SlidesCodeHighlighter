/*
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const browserSync = require('browser-sync');
const del = require('del');
const runSequence = require('run-sequence');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const workbox = require('workbox-build');
const ghpages = require('gh-pages');
const path = require('path');


let DEV_MODE = false;


function errorHandler(error) {
  console.error(error.stack);
  this.emit('end'); // http://stackoverflow.com/questions/23971388
}


gulp.task('prettify-languages', cb => {
  return gulp.src('node_modules/code-prettify/src/lang*.js')
      .pipe($.concat('prettify-languages.js'))
      .pipe(gulp.dest('dist'));
});


gulp.task('service-worker', () => {
  if (DEV_MODE) {
    return gulp.src('sw-dev.js')
        .pipe($.rename('sw.js'))
        .pipe(gulp.dest('dist'));
  }

  return workbox.generateSW({
    globDirectory: 'dist',
    globPatterns: [
      '**/*.{html,js,css}'
    ],
    globIgnores: ['**/sw-dev.js'],
    swDest: 'dist/sw.js',
    clientsClaim: true,
    skipWaiting: true
  }).then(({warnings}) => {
    // In case there are any warnings from workbox-build, log them.
    for (const warning of warnings) {
      console.warn(warning);
    }
    console.info('Service worker generation completed.');
  }).catch((error) => {
    console.warn('Service worker generation failed:', error);
  });
});


gulp.task('copy', () => {
  return gulp.src([
    'index.html',
    'favicon.ico',
    'manifest.json',

    // code
    'material-colors.js',
    'themes.js',
    'index.js',

    // libs
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/code-prettify/src/prettify.js',
    'node_modules/ace-builds/src-min-noconflict/ace.js',
    'node_modules/ace-builds/src-min-noconflict/mode-text.js',
    'node_modules/ace-builds/src-min-noconflict/theme-chrome.js',
    'node_modules/webfontloader/webfontloader.js',

    // icons
    'images/**/*.png'
  ])
      .pipe(gulp.dest('dist'));
});


gulp.task('styles', () => {
  return gulp.src('index.scss')
      .pipe($.changed('styles', {extension: '.scss'}))
      .pipe($.sass({
        style: 'expanded',
        precision: 10,
        quiet: true
      }).on('error', errorHandler))
      .pipe(gulp.dest('dist'));
});


gulp.task('clean', cb => {
  del.sync(['dist']);
  $.cache.clearAll();
  cb();
});


gulp.task('build', gulp.series('styles', 'prettify-languages', 'copy', 'service-worker'));

gulp.task('deploy', cb => {
  ghpages.publish(path.join(process.cwd(), 'dist'), cb);
});


gulp.task('default', gulp.series('clean', 'build'));

gulp.task('serve', gulp.series('build', () => {
  DEV_MODE = true;
  browserSync({
    notify: false,
    server: {
      baseDir: ['dist']
    }
  });
  gulp.watch(['*.{html,js}'], gulp.series('copy', () => {
    browserSync.reload
  }));
  gulp.watch(['*.scss'], gulp.series('styles', () => {
    browserSync.reload
  }));
}));

