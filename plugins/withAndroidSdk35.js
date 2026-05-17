const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withAndroidSdk35(config) {
  return withGradleProperties(config, (config) => {
    const existing = config.modResults.find(
      (item) => item.key === 'android.suppressUnsupportedCompileSdk'
    );
    if (!existing) {
      config.modResults.push({
        type: 'property',
        key: 'android.suppressUnsupportedCompileSdk',
        value: '35',
      });
    }
    return config;
  });
};
