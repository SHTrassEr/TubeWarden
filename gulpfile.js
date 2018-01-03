var gulp = require('gulp');
var del = require('del');
var ts = require('gulp-typescript');

gulp.task('clean', () => {
    return del(['bin/**/*']);
});

gulp.task('copy', () => {
    gulp.src(['src/**/*', '!src/**/*.ts']).pipe(gulp.dest('./bin/'));
});

gulp.task('build', () => {
    var tsProject = ts.createProject('src/tsconfig.json');
    var tsResult = tsProject.src().pipe(tsProject());; 
    return tsResult.js.pipe(gulp.dest('bin'));
});


gulp.task('default', ['copy', 'build']);