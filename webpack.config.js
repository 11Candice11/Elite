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
        target: "https://elite-e9d0awa6hfgsfhav.southafricanorth-01.azurewebsites.net",
        changeOrigin: true,
        secure: false, // Set to false if the backend uses self-signed certificates
      },
    },
    historyApiFallback: true,
    static: path.resolve(__dirname, "src"),
    port: 3000,
    open: true,
    headers: {
      "Access-Control-Allow-Origin": "*", // Allow all origins
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS", // Allow specific HTTP methods
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization", // Allow custom headers
      "Content-Security-Policy": `
        default-src 'self';
        connect-src 'self' https://elite-e9d0awa6hfgsfhav.southafricanorth-01.azurewebsites.net;
        script-src 'self';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data:;
        font-src 'self';
      `,
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
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
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
  resolve: {
    extensions: [".js", ".mjs"], // Add .mjs here
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