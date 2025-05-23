import { defineConfig } from 'tsdown';
import { minify as swcMinify } from 'rollup-plugin-swc3';
import fs from 'fs/promises';
import path from 'path';
import { minify as minifyHtml } from '@minify-html/node';
import { transform, browserslistToTargets, bundle } from 'lightningcss';
import browserslist from 'browserslist';
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'

// Global configurations
const PATHS_TO_CLEAN: string[] = [
  'docs/scripts',
  'docs/styles',
  'docs/home.html',
  'docs/index.html',
];

const HTML_FILES_TO_MINIFY: { src: string; dest: string }[] = [
  { src: 'src/index.html', dest: 'docs/index.html' },
  { src: 'src/home.html', dest: 'docs/home.html' },
];

const ENABLE_CSS_SOURCEMAPS: boolean = true;

export default [
  defineConfig({
    entry: ['src/main.ts', 'src/katex.min.js'],
    platform: 'browser',
    outDir: 'docs/scripts',
    noExternal: ['remarkable'],
    plugins: [
      customBuildStepsPlugin(),
      swcMinify({
        module: true,
        mangle: {},
        compress: {},
      }),
      serve({
        open: true,
        contentBase: ['docs'],
        port: 5500,
      }),
      livereload({
        watch: 'docs',
        verbose: true,
        delay: 200,
      }),
    ],
  }),
];

// Helper function to ensure directory exists
async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw error;
    }
  }
}

// Custom plugin for build steps
function customBuildStepsPlugin() {
  return {
    name: 'custom-build-steps',
    async buildStart() {
      console.log('Cleaning output directories and files...');
      for (const p of PATHS_TO_CLEAN) {
        try {
          await fs.rm(p, { recursive: true, force: true });
        } catch (error) {
          console.error(`Error cleaning ${p}:`, error);
        }
      }
      await ensureDir('docs');
      console.log('Cleaning complete.');
    },
    async writeBundle() {
      // 1. Minify HTML
      console.log('Minifying HTML...');
      for (const { src, dest } of HTML_FILES_TO_MINIFY) {
        try {
          const htmlContent = await fs.readFile(src);
          const minifiedHtml = minifyHtml(htmlContent, {
            minify_css: true,
            minify_js: true,
          });
          await fs.writeFile(dest, minifiedHtml);
        } catch (error) {
          console.error(`Error minifying HTML ${src}:`, error);
        }
      }

      // 2. Minify CSS
      console.log('Minifying CSS...');
      const cssSourceDir = 'src/styles/';
      const cssDestDir = 'docs/styles/';
      await ensureDir(cssDestDir);

      const targets = browserslistToTargets(browserslist('>= 0.25%'));

      try {
        const { code, map } = bundle({
            filename: 'src/styles/base.css',
            minify: true,
            targets,
            sourceMap: ENABLE_CSS_SOURCEMAPS,
          });
          const destFile = path.join(cssDestDir, 'bundle.css');
          await fs.writeFile(destFile, code);
          if (ENABLE_CSS_SOURCEMAPS && map) {
            await fs.writeFile(destFile + '.map', map);
          }
      } catch (error) {
        console.error(`Error minifying CSS:`, error);
      }

      try {
        const { code, map } = transform({
            filename: 'src/styles/katex.min.css',
            code: await fs.readFile('src/styles/katex.min.css'),
            minify: true,
            targets,
            sourceMap: ENABLE_CSS_SOURCEMAPS,
          });
          const destFile = path.join(cssDestDir, 'katex.min.css');
          await fs.writeFile(destFile, code);
          if (ENABLE_CSS_SOURCEMAPS && map) {
            await fs.writeFile(destFile + '.map', map);
          }
      } catch (error) {
        console.error(`Error minifying CSS:`, error);
      }

      // 3. Copy Fonts
      console.log('Copying fonts...');
      const fontsSourceDir = 'src/styles/fonts';
      const fontsDestDir = 'docs/styles/fonts';
      try {
        await fs.access(fontsSourceDir);
        await ensureDir(fontsDestDir);
        const fontFiles = await fs.readdir(fontsSourceDir);
        for (const fontFile of fontFiles) {
          const srcPath = path.join(fontsSourceDir, fontFile);
          const destPath = path.join(fontsDestDir, fontFile);
          await fs.copyFile(srcPath, destPath);
        }
      } catch (error: any) {
        if (error.code === 'ENOENT' && error.path === fontsSourceDir) {
          console.log(`Fonts source directory ${fontsSourceDir} not found, skipping font copy.`);
        } else {
          console.error('Error copying fonts:', error);
        }
      }
    },
  };
}
