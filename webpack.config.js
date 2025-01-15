import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    assetModuleFilename: "images/[name][hash][ext][query]",
    clean: true,
  },
  mode: "development",
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:6200",
        changeOrigin: true,
      },
    },
    historyApiFallback: true,
    static: path.resolve(__dirname, "src"),
    port: 3000,
    open: true,
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; connect-src 'self' http://localhost:6200;",
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][hash][ext][query]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      inject: "body",
      templateParameters: {
        appContainer: '<div id="app"></div>',
      },
    }),
  ],
};
