var path = require('path');
var webpack = require('webpack');

module.exports = {
  mode: "none",
  entry: {
    "physiomeportal": "./src/index.js"
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: "[name].js",
    library: 'physiomeportal',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  module: {
    rules: [
      { test: /\.(html)$/, use: [{ loader: 'html-loader' }]},
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
      { test: /\.(jpe?g|gif)$/i,
        loader:"file-loader",
        query:{
          name:'[name].[ext]',
          outputPath:'images/' }
      },
      { test: /\.(vs|fs)$/i,
        loaders: [
          'raw-loader'
        ]
      },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
      {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
              presets: ['@babel/preset-env',
            	  ['minify',  {
            		  builtIns: false,
            		  evaluate: false,
            		  mangle: false,
            	   }]]
          }
      }
      
//      {
//        test: /node_modules/,
//        loader: 'ify-loader'
//      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      "window.$": "jquery"
    })
  ],
  devtool: 'source-map'
};
