import path from "path";
import { fileURLToPath } from "url";

import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    background: "./src/background.js",
    popup: "./src/popup.jsx",
    content: "./src/content.js"
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/popup.html",
      filename: "popup.html"
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "public",
          to: "." // Copies to build folder
        },
        {
          from: "src/popup.css",
          to: "popup.css"
        },

        {
          from: "node_modules/onnxruntime-web/dist/*.wasm",
          to: "[name][ext]"
        }
      ]
    })
  ]
};

export default config;
