'use strict';

import { deleteAsync } from 'del';
import gulp from 'gulp';
const { series, parallel, src, dest, task, lastRun, watch } = gulp;
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import nunjucks from 'gulp-nunjucks-render';
import htmlmin from 'gulp-htmlmin';
import cssimport from 'gulp-cssimport';
import cleanCSS from 'gulp-clean-css';
import browserSync from 'browser-sync';

//------------------------------------------------------------------------------
// Configuration.
//------------------------------------------------------------------------------

const dirs = {
    entry: 'src',
    output: 'build',
};

const paths = {
    public: {
        src: `${dirs.entry}/public/**/*`,
        dest: `${dirs.output}`,
    },
    pages: {
        templates: `${dirs.entry}/templates`,
        src: `${dirs.entry}/pages/**/*.+(njk)`,
        dest: `${dirs.output}`,
    },
    styles: {
        src: `${dirs.entry}/css/style.css`,
        dest: `${dirs.output}/style`,
    },
    fonts: {
        src: `${dirs.entry}/fonts/**/*`,
        dest: `${dirs.output}/fonts`,
    },
    images: {
        src: `${dirs.entry}/pages/**/images/*.+(jpg|png|webp|svg|gif)`,
        dest: `${dirs.output}`,
    },
    videos: {
        src: `${dirs.entry}/pages/**/video/*.+(webp|webm|mp4)`,
        dest: `${dirs.output}`,
    },
    prototypes: {
        src: `${dirs.entry}/pages/**/zenmateswitch/*.+(png|html)`,
        dest: `${dirs.output}`,
    },
};

const pluginConfig = {
    nunjucksRender: {
        path: paths.pages.templates,
        envOptions: {
            autoescape: true,
            throwOnUndefined: true,
            trimBlocks: true,
            lstripBlocks: true,
        },
    },
    htmlmin: {
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
    },
    plumber: {
        errorHandler(...args) {
            notify
                .onError({
                    title: 'Compile Error',
                    message: '<%= error.message %>',
                    sound: 'Funk',
                })
                .apply(this, args);
            this.emit('end');
        },
    },
    browserSync: {
        port: 3000,
        server: { baseDir: `${dirs.output}` },
    },
};

// -----------------------------------------------------------------------------
// Public.
// -----------------------------------------------------------------------------

const publicAssets = () =>
    src(paths.public.src, { since: lastRun('publicAssets') })
        .pipe(plumber(pluginConfig.plumber))
        .pipe(dest(paths.public.dest));

// -----------------------------------------------------------------------------
// Pages.
// -----------------------------------------------------------------------------

const pages = () => {
    return src(paths.pages.src, { since: lastRun('pages') })
        .pipe(plumber(pluginConfig.plumber))
        .pipe(nunjucks(pluginConfig.nunjucksRender))
        .pipe(htmlmin(pluginConfig.htmlmin))
        .pipe(dest(paths.pages.dest));
};

// -----------------------------------------------------------------------------
// Styles.
// -----------------------------------------------------------------------------
const styles = () => {
    return src(paths.styles.src, { since: lastRun('styles') })
        .pipe(plumber(pluginConfig.plumber))
        .pipe(cssimport())
        .pipe(cleanCSS())
        .pipe(dest(paths.styles.dest));
};

// -----------------------------------------------------------------------------
// Fonts.
// -----------------------------------------------------------------------------

const fonts = () =>
    src(paths.fonts.src, { since: lastRun('fonts') })
        .pipe(plumber(pluginConfig.plumber))
        .pipe(dest(paths.fonts.dest));

// -----------------------------------------------------------------------------
// Images.
// -----------------------------------------------------------------------------

const images = () =>
    src(paths.images.src, { since: lastRun('images') })
        .pipe(plumber(pluginConfig.plumber))
        .pipe(dest(paths.images.dest));

// -----------------------------------------------------------------------------
// Video assets.
// -----------------------------------------------------------------------------

const videos = () =>
    src(paths.videos.src, { since: lastRun('videos') })
        .pipe(plumber(pluginConfig.plumber))
        .pipe(dest(paths.videos.dest));

// -----------------------------------------------------------------------------
// Video assets.
// -----------------------------------------------------------------------------

const prototypes = () =>
    src(paths.prototypes.src, { since: lastRun('prototypes') })
        .pipe(plumber(pluginConfig.plumber))
        .pipe(dest(paths.prototypes.dest));

//------------------------------------------------------------------------------
// Clean.
//------------------------------------------------------------------------------

const clean = () => deleteAsync([dirs.output]);

//------------------------------------------------------------------------------
// Serve.
//------------------------------------------------------------------------------

const serve = done => {
    browserSync.init(pluginConfig.browserSync);
    done();
};

//------------------------------------------------------------------------------
// Development.
//------------------------------------------------------------------------------

const reload = done => {
    browserSync.reload();
    done();
};

const watchSource = () => {
    watch(paths.public.src, series(publicAssets, reload));
    watch(paths.pages.src, series(pages, reload));
    watch(paths.styles.src, series(styles, reload));
    watch(paths.fonts.src, series(fonts, reload));
    watch(paths.images.src, series(images, reload));
    watch(paths.videos.src, series(videos, reload));
};

//------------------------------------------------------------------------------
// Tasks.
//------------------------------------------------------------------------------

task(clean);
task(publicAssets);
task(pages);
task(styles);
task(fonts);
task(images);
task(videos);
task(prototypes);
task(
    'build',
    parallel('publicAssets', 'pages', 'styles', 'fonts', 'images', 'videos', 'prototypes'),
);
task('default', series('clean', 'build'));

task(serve);
task(watchSource);
task('dev', series('clean', 'build', 'serve', 'watchSource'));
