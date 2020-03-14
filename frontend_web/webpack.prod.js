const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const { PromiseTask } = require('event-hooks-webpack-plugin/lib/tasks');
const fs = require('fs');

module.exports = merge(common, {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ],
    },
    plugins: [
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
});