const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
module.exports = {
    entry: ["@babel/polyfill", './index.mjs'],
    target: 'node',
    node: {
        __filename: true,
        __dirname: true
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.mjs?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            babelrc: true,
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
    output: { path: path.join(__dirname, 'dist'), filename: 'server.js' }
};