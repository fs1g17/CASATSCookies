const {
  task, src, dest, series
} = require('gulp');

const ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');
task('compile-typescript', () => tsProject.src().pipe(tsProject()).js.pipe(dest('dist/')));

const assetsPath = 'dist/static-assets';

task('build-project-js', () => src(['./app/assets/javascript/*.js'])
  .pipe(dest(`${assetsPath}/javascript`))
);

task('build', series(['build-project-js']));
task('compile', series(['compile-typescript']));