// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'firebase/auth': require.resolve('firebase/auth/dist/index.rn.cjs'),
};

module.exports = config;
