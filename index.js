// DIAGNOSTIC BUILD — identifies which module causes the startup crash.
// All top-level returns must be inside an IIFE (Babel rejects bare top-level return).
(function () {
  var React = require('react');
  var RN = require('react-native');
  var registerRootComponent = require('expo').registerRootComponent;

  function ErrorScreen(props) {
    return React.createElement(
      RN.ScrollView,
      {
        style: { flex: 1, backgroundColor: '#1F1518', padding: 24 },
        contentContainerStyle: { paddingTop: 60 },
      },
      React.createElement(RN.Text, {
        style: { color: '#C4847A', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
      }, 'FAILED MODULE — screenshot this'),
      React.createElement(RN.Text, {
        style: { color: '#fff', fontSize: 14, marginBottom: 12 },
      }, props.label),
      React.createElement(RN.Text, {
        style: { color: '#f88', fontSize: 13, marginBottom: 12 },
      }, props.errorName + ': ' + props.errorMessage),
      React.createElement(RN.Text, {
        style: { color: '#aaa', fontSize: 10 },
      }, props.stack)
    );
  }

  function makeErrorApp(label, err) {
    var name = String(err && err.name ? err.name : 'Error');
    var msg  = String(err && err.message ? err.message : String(err));
    var stk  = String(err && err.stack ? err.stack : '').slice(0, 800);
    return function DiagApp() {
      return React.createElement(ErrorScreen, {
        label: label, errorName: name, errorMessage: msg, stack: stk,
      });
    };
  }

  function tryLoad(label, fn) {
    try { fn(); return true; }
    catch (e) {
      registerRootComponent(makeErrorApp(label, e));
      return false;
    }
  }

  // ── Test each module ────────────────────────────────────────────────────────

  if (!tryLoad('1. react-native-screens', function () {
    require('react-native-screens').enableScreens();
  })) return;

  if (!tryLoad('2. expo-splash-screen', function () {
    require('expo-splash-screen');
  })) return;

  if (!tryLoad('3. @expo-google-fonts/playfair-display', function () {
    require('@expo-google-fonts/playfair-display');
  })) return;

  if (!tryLoad('4. @expo-google-fonts/dm-sans', function () {
    require('@expo-google-fonts/dm-sans');
  })) return;

  if (!tryLoad('5. react-native-gesture-handler', function () {
    require('react-native-gesture-handler');
  })) return;

  if (!tryLoad('6. react-native-url-polyfill/auto', function () {
    require('react-native-url-polyfill/auto');
  })) return;

  if (!tryLoad('7. @supabase/supabase-js', function () {
    require('@supabase/supabase-js');
  })) return;

  if (!tryLoad('8. src/lib/supabase (client init)', function () {
    require('./src/lib/supabase');
  })) return;

  if (!tryLoad('9. expo-notifications', function () {
    require('expo-notifications');
  })) return;

  if (!tryLoad('10. src/stores/authStore', function () {
    require('./src/stores/authStore');
  })) return;

  if (!tryLoad('11. src/stores/wineStore', function () {
    require('./src/stores/wineStore');
  })) return;

  if (!tryLoad('12. src/stores/subscriptionStore', function () {
    require('./src/stores/subscriptionStore');
  })) return;

  if (!tryLoad('13. src/stores/entryDraftStore', function () {
    require('./src/stores/entryDraftStore');
  })) return;

  if (!tryLoad('14. src/navigation/RootNavigator', function () {
    require('./src/navigation/RootNavigator');
  })) return;

  if (!tryLoad('15. App.tsx (full)', function () {
    require('./App');
  })) return;

  // ── All modules OK — boot normally ─────────────────────────────────────────
  var App = require('./App').default;
  registerRootComponent(App);
}());
