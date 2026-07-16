import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { SignupScreen } from '@/screens/auth/SignupScreen';
import { ResetRequestScreen } from '@/screens/auth/ResetRequestScreen';
import { NewPasswordScreen } from '@/screens/auth/NewPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  initialRouteName?: keyof AuthStackParamList;
  newPasswordParams?: AuthStackParamList['NewPassword'];
}

export function AuthNavigator({ initialRouteName = 'Login', newPasswordParams }: AuthNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ResetRequest" component={ResetRequestScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} initialParams={newPasswordParams} />
    </Stack.Navigator>
  );
}
