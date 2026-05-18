// Use require() instead of import so we control execution order.
// The error handler MUST be registered before App and its dependencies load,
// otherwise module-init crashes are swallowed silently.

// 1. Set up global error handler first — before anything else loads.
const { Alert } = require('react-native');
const prevHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  if (isFatal) {
    Alert.alert(
      'PAA Startup Error — screenshot this',
      `${error.name}: ${error.message}\n\n${(error.stack || '').slice(0, 800)}`,
      [{ text: 'OK' }],
      { cancelable: false }
    );
  }
  if (prevHandler) prevHandler(error, isFatal);
});

// 2. Enable native screens.
const { enableScreens } = require('react-native-screens');
enableScreens();

// 3. Load App — any module-level throw will now be caught above.
let App;
try {
  App = require('./App').default;
} catch (e) {
  Alert.alert(
    'PAA Module Load Error — screenshot this',
    `${e.name}: ${e.message}\n\n${(e.stack || '').slice(0, 800)}`,
    [{ text: 'OK' }],
    { cancelable: false }
  );
  // Render a blank fallback so the app doesn't silently close.
  const { View, Text } = require('react-native');
  const React = require('react');
  App = () => React.createElement(View,
    { style: { flex: 1, backgroundColor: '#1F1518', alignItems: 'center', justifyContent: 'center', padding: 24 } },
    React.createElement(Text, { style: { color: '#C4847A', fontSize: 16, textAlign: 'center' } },
      `Load error: ${e.message}`
    )
  );
}

// 4. Register root component.
const { registerRootComponent } = require('expo');
registerRootComponent(App);
