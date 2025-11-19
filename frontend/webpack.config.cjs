const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/main.jsx', 
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : 'bundle.js',
      publicPath: '/',
      clean: true,  
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html', 
        filename: 'index.html',
        // Для production убираем dev инструменты
        ...(isProduction && { minify: { removeComments: true, collapseWhitespace: true } })
      }),
    ],
    // devServer только для разработки
    ...(argv.mode !== 'production' && {
      devServer: {
        static: {
          directory: path.join(__dirname, 'dist'), 
        },
        compress: true,
        port: 3000,
        open: true, 
        hot: true,
        historyApiFallback: true, 
        proxy: [{
          context: ['/api'],
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false, 
        }],
      }
    }),
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    devtool: isProduction ? false : 'source-map',

    // Оптимизация для production
    ...(isProduction && {
      optimization: {
        splitChunks: {
          chunks: 'all',
        },
        minimize: true,
      },
    }),
  };
};
