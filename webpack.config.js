const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'frontend/index.js'),
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
      { 
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
            plugins: [
              ['@babel/plugin-proposal-class-properties']
          ]
          }
        }
      }
    ]
  },
  devServer: {
    port: 3000,
    historyApiFallback: true
  }
};