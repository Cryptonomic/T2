const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  target: 'electron-main',
  mode: 'development',
  entry: path.join(__dirname, '../src/main.dev.js'),

  output: {
    path: path.join(__dirname, '..'),
    filename: './src/main.prod.js'
  },

  plugins: [
    new webpack.EnvironmentPlugin({
//      NODE_ENV: 'production',
//      NAME: 'production',
    }),
  ],

  // externals: {
  //   packageName: [
  //     'window',
  //     'global',
  //   ],
  // },

  node: {
    __dirname: false,
    __filename: false,
  },
};
