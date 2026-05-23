import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { MainStackParamList } from '@/navigation/types';

interface Props {
  children: React.ReactNode;
  feature?: string;
  upsell?: string;
}

export function ProGate({ children, feature = 'Pro Feature', upsell }: Props) {
  const { isSubscribed } = useSubscriptionStore();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  if (isSubscribed) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.lockCard}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.featureName}>{feature}</Text>
        <Text style={styles.upsellText}>
          {upsell ?? 'Upgrade to Intelligence to unlock this feature.'}
        </Text>
        <Pressable style={styles.upgradeBtn} onPress={() => navigation.navigate('Paywall')}>
          <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  lockCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 0.5,
    borderColor: 'rgba(201,168,76,0.2)',
    maxWidth: 320,
    width: '100%',
  },
  lockIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  featureName: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.gold,
    textAlign: 'center',
  },
  upsellText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 20,
  },
  upgradeBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  upgradeBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
});
