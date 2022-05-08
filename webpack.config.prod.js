const TerserPlugin = require("terser-webpack-plugin")
const path = require('path');

const common = require('./webpack.config.js');

common.optimization = {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          pure_funcs: [
              'console.debug',
              'console.info',
              'console.log'
          ], // drops sideffects of these
        },
      },
    }),
  ],
};
common.mode = 'production';
common.output.path = path.resolve(__dirname, './release')

module.exports = common
