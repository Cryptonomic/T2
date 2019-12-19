'use strict';

const path = require('path');

module.exports = {
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    externals: {
        "usb": 'commonjs usb',
        "node-hid": "commonjs node-hid"
    },
    node: {
        __dirname: false,
        __filename: false
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
    },
    // devtool: 'source-map',
    devtool: 'inline-source-map',
    plugins: [
    ]
};
