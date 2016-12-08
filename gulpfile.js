(function (require) {
  'use strict';
  const gulp = require('gulp');
  const Server = require('karma').Server;
  const spawn = require('child_process').spawn;
  const clean = require('gulp-clean');
  const webpack = require('gulp-webpack');
  const named = require('vinyl-named');
  const rename = require('gulp-rename');
  let serverInstance;

  gulp.task('default', () => {

    gulp
      .watch([
        'src/*',
        'src/**/*',
        'test/**/*'
      ], [
        'clean',
        'webpack',
        'move-pack',
        'move-server',
        'move-static',
//        'test',
        'server'
      ]);
  });

  gulp.task('clean', () => {
    gulp
      .src('build')
      .pipe(clean())
  });

  gulp.task('webpack', () =>
    gulp
      .src([
        'src/public/**/*.js'
      ])
      .pipe(named())
      .pipe(webpack())
      .pipe(gulp.dest('build/tmp/'))
  );

  gulp.task('move-pack', ['webpack'], () =>
    gulp
      .src([
        'build/tmp/main.js'
      ])
      .pipe(rename('app.js'))
      .pipe(gulp.dest('build/public/js/'))
  );

  gulp.task('move-server', ['move-pack'], () =>
    gulp
      .src([
        'src/server/**/*'
      ])
      .pipe(gulp.dest('build/server/'))
  );

  gulp.task('move-libs', ['move-server'], () =>
    /*
    gulp
      .src([
        'node_modules/angular/angular.js',
        'node_modules/angular-aria/angular-aria.js',
        'node_modules/angular-animate/angular-animate.js',
        'node_modules/angular-messages/angular-messages.js',
        'node_modules/angular-material/angular-material.js'
      ])
      .pipe(gulp.dest('build/public/js/libs/angular/'))
    */null
  );

  gulp.task('move-static', ['move-libs'], () =>
    gulp
      .src([
        'src/public/**/*.*',
        'src/public/*.*',
        '!src/public/**/*.ts',
        '!src/public/*.ts'
      ])
      .pipe(gulp.dest('build/public/'))
  );

  gulp.task('clean-tmp', ['move-static', 'move-server'], ( done ) =>

    gulp
      .src('build/tmp')
      .pipe(clean())
  );
/*
  gulp.task('test', ['clean-tmp'], ( done ) => {
    new Server({
      configFile: __dirname + '/karma.conf.js',
      singleRun: true
    }, done).start();
  });
*/
  gulp.task('server', ['move-server'], () => {
    if (serverInstance)
      serverInstance.kill();

    serverInstance = spawn('node', ['build/server/main.js'], {stdio: 'inherit'});
  });
}(require));
