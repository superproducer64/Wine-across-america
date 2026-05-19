// DIAGNOSTIC BUILD — granular sub-steps to pinpoint the crash inside createClient().
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

  // ── Step 1-7: same as before ────────────────────────────────────────────────

  if (!tryLoad('1. react-native-screens', function () {
    require('react-native-screens').enableScreens();
  })) return;

  if (!tryLoad('2. expo-splash-screen', function () {
    require('expo-splash-screen');
  })) return;

  if (!tryLoad('3. @expo-google-fonts', function () {
    require('@expo-google-fonts/playfair-display');
    require('@expo-google-fonts/dm-sans');
  })) return;

  if (!tryLoad('4. react-native-gesture-handler', function () {
    require('react-native-gesture-handler');
  })) return;

  if (!tryLoad('5. react-native-url-polyfill', function () {
    require('react-native-url-polyfill/auto');
  })) return;

  if (!tryLoad('6. @supabase/supabase-js (import)', function () {
    require('@supabase/supabase-js');
  })) return;

  // ── NEW granular sub-steps ──────────────────────────────────────────────────

  if (!tryLoad('7a. expo-secure-store (import)', function () {
    require('expo-secure-store');
  })) return;

  if (!tryLoad('7b. expo-crypto (import)', function () {
    require('expo-crypto');
  })) return;

  if (!tryLoad('7c. createClient — no custom storage (persistSession:false)', function () {
    var createClient = require('@supabase/supabase-js').createClient;
    createClient('https://xyztest.supabase.co', 'anon-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  })) return;

  if (!tryLoad('7d. createClient — plain JS memory storage (persistSession:true)', function () {
    var createClient = require('@supabase/supabase-js').createClient;
    var mem = {};
    createClient('https://xyztest.supabase.co', 'anon-key', {
      auth: {
        storage: {
          getItem:    function (k) { return mem[k] !== undefined ? mem[k] : null; },
          setItem:    function (k, v) { mem[k] = v; },
          removeItem: function (k) { delete mem[k]; },
        },
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  })) return;

  if (!tryLoad('7e. createClient — SecureStore storage (persistSession:true)', function () {
    var createClient = require('@supabase/supabase-js').createClient;
    var SecureStore = require('expo-secure-store');
    createClient('https://xyztest.supabase.co', 'anon-key', {
      auth: {
        storage: {
          getItem:    function (k) { return SecureStore.getItemAsync(k); },
          setItem:    function (k, v) { return SecureStore.setItemAsync(k, v); },
          removeItem: function (k) { return SecureStore.deleteItemAsync(k); },
        },
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  })) return;

  if (!tryLoad('8. src/lib/supabase (full module)', function () {
    require('./src/lib/supabase');
  })) return;

  // ── Remaining modules ───────────────────────────────────────────────────────

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
