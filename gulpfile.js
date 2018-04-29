var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');
var cssBase64 = require('gulp-css-base64');

gulp.task('js-lib', function(){

    return gulp.src([
        'js/src/lib/zz.js',
        'js/src/lib/zzDragAndDrop.js',
        'js/src/lib/vue.min.js',
        'js/src/lib/dateFormat.js',
        'js/src/lib/scene.js',
        'js/src/lib/thumb.js'
    ])
        .pipe(concat('lib.min.js'))
        .pipe(gulp.dest('js/dest/package'))
        .pipe(rename('lib.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('js/dest/package'));
});

gulp.task('css-base64', function () {
    return gulp.src('css/viewer.css')
        .pipe(cssBase64())
        .pipe(gulp.dest('css'));
});

gulp.task('css', function () {
    return gulp.src('css/viewer.css')
        .pipe(cssBase64())
        .pipe(cleanCSS())
        .pipe(gulp.dest('js/dest/package'));
});

gulp.task('css-minify', function() {
  return gulp.src('css/viewer.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('js/dest/package'));
});

gulp.task('js-tophat', function(){

    return gulp.src([
        'js/src/tophat/dirMixin.js',
        'js/src/tophat/fileMixin.js',
        'js/src/tophat/imageProcessingMixin.js',
        'js/src/tophat/settingsMixin.js',
        'js/src/tophat/deleteMixin.js',
        'js/src/tophat/keyMixin.js',
        'js/src/tophat/libMixin.js',
        'js/src/tophat/sceneMixin.js',
        'js/src/tophat/topMixin.js',
        'js/src/tophat/bookmarksMixin.js',
        'js/src/tophat/thumbMixin.js',
        'js/src/tophat/thumbScrollMixin.js',
        'js/src/tophat/thumbShowMixin.js',
        'js/src/tophat/treeMixin.js',
        'js/src/tophat/zipMixin.js',
        'js/src/tophat/videoMixin.js',
        'js/src/tophat/dragAndDropMixin.js',
        'js/src/tophat/searchMixin.js',
        'js/src/tophat/stockMixin.js',
        'js/src/tophat/param.js',
        'js/src/tophat/tree.js',
        'js/src/tophat/lang.js',
        'js/src/tophat/init.js'
    ])
        .pipe(concat('tophat.min.js'))
        .pipe(gulp.dest('js/dest/package'))
        .pipe(rename('tophat.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('js/dest/package'));
});

gulp.task('html', function() {

    return gulp.src([
        'js/src/tpl/start.tpl',
        'js/src/tpl/main.tpl',
        'js/src/tpl/end.tpl',
    ])
    .pipe(concat('index.html'))
    .pipe(gulp.dest('./'));
});

gulp.task('html-min', function() {

    return gulp.src([
        'js/src/tpl/start.min.tpl',
        'js/src/tpl/main.tpl',
        'js/src/tpl/end.min.tpl',
    ])
    .pipe(concat('index.html'))
    .pipe(gulp.dest('js/dest/package'));
});

gulp.task('watch', function() {

    gulp.watch(
        [
            'js/src/tpl/*.tpl'
        ],
        ['html', 'html-min']);

    gulp.watch(
        [
            'js/src/tophat/*.js'
        ],
        ['js-tophat']);

    gulp.watch(
        [
            'js/src/lib/*.js'
        ],
        ['js-lib']);
});

gulp.task('default', ['js-lib', 'js-tophat', 'html', 'html-min', 'css'], function(){});
