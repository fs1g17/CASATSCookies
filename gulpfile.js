const {
  task, src, dest, series
} = require('gulp');

const ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');
task('compile-typescript', () => tsProject.src().pipe(tsProject()).js.pipe(dest('dist/')));

const assetsPath = 'dist/static-assets';

// task('build-project-js', () => src(['./app/assets/javascript/*.js'])
//   .pipe(dest(`${assetsPath}/javascript`))
// );

task('build-project-js', () => src(['./app/assets/javascript/*.js'])
  .pipe(dest(`dist/public/javascript`))
);

task('build-project-css', () => src(['./app/assets/css/*.css'])
  .pipe(dest(`dist/public/css`))
);

task('build', series(['build-project-js','build-project-css']));
task('compile', series(['compile-typescript']));