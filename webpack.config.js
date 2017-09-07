'use strict'

const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')

module.exports = {
  devtool: 'source-map',
  entry: path.join(__dirname, 'src', 'js', 'index'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]-[hash].js',
    publicPath: ''
  },
  plugins: [
    new CleanPlugin(['dist']),
    // new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin('[name]-[hash].css'),
    new HtmlPlugin({
      title: 'Beer Delivery',
      template: path.join(__dirname, 'src', 'html', 'template.html')
    })
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        include: /src/,
        use: [{ loader: 'standard-loader' }]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: /src/,
        use: [{ loader: 'babel-loader' }]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        include: /src/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        exclude: /node_modules/,
        include: /src/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {}
        }],
      }
    ]
  },
  resolve: {
    alias: {
      src: path.join(__dirname, 'src')
    }
  }
}
