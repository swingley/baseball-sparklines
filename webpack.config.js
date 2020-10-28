var webpack = require('webpack')

module.exports = {
  entry: './src/js/run.js',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.html$/,
      use: 'raw-loader'
    }]
  }
}
