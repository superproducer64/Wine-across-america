import { registerRootComponent } from 'expo';
import { enableScreens } from 'react-native-screens';
import { Alert } from 'react-native';
import App from './App';

// Required by react-native-screens — must be called before any navigator renders.
enableScreens();

// Catch ALL uncaught JS errors before React mounts (module-init crashes, etc.)
// This fires even when the ErrorBoundary in App.tsx hasn't rendered yet.
// Shows a native Alert so the error is visible even in release builds.
const prevHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  if (isFatal) {
    Alert.alert(
      'PAA Crash — screenshot this',
      `${error.name}: ${error.message}\n\n${(error.stack || '').slice(0, 600)}`,
      [{ text: 'OK' }],
      { cancelable: false }
    );
  }
  if (prevHandler) prevHandler(error, isFatal);
});

registerRootComponent(App);
