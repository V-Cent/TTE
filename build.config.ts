import { defineConfig } from 'tsdown';
import { minify as swcMinify } from 'rollup-plugin-swc3';
import fs from 'fs/promises';
import path from 'path';
import { minify as minifyHtml } from '@minify-html/node';
import { transform, browserslistToTargets, bundle, TransformResult, Targets } from 'lightningcss';
import browserslist from 'browserslist';

const ANSI: Record<string, string> = { RESET: '\x1b[0m', BRIGHT: '\x1b[1m', DIM: '\x1b[2m', RED: '\x1b[31m', GREEN: '\x1b[32m', YELLOW: '\x1b[33m', CYAN: '\x1b[36m' } as const;

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k: number = 1024;
  const sizes: string[] = ['B', 'KB', 'MB', 'GB'];
  const i: number = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatTime = (ms: number): string => ms < 1000 ? `${ms.toFixed(1)}ms` : `${(ms / 1000).toFixed(2)}s`;

const formatReduction = (original: number, compressed: number): string => {
  if (original === 0) return '0%';
  const reduction: number = ((original - compressed) / original) * 100;
  const color: string = reduction > 50 ? ANSI.GREEN : reduction > 25 ? ANSI.YELLOW : ANSI.RED;
  return `${color}${reduction.toFixed(1)}%${ANSI.RESET}`;
};

// --- CONFIGURATION

const BUILD_CONFIG: {
  PATHS_TO_CLEAN: string[];
  HTML_FILES: { src: string; dest: string }[];
  CSS_FILES: { src: string; dest: string; useBundle: boolean }[];
  ENABLE_SOURCEMAPS: boolean;
  BROWSERSLIST_TARGETS: Targets;
} = {
  PATHS_TO_CLEAN: ['docs/scripts', 'docs/styles', 'docs/home.html', 'docs/index.html'],
  HTML_FILES: [{ src: 'src/index.html', dest: 'docs/index.html' }, { src: 'src/home.html', dest: 'docs/home.html' }],
  CSS_FILES: [{ src: 'src/styles/base.css', dest: 'bundle.css', useBundle: true }, { src: 'src/styles/katex.min.css', dest: 'katex.min.css', useBundle: false }],
  ENABLE_SOURCEMAPS: false,
  BROWSERSLIST_TARGETS: browserslistToTargets(browserslist('defaults')),
} as const;

export default [
  defineConfig({
    entry: ['src/browser/main.ts'],
    platform: 'browser',
    outDir: 'docs/scripts',
    external: ['./markdown.mjs'],
    plugins: [customBuildStepsPlugin(), swcMinify({ module: true, mangle: {}, compress: {} })],
  }),
  defineConfig({
    entry: ['src/browser/markdown.ts'],
    platform: 'browser',
    outDir: 'docs/scripts',
    noExternal: ['remarkable', 'codemirror', '@codemirror/lang-markdown', '@codemirror/autocomplete'],
    external: ['node:path', 'node:fs', 'node:os', 'JSDOM', 'node:fs/promises'],
    plugins: [
      swcMinify({
        module: true,
        mangle: {},
        compress: {},
      }),
    ],
  }),
];

// --- Custom build

async function getFileSize(filePath: string): Promise<number> {
  try { return (await fs.stat(filePath)).size; } catch { return 0; }
}

async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') await fs.mkdir(dirPath, { recursive: true });
    else throw error;
  }
}

async function cleanOutputs(): Promise<void> {
  await Promise.all(BUILD_CONFIG.PATHS_TO_CLEAN.map(async (p: string) => {
    try { await fs.rm(p, { recursive: true, force: true }); } catch (error) { console.error(`${ANSI.RED}Error cleaning ${p}:${ANSI.RESET}`, error); }
  }));
  await ensureDir('docs');
}

async function minifyHtmlFiles(): Promise<{ count: number; originalSize: number; compressedSize: number; time: number }> {
  const startTime: number = performance.now();
  let totalOriginal: number = 0;
  let totalCompressed: number = 0;
  let processedCount: number = 0;

  // Compile all HTML files async
  await Promise.all(BUILD_CONFIG.HTML_FILES.map(async ({ src, dest }: { src: string; dest: string }) => {
    try {
      const originalSize: number = await getFileSize(src);
      const htmlContent: Buffer = await fs.readFile(src);
      const minifiedHtml: Buffer = minifyHtml(htmlContent, { minify_css: true, minify_js: true });
      await fs.writeFile(dest, minifiedHtml);

      totalOriginal += originalSize;
      totalCompressed += minifiedHtml.length;
      processedCount++;
    } catch (error) {
      console.error(`${ANSI.RED}Error minifying HTML ${src}:${ANSI.RESET}`, error);
    }
  }));

  return { count: processedCount, originalSize: totalOriginal, compressedSize: totalCompressed, time: performance.now() - startTime };
}

async function processCssFiles(): Promise<{ count: number; compressedSize: number; time: number }> {
  const startTime: number = performance.now();
  await ensureDir('docs/styles/');
  let totalCompressed: number = 0;
  let processedCount: number = 0;

  // Compile all CSS files async
  await Promise.all(BUILD_CONFIG.CSS_FILES.map(async ({ src, dest, useBundle }: { src: string; dest: string; useBundle: boolean }) => {
    try {
      const destFile: string = path.join('docs/styles/', dest);
      let code: Uint8Array<ArrayBufferLike>;
      let map: Uint8Array<ArrayBufferLike> | void;

      if (useBundle) {
        const result: TransformResult = bundle({ filename: src, minify: true, targets: BUILD_CONFIG.BROWSERSLIST_TARGETS, sourceMap: BUILD_CONFIG.ENABLE_SOURCEMAPS });
        code = result.code; map = result.map;
      } else {
        const cssContent: Buffer = await fs.readFile(src);
        const result: TransformResult = transform({ filename: src, code: cssContent, minify: true, targets: BUILD_CONFIG.BROWSERSLIST_TARGETS, sourceMap: BUILD_CONFIG.ENABLE_SOURCEMAPS });
        code = result.code; map = result.map;
      }

      await fs.writeFile(destFile, code);
      if (BUILD_CONFIG.ENABLE_SOURCEMAPS && map) await fs.writeFile(destFile + '.map', map);

      totalCompressed += code.length;
      processedCount++;
    } catch (error) {
      console.error(`${ANSI.RED}Error processing CSS ${src}:${ANSI.RESET}`, error);
    }
  }));

  return { count: processedCount, compressedSize: totalCompressed, time: performance.now() - startTime };
}

async function copyFonts(): Promise<{ count: number; totalSize: number; time: number }> {
  const startTime: number = performance.now();
  const fontsSourceDir: string = 'src/styles/fonts', fontsDestDir: string = 'docs/styles/fonts';
  let totalSize: number = 0;
  let copiedCount: number = 0;

  try {
    await fs.access(fontsSourceDir);
    await ensureDir(fontsDestDir);

    const fontFiles: string[] = await fs.readdir(fontsSourceDir);
    // Copy fonts async
    await Promise.all(fontFiles.map(async (fontFile: string) => {
      const srcPath: string = path.join(fontsSourceDir, fontFile);
      const destPath: string = path.join(fontsDestDir, fontFile);
      const fileSize: number = await getFileSize(srcPath);
      await fs.copyFile(srcPath, destPath);
      totalSize += fileSize; copiedCount++;
    }));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.log(`${ANSI.YELLOW}Fonts source directory not found, skipping.${ANSI.RESET}`);
    } else {
      console.error(`${ANSI.RED}Error copying fonts:${ANSI.RESET}`, error);
    }
  }

  return { count: copiedCount, totalSize, time: performance.now() - startTime };
}

function customBuildStepsPlugin(): { name: string; buildStart: () => Promise<void>; writeBundle: () => Promise<void> } {
  return {
    name: 'custom-build-steps',

    async buildStart(): Promise<void> {
      const startTime: number = performance.now();
      console.log(`${ANSI.YELLOW}Cleaning output directories...${ANSI.RESET}`);
      await cleanOutputs();
      console.log(`${ANSI.GREEN}Cleaning complete${ANSI.RESET} ${ANSI.DIM}(${formatTime(performance.now() - startTime)})${ANSI.RESET}`);
    },

    async writeBundle(): Promise<void> {
      const totalStartTime: number = performance.now();
      console.log(`${ANSI.CYAN}Processing build assets...${ANSI.RESET}`);

      const [htmlResults, cssResults, fontResults]: [
        { count: number; originalSize: number; compressedSize: number; time: number },
        { count: number; compressedSize: number; time: number },
        { count: number; totalSize: number; time: number }
      ] = await Promise.all([minifyHtmlFiles(), processCssFiles(), copyFonts()]);
      const totalTime: number = performance.now() - totalStartTime;

      console.log(`${ANSI.GREEN}Build assets processed successfully!${ANSI.RESET}`);
      console.log(`HTML: ${htmlResults.count} files, ${formatSize(htmlResults.originalSize)} → ${formatSize(htmlResults.compressedSize)} (${formatReduction(htmlResults.originalSize, htmlResults.compressedSize)}) ${ANSI.DIM}${formatTime(htmlResults.time)}${ANSI.RESET}`);
      console.log(`CSS: ${cssResults.count} files, ${formatSize(cssResults.compressedSize)} ${ANSI.DIM}${formatTime(cssResults.time)}${ANSI.RESET}`);
      if (fontResults.count > 0) console.log(`Fonts: ${fontResults.count} files, ${formatSize(fontResults.totalSize)} ${ANSI.DIM}${formatTime(fontResults.time)}${ANSI.RESET}`);
      console.log(`${ANSI.BRIGHT}Total time: ${formatTime(totalTime)}${ANSI.RESET}`);
    },
  };
}
