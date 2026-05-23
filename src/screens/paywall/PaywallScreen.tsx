import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { MainStackParamList } from '@/navigation/types';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

type Props = NativeStackScreenProps<MainStackParamList, 'Paywall'>;

const FREE_FEATURES = [
  'Up to 30 cheese entries',
  'Technical score (5 categories)',
  'Structure radar chart',
  'Basic search by name & style',
  'Tasting notes & terroir',
];

const PRO_FEATURES = [
  'Unlimited cheese entries',
  'Full analytics dashboard',
  'Taste fingerprint & trends',
  'Advanced search with all filters',
  'Creator Signature Score database',
  'Monthly curated cheese picks',
  'Score vs. price analysis',
];

export function PaywallScreen({ navigation }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const { purchaseSubscription, restorePurchases, isSubscribed } = useSubscriptionStore();

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await purchaseSubscription(plan);
      Alert.alert(
        'Welcome to Pro! 🧀',
        'Your Intelligence subscription is now active. Enjoy unlimited access.',
        [{ text: 'Let\'s Go', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert(
        'Purchase unavailable',
        'Subscription purchase requires the app to be installed via the App Store. Install react-native-purchases to enable in-app purchases.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      await restorePurchases();
      if (isSubscribed) {
        Alert.alert('Restored!', 'Your Pro subscription has been restored.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Nothing to restore', 'No active subscription found for this Apple ID.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Close */}
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>INTELLIGENCE</Text>
          <Text style={styles.title}>Unlock the full{'\n'}cheese journal</Text>
          <Text style={styles.subtitle}>
            Everything in Free, plus unlimited entries, advanced analytics, and creator picks.
          </Text>
        </View>

        {/* Plan toggle */}
        <View style={styles.planToggle}>
          <Pressable
            style={[styles.planOption, plan === 'monthly' && styles.planOptionActive]}
            onPress={() => setPlan('monthly')}
          >
            <Text style={[styles.planLabel, plan === 'monthly' && styles.planLabelActive]}>
              Monthly
            </Text>
            <Text style={[styles.planPrice, plan === 'monthly' && styles.planPriceActive]}>
              $9.99/mo
            </Text>
          </Pressable>

          <Pressable
            style={[styles.planOption, plan === 'annual' && styles.planOptionActive]}
            onPress={() => setPlan('annual')}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>SAVE 34%</Text>
            </View>
            <Text style={[styles.planLabel, plan === 'annual' && styles.planLabelActive]}>
              Annual
            </Text>
            <Text style={[styles.planPrice, plan === 'annual' && styles.planPriceActive]}>
              $79/yr
            </Text>
            <Text style={[styles.planSub, plan === 'annual' && styles.planSubActive]}>
              $6.58/mo
            </Text>
          </Pressable>
        </View>

        {/* CTA */}
        <Pressable
          style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
          onPress={handlePurchase}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.ink} />
          ) : (
            <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
          )}
        </Pressable>
        <Text style={styles.ctaNote}>
          Then {plan === 'monthly' ? '$9.99/month' : '$79/year'}. Cancel anytime.
        </Text>

        {/* Feature comparison */}
        <View style={styles.comparison}>
          <View style={styles.comparisonCol}>
            <Text style={styles.colHeader}>Free</Text>
            {FREE_FEATURES.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.comparisonCol, styles.comparisonColPro]}>
            <Text style={[styles.colHeader, styles.colHeaderPro]}>Intelligence</Text>
            {PRO_FEATURES.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Text style={styles.featureCheckPro}>✦</Text>
                <Text style={[styles.featureText, styles.featureTextPro]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Restore */}
        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </Pressable>

        <Text style={styles.legal}>
          Subscriptions auto-renew unless cancelled 24h before period end.
          Manage in App Store Settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.ink },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: Spacing.xl,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.gold,
    borderWidth: 0.5,
    borderColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 28,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 21,
  },
  planToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  planOption: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    gap: 2,
    minHeight: 90,
    justifyContent: 'center',
  },
  planOptionActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  planLabel: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  planLabelActive: {
    color: Colors.gold,
  },
  planPrice: {
    fontFamily: Fonts.playfair,
    fontSize: 20,
    color: 'rgba(255,255,255,0.5)',
  },
  planPriceActive: {
    color: Colors.white,
  },
  planSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
  },
  planSubActive: {
    color: 'rgba(255,255,255,0.5)',
  },
  saveBadge: {
    backgroundColor: Colors.green,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  saveText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 9,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  ctaBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaBtnDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 17,
    color: Colors.ink,
    letterSpacing: 0.2,
  },
  ctaNote: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    marginTop: -Spacing.md,
  },
  comparison: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  comparisonCol: {
    flex: 1,
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  comparisonColPro: {
    borderColor: 'rgba(201,168,76,0.3)',
    backgroundColor: 'rgba(201,168,76,0.04)',
  },
  colHeader: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 4,
  },
  colHeaderPro: {
    color: Colors.gold,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  featureCheck: {
    color: Colors.green,
    fontSize: 12,
    lineHeight: 18,
  },
  featureCheckPro: {
    color: Colors.gold,
    fontSize: 10,
    lineHeight: 18,
  },
  featureText: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    flex: 1,
    lineHeight: 17,
  },
  featureTextPro: {
    color: 'rgba(255,255,255,0.7)',
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  restoreText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },
  legal: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: 'rgba(255,255,255,0.15)',
    textAlign: 'center',
    lineHeight: 15,
  },
});
