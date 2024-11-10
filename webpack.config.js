const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      stream: require.resolve('stream-browserify'),
      querystring: require.resolve('querystring-es3'),
      crypto: require.resolve('crypto-browserify'),
      url: require.resolve('url/'),
      assert: require.resolve('assert/'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      zlib: require.resolve('browserify-zlib'),
      util: require.resolve('util/'),
      process: require.resolve('process/browser'),
      fs: false, // Ignorar fs ya que no es compatible con el navegador.
      net: false,
      tls: false,
      child_process: false,
      http2: false,
    },
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^fs$/,
    }),
  ],
};
