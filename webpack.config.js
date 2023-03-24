const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "fs": false,
      "perf_hooks": false,
      "os": false,
      "path": false,
      "crypto": false,
      "worker_threads": false
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'docs'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'docs'),
    },
    compress: true,
    port: 8080,
    headers: { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' },
  },
};