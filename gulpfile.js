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

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const workbox = require('workbox-build');
const { sassPlugin } = require('esbuild-sass-plugin');

const esbuild = require('esbuild');

let DEV_MODE = false;


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
  }).then(({ warnings }) => {
    // In case there are any warnings from workbox-build, log them.
    for (const warning of warnings) {
      console.warn(warning);
    }
    console.info('Service worker generation completed.');
  }).catch((error) => {
    console.warn('Service worker generation failed:', error);
  });
});


function esBuild(extraOptions) {
  return esbuild.context({
    entryPoints: ['index.js'],
    bundle: true,
    minify: !DEV_MODE,
    loader: {
      ".ttf": "file",
    },
    ...extraOptions,
    plugins: [
      ...(extraOptions?.plugins || []),
      sassPlugin(),
    ],
    outfile: 'dist/index.js',
  });
}

gulp.task('esbuild', async () => {
  let ctx = await esBuild();
  ctx.rebuild();
  ctx.dispose();
});


gulp.task('copy', () => {
  return gulp.src([
    'index.html',
    'favicon.ico',
    'manifest.json',

    // libs
    'prism.js',
    // 'node_modules/ace-builds/src-min-noconflict/ace.js',
    // 'node_modules/ace-builds/src-min-noconflict/mode-text.js',
    // 'node_modules/ace-builds/src-min-noconflict/theme-chrome.js',
    // 'node_modules/webfontloader/webfontloader.js',

    // icons
    'images/**/*.png'
  ])
    .pipe(gulp.dest('dist'));
});


gulp.task('clean', cb => {
  del.sync(['dist']);
  $.cache.clearAll();
  cb();
});


gulp.task('build', gulp.series('clean', 'esbuild', 'copy', 'service-worker'));


gulp.task('__serve__', gulp.series('build', () => {
  browserSync({
    notify: false,
    server: {
      baseDir: ['dist']
    }
  });

  let reload = cb => { browserSync.reload(); cb && cb(); };

  esBuild({
    plugins: [{
      name: 'on-build-end',
      setup(build) {
        build.onEnd((result) => {
          if (!result.errors.length) reload();
        });
      },
    }]
  }).then(ctx => ctx.watch());

  gulp.watch(['*.{html,js}'], gulp.series('copy', reload));
}));


gulp.task('serve', gulp.series(cb => { DEV_MODE = true; cb(); }, '__serve__'));


gulp.task('default', gulp.series('clean', 'build'));
