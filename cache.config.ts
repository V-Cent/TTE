import { defineConfig } from 'tsdown';
import { minify as swcMinify } from 'rollup-plugin-swc3';

export default [
  defineConfig({
    entry: ['src/node/cache.ts'],
    platform: 'node',
    outDir: 'cache',
    noExternal: ['remarkable', 'node:path', 'node:fs', 'node:os', 'JSDOM', 'node:fs/promises'],
    plugins: [
      swcMinify({
        module: true,
        mangle: {},
        compress: {},
      }),
    ],
  }),
];
