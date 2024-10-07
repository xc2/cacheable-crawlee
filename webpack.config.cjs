const NodePath = require("path");
module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    path: NodePath.resolve(__dirname, "dist"),
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
        // use: "ts-blank-loader",
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
};
