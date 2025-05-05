// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add this line to fix Firebase auth issues with Expo SDK 53
defaultConfig.resolver.unstable_enablePackageExports = false;

// Add cjs support if needed
defaultConfig.resolver.sourceExts.push('cjs');

module.exports = defaultConfig;