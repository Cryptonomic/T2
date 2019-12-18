/**
 * Base webpack config used across other specific configs
 */

const path = require('path');
const webpack = require('webpack');
const externals = require('../src/package.json').dependencies;

module.exports = {
  externals: [...Object.keys(externals || {})],

  module: {
    rules: [
      {
        test: /\.ts[x]?$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      }
    ]
  },

  output: {
    path: path.join(__dirname, '..', 'src'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
    modules: [path.join(__dirname, '..', 'src'), 'node_modules']
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),

    new webpack.NamedModulesPlugin()
  ]
};
