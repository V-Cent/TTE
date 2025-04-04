import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/main.ts", "src/katex.min.js"],
  bundle: true,
  minify: true,
  sourcemap: true,
  logLevel: "info",
  outdir: "docs/scripts",
  splitting: true,
  format: "esm",
  external: ["./scripts/katex.min.js"],
});

await esbuild.build({
  entryPoints: [
    "src/styles/base.css",
    "src/styles/content.css",
    "src/styles/elements.css",
    "src/styles/navbar.css",
    "src/styles/scroll.css",
    "src/styles/katex.min.css",
  ],
  bundle: true,
  minify: true,
  logLevel: "info",
  outdir: "docs/styles",
  plugins: [
    {
      name: "ignore-fonts",
      setup(build) {
        // Match an import called "./shared" and mark it as external
        build.onResolve({ filter: /\.(woff2|woff|ttf)$/ }, () => ({
          external: true,
        }));
      },
    },
  ],
});
