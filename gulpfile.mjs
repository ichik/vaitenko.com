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
        watch: `${dirs.entry}/css/*`,
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
    headers: {
        src: `${dirs.entry}/_headers`,
        dest: `${dirs.output}`,
    },
    scripts: {
        src: `${dirs.entry}/pages/appsmith/main.js`,
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
// Headers.
// -----------------------------------------------------------------------------

const headers = () =>
    src(paths.headers.src, { since: lastRun('headers') })
        .pipe(plumber(pluginConfig.plumber))
        .pipe(dest(paths.headers.dest));

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
// Prototypes.
// -----------------------------------------------------------------------------

const prototypes = () =>
    src(paths.prototypes.src, { since: lastRun('prototypes') })
        .pipe(plumber(pluginConfig.plumber))
        .pipe(dest(paths.prototypes.dest));

// -----------------------------------------------------------------------------
// Scripts.
// -----------------------------------------------------------------------------

const scripts = () =>
    src(paths.scripts.src, { since: lastRun('scripts') })
        .pipe(plumber(pluginConfig.plumber))
        .pipe(dest(paths.scripts.dest));

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
    watch(paths.styles.watch, series(styles, reload));
    watch(paths.fonts.src, series(fonts, reload));
    watch(paths.images.src, series(images, reload));
    watch(paths.videos.src, series(videos, reload));
    watch(paths.scripts.src, series(scripts, reload));
};

//------------------------------------------------------------------------------
// Tasks.
//------------------------------------------------------------------------------

task(clean);
task(publicAssets);
task(headers);
task(pages);
task(styles);
task(fonts);
task(images);
task(videos);
task(prototypes);
task(scripts);
task(
    'build',
    parallel(
        'publicAssets',
        'headers',
        'pages',
        'styles',
        'fonts',
        'images',
        'videos',
        'prototypes',
        'scripts',
    ),
);
task('default', series('clean', 'build'));

task(serve);
task(watchSource);
task('dev', series('clean', 'build', 'serve', 'watchSource'));
