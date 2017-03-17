import webpack from "webpack";

let getEntrySources = (sources) => {
  if ( process.env.NODE_ENV === 'development' ) {
    sources.push('webpack-dev-server/client?http://localhost:8080');
  }
  return sources;
}

module.exports = {
  entry: getEntrySources(["./src/js/run.js"]),
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "babel-loader"
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ]
};