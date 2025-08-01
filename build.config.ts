
import { defineConfig } from 'tsdown';
import { minify as swcMinify } from "rollup-plugin-swc3";
import { BuildConfig, createBuildConfig, createCustomBuildStepsPlugin } from "./build-utils";

const BUILD_CONFIG: BuildConfig = createBuildConfig(false); // sourcemaps disabled for production build

export default [
  defineConfig({
    entry: ['src/browser/main.ts'],
    platform: 'browser',
    outDir: 'docs/scripts',
    external: ['./markdown.mjs'],
    plugins: [
      createCustomBuildStepsPlugin(BUILD_CONFIG),
      swcMinify({ module: true, mangle: {}, compress: {} })
    ],
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
