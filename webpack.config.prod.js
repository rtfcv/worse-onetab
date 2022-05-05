const TerserPlugin = require("terser-webpack-plugin")

const common = require('./webpack.config.js');

common.optimization = {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          pure_funcs: ['console.info','console.log'], // drops sideffects of these
        },
      },
    }),
  ],
};
common.mode = 'production';

module.exports = common
