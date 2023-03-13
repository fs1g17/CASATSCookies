const {
  task, src, dest, series
} = require('gulp');

const ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');
task('compile-typescript', () => tsProject.src().pipe(tsProject()).js.pipe(dest('dist/')));
task('compile', series(['compile-typescript']));