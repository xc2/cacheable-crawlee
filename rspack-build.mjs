import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

function nestRequire(...paths) {
  const fin = paths.pop();
  const r = paths.reduce(
    (prev, path) => createRequire(prev.resolve(path)),
    createRequire(import.meta.url)
  );
  return r(fin);
}

const rspack = nestRequire("@rslib/core", "@rsbuild/core", "@rspack/core");

const compiler = rspack({
  mode: "development",
  entry: "./src/index.ts",
  output: {
    path: fileURLToPath(new URL("dist", import.meta.url)),
    filename: "index.mjs",
    clean: true,
    library: {
      type: "module",
    },
  },
  devtool: false,
  target: ["es2022", "node"],
  externals: ["tldts", "@crawlee/http"],
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".js"],
      ".mjs": [".mts", ".mjs"],
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              externalHelpers: false,
              parser: { tsx: false, syntax: "typescript", decorators: true },
              transform: { legacyDecorator: false, decoratorVersion: "2022-03" },
            },
            isModule: "unknown",
            env: { targets: ["last 1 node versions"] },
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  experiments: {
    outputModule: true,
  },
});

const stats = await promisify(compiler.run.bind(compiler))();
console.log(stats.toString({ preset: "minimal" }));
