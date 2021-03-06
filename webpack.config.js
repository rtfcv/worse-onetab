const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    tablist: path.resolve(__dirname, './src/tablist/tablist.jsx'),
    popup: path.resolve(__dirname, './src/popup/popup.jsx'),
    options: path.resolve(__dirname, './src/options/options.jsx'),
    service_worker: {
      import: path.resolve(__dirname, './src/service_worker.js'),
      filename: 'service_worker.js',
    },
  },

  output: {
  path: path.resolve(__dirname, './dist'),
  filename: 'js/[name].js',
  },

  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: [
          {
            loader: 'babel-loader',
            options: { presets: ['@babel/preset-env', '@babel/react'] },
          },
        ],
      },
      {
          test: /\.css$/,
          use: 'css-loader',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['tablist'],
      template: path.resolve(__dirname, './public/template.html'),
      filename: 'tablist/tablist.html',
      title: 'tablist',
    }),
    new HtmlWebpackPlugin({
      chunks: ['popup'],
      template: path.resolve(__dirname, './public/template.html'),
      filename: 'popup/popup.html',
      title: 'popup',
    }),
    new HtmlWebpackPlugin({
      chunks: ['options'],
      template: path.resolve(__dirname, './public/template.html'),
      filename: 'options/options.html',
      title: 'options',
    }),
    new CopyPlugin({
      patterns: [
        { from: './public/manifest.json', to: './' },
        { from: './public/icons/icon.png', to: './icons/icon.png' },
      ]
    }),
  ],

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  target: 'web',
  devtool: 'cheap-module-source-map',
  // mode: 'production',
  mode: 'development',
};
