import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    entry: {
      index: "./src/index.ts",
    },
  },
  output: {
    target: "node",
    sourceMap: {
      js: "source-map",
    },
    minify: { js: false },
    distPath: {
      root: "./dist",
    },
  },
  lib: [
    {
      format: "cjs",
      dts: { bundle: true },
      autoExtension: false,
      output: {
        filename: {
          js: "[name].cjs",
        },
      },
    },
    {
      format: "esm",
      dts: false,
      autoExtension: false,
      output: {
        filename: {
          js: "[name].mjs",
        },
      },
    },
  ],
});
