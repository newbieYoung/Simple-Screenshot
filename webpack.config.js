/* global module __dirname */
module.exports = {
  entry: {
    'index-web.min': './index-web.js',
    'index-qq.min': './index-qq.js',
    'index-wechat.min': './index-wechat.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/build',
    library: {
      root: 'SimpleScreenshot',
      commonjs: 'simplescreenshot',
      amd: 'simplescreenshot'
    },
    libraryTarget: 'umd'
  },
  devtool: '#source-map',
  watch: true
};