import { registerRootComponent } from 'expo';
import { enableScreens } from 'react-native-screens';
import App from './App';

// Required by react-native-screens — must be called before any navigator renders.
enableScreens();

registerRootComponent(App);
