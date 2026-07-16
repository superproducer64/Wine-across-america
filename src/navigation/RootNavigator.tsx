import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Linking, View } from 'react-native';
import { supabase, setRecoverySession } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { usePasswordRecoveryStore } from '@/stores/passwordRecoveryStore';
import { parseRecoveryParamsFromUrl } from '@/lib/deepLink';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { RootStackParamList } from './types';
import { Colors } from '@/theme';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const Root = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { session, loading, setSession } = useAuthStore();
  const { active: recoveryActive, error: recoveryError, start: startRecovery } = usePasswordRecoveryStore();
  usePushNotifications();
  const { checkSubscription } = useSubscriptionStore();

  useEffect(() => {
    // Bootstrap auth session from stored token
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkSubscription(session.user.id);
      }
    }).catch((err) => {
      console.error('[RootNavigator] getSession failed:', err);
      setSession(null);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          checkSubscription(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Password-recovery deep links (pouracrossamerica://reset-password) land here
    // with tokens in the URL hash. detectSessionInUrl is off for the Supabase
    // client, so we parse and apply the session manually, then gate the app
    // into NewPasswordScreen via passwordRecoveryStore regardless of session.
    const handleUrl = async (url: string | null) => {
      if (!url) return;
      const parsed = parseRecoveryParamsFromUrl(url);
      if (!parsed) return;

      if (parsed.kind === 'error') {
        startRecovery(parsed.message);
        return;
      }

      startRecovery(null);
      const { error } = await setRecoverySession(parsed.accessToken, parsed.refreshToken);
      if (error) {
        startRecovery(error);
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, [startRecovery]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.ink, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {recoveryActive || !session ? (
          <Root.Screen name="Auth">
            {() => (
              <AuthNavigator
                initialRouteName={recoveryActive ? 'NewPassword' : 'Login'}
                newPasswordParams={recoveryActive && recoveryError ? { error: recoveryError } : undefined}
              />
            )}
          </Root.Screen>
        ) : (
          <Root.Screen name="Main" component={MainNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
