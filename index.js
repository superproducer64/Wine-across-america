// DIAGNOSTIC BUILD — tests each major module in isolation to find the crash.
(function () {
  var Alert = require('react-native').Alert;

  function showError(label, err) {
    Alert.alert(
      'FAILED: ' + label,
      String(err.name) + ': ' + String(err.message) + '\n\n' + String(err.stack || '').slice(0, 600),
      [{ text: 'OK' }],
      { cancelable: false }
    );
  }

  var failed = false;

  function tryLoad(label, fn) {
    if (failed) return;
    try { fn(); }
    catch (e) { failed = true; showError(label, e); }
  }

  tryLoad('react-native-screens', function () {
    require('react-native-screens').enableScreens();
  });
  tryLoad('expo-splash-screen', function () {
    require('expo-splash-screen');
  });
  tryLoad('expo-google-fonts/playfair', function () {
    require('@expo-google-fonts/playfair-display');
  });
  tryLoad('expo-google-fonts/dm-sans', function () {
    require('@expo-google-fonts/dm-sans');
  });
  tryLoad('react-native-gesture-handler', function () {
    require('react-native-gesture-handler');
  });
  tryLoad('react-native-url-polyfill', function () {
    require('react-native-url-polyfill/auto');
  });
  tryLoad('@supabase/supabase-js', function () {
    require('@supabase/supabase-js');
  });
  tryLoad('src/lib/supabase', function () {
    require('./src/lib/supabase');
  });
  tryLoad('expo-notifications', function () {
    require('expo-notifications');
  });
  tryLoad('authStore', function () {
    require('./src/stores/authStore');
  });
  tryLoad('wineStore', function () {
    require('./src/stores/wineStore');
  });
  tryLoad('entryDraftStore', function () {
    require('./src/stores/entryDraftStore');
  });
  tryLoad('subscriptionStore', function () {
    require('./src/stores/subscriptionStore');
  });
  tryLoad('RootNavigator', function () {
    require('./src/navigation/RootNavigator');
  });
  tryLoad('App.tsx', function () {
    require('./App');
  });

  if (failed) return;

  // All modules loaded OK — boot normally
  var enableScreens = require('react-native-screens').enableScreens;
  enableScreens();
  var registerRootComponent = require('expo').registerRootComponent;
  var App = require('./App').default;
  registerRootComponent(App);
})();
