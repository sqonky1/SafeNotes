const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  util: require.resolve('util/'),
  buffer: require.resolve('buffer/'),
  ws: false, // this disables ws
};

module.exports = config;
