import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: [
    'src/scroll.js',
    'src/logo.js',
    'src/tooltip.js',
    'src/style.js',
    'src/page.js',
    ],
    bundle: true,
    minify: true,
    sourcemap: true,
    outdir: 'docs/scripts',
});

await esbuild.build({
    entryPoints: [
    'src/styles/base.css',
    'src/styles/content.css',
    'src/styles/elements.css',
    'src/styles/navbar.css',
    'src/styles/scroll.css',
    ],
    bundle: true,
    minify: true,
    outdir: 'docs/styles',
    plugins: [{
        name: 'ignore-fonts',
        setup(build) {
          // Match an import called "./shared" and mark it as external
          build.onResolve({ filter: /\.(woff2|woff|ttf)$/ }, () => ({ external: true }));
        }
    }]
});
