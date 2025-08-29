import { defineConfig } from 'tsdown';

export default [
  defineConfig({
    entry: ['src/node/cache.ts'],
    platform: 'node',
    outDir: 'cache',
    noExternal: ['remarkable', 'node:path', 'node:fs', 'node:os', 'JSDOM', 'node:fs/promises', 'katex'],
    minify: true,
  }),
];
