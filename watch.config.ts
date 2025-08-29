import { defineConfig } from 'tsdown';
import livereload from 'rollup-plugin-livereload';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import serve from "rollup-plugin-serve";
import { BuildConfig, createBuildConfig, createCustomBuildStepsPlugin } from "./build-utils";

const BUILD_CONFIG: BuildConfig = createBuildConfig(true); // sourcemaps enabled for development

export default [
  defineConfig({
    entry: ['src/browser/main.ts'],
    platform: 'browser',
    outDir: 'docs/scripts',
    external: ['./markdown.mjs'],
    minify: true,
    plugins: [
      createCustomBuildStepsPlugin(BUILD_CONFIG),
      serve({
        open: true,
        openPage: '/',
        historyApiFallback: true,
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
  defineConfig({
    entry: ['src/browser/markdown.ts'],
    platform: 'browser',
    outDir: 'docs/scripts',
    noExternal: ['remarkable', 'codemirror', '@codemirror/lang-markdown', '@codemirror/autocomplete', 'katex'],
    external: ['node:path', 'node:fs', 'node:os', 'JSDOM', 'node:fs/promises'],
    minify: true,
  }),
];
