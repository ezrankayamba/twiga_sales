const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
module.exports = {
    optimization: {
        minimize: true
    },
    entry: {
        app: './src/index.js',
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Production',
            template: "index.html",
            filename: "index.html",
            inject: 'body'
        }),
        new webpack.DefinePlugin({ // <-- key to reducing React's size
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.AggressiveMergingPlugin(),//Merge chunks
    ],
    output: {
        filename: 'static/[name].bundle.js',
        path: path.resolve(__dirname, '../backend_rest/web/static'),
    },
};