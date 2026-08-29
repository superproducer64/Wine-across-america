const { withAndroidManifest } = require('@expo/config-plugins');

// Android 11+ package visibility: without this, PackageManager checks for
// Instagram (used to detect whether it's installed before attempting a
// Stories share) silently report "not installed" even when it is.
module.exports = function withInstagramQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (!manifest.queries) {
      manifest.queries = [{ package: [] }];
    }
    const queries = manifest.queries[0];
    if (!queries.package) queries.package = [];
    const alreadyPresent = queries.package.some(
      (p) => p.$?.['android:name'] === 'com.instagram.android'
    );
    if (!alreadyPresent) {
      queries.package.push({ $: { 'android:name': 'com.instagram.android' } });
    }
    return config;
  });
};
