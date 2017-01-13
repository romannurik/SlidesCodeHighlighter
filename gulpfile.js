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

function errorHandler(error) {
  console.error(error.stack);
  this.emit('end'); // http://stackoverflow.com/questions/23971388
}


gulp.task('copy', cb => {
  return gulp.src([
    'index.html',
    'index.js',

    // libs
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/google-code-prettify/bin/prettify.min.js',
    'bower_components/ace-builds/src-min-noconflict/ace.js',
    'bower_components/ace-builds/src-min-noconflict/mode-text.js',
    'bower_components/ace-builds/src-min-noconflict/theme-chrome.js',
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


gulp.task('serve', ['build'], () => {
  browserSync({
    notify: false,
    server: {
      baseDir: ['dist']
    }
  });

  gulp.watch(['*.{html,js}'], ['copy', browserSync.reload]);
  gulp.watch(['*.scss'], ['styles', browserSync.reload]);
});


gulp.task('build', cb => {
  runSequence(['styles'], ['copy'], cb);
});


gulp.task('deploy', () => {
  return gulp.src('dist/**/*', {dot: true})
      .pipe($.ghPages());
});


gulp.task('default', ['clean', 'build']);
