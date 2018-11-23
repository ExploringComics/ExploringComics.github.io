let webpack = require('webpack');
let path = require('path');
let OpenBrowserPlugin = require('open-browser-webpack-plugin');
let ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    devServer: {
        historyApiFallback: true,
        hot: true,
        inline: true,
        progress: true,
        contentBase: './app',
        port: 8080
    },
    devtool: 'source-map',
    entry: [
        'webpack-dev-server/client?http://localhost:8080',
        path.resolve(__dirname, 'app/js/main.js')
    ],
    output: {
        path: __dirname + '/build',
        publicPath: '/',
        filename: './bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    }
};