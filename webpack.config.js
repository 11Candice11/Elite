import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        assetModuleFilename: 'images/[name][hash][ext][query]', // Output folder for images
        clean: true,
    },
    mode: 'development',
    devServer: {
      proxy: [
        {
            context: ['/api'], // Routes to proxy
            target: 'http://localhost:6200', // Backend server
            changeOrigin: true, // Adjust the origin of the request
        },
    ],
        historyApiFallback: true, // Handle SPA routing
        static: path.resolve(__dirname, 'dist'),
        port: 3000,
        open: true,
        headers: {
          'Content-Security-Policy': "connect-src 'self' http://localhost:6200", // Allow backend connections
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i, // Rule for image files
                type: 'asset/resource', // Webpack 5+ handles assets with "asset/resource"
                generator: {
                  filename: 'images/[name][hash][ext][query]', // Output path for images
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            inject: 'body',
            // Add this script to include the required containers
            templateParameters: {
              appContainer: '<div id="app"></div>',
            },
          }),
        ],
    };
