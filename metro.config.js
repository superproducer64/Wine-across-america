const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('cjs');

config.watchFolders = [__dirname];
config.resolver.blockList = [
  new RegExp(`${path.resolve(__dirname, '.local').replace(/\\/g, '\\\\')}.*`),
];

module.exports = config;
