const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyPlugin = require('copy-webpack-plugin');
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const { PromiseTask } = require('event-hooks-webpack-plugin/lib/tasks');
const fs = require('fs');
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
        new CopyPlugin([
            {from: 'static', to: ''},
        ]),
        new EventHooksPlugin({
            done: new PromiseTask(async () => {
                fs.copyFile('../backend_rest/web/static/index.html', '../backend_rest/web/templates/web/index.html', (err) => {
                    if (err) throw err;
                    console.log('File was copied successfully');
                });
            })
        })
    ],
    output: {
        filename: 'static/[name].bundle.js',
        path: path.resolve(__dirname, '../backend_rest/web/static'),
    },
};