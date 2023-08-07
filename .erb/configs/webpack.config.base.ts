/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../../release/app/package.json';

const configuration: webpack.Configuration = {
    externals: [...Object.keys(externals || {})],

    stats: 'errors-only',

    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        // Remove this line to enable type checking in webpack builds
                        transpileOnly: true,
                        compilerOptions: {
                            module: 'esnext',
                        },
                    },
                },
            },
        ],
    },

    output: {
        path: webpackPaths.srcPath,
        // https://github.com/webpack/webpack/issues/1114
        library: {
            type: 'commonjs2',
        },
    },

    /**
     * Determine the array of extensions that should be used to resolve modules.
     */
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
        modules: [webpackPaths.srcPath, 'node_modules'],
        fallback: {
            fs: false,
            tls: false,
            net: false,
            path: false,
            zlib: false,
            http: false,
            https: false,
            stream: false,
            crypto: false,
            assert: false,
            util: false,
            os: false,
            vm: false,
            // url: require.resolve("url"),
            // path: require.resolve("path-browserify"),
            buffer: require.resolve('buffer'),
            // process: require.resolve("process/browser")
        },
    },

    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
};

export default configuration;
