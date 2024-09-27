import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    entry: {
      index: "./src/index.ts",
    },
  },
  output: {
    sourceMap: {
      js: "source-map",
    },
    minify: { js: true },
    distPath: {
      root: "./dist",
    },
  },
  lib: [
    {
      format: "cjs",
      dts: { bundle: false },
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
    },
  ],
});
