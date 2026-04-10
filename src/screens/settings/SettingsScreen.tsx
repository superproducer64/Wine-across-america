import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

export function SettingsScreen() {
  const { user, profile, signOut } = useAuthStore();
  const { isSubscribed } = useSubscriptionStore();

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again to access your wines.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Pro',
      'Pour Across America Pro — $9.99/month or $79/year.\n\nUnlock: full history, taste fingerprint, score-vs-price chart, compound search, creator database, and more.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: () => {
            // TODO: integrate RevenueCat purchase flow
            Alert.alert('Coming soon', 'Subscription purchase will be enabled after App Store review.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Account</Text>

        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.display_name ?? user?.email ?? '?')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            {profile?.display_name ? (
              <Text style={styles.displayName}>{profile.display_name}</Text>
            ) : null}
            <Text style={styles.email}>{user?.email ?? '—'}</Text>
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.subsCard}>
          <View style={styles.subsHeader}>
            <View>
              <Text style={styles.subsLabel}>Current Plan</Text>
              <Text style={styles.subsTier}>
                {isSubscribed ? '✨ Intelligence (Pro)' : '📓 Notebook (Free)'}
              </Text>
            </View>
            {isSubscribed && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>

          {!isSubscribed && (
            <View style={styles.upgradeBlock}>
              <Text style={styles.upgradeTitle}>Upgrade to Intelligence</Text>
              <Text style={styles.upgradeDesc}>
                Full history • Taste fingerprint • Score vs. price chart{'\n'}
                Compound search • Creator database • Recommendations
              </Text>
              <Button
                label="Upgrade — $9.99/mo"
                onPress={handleUpgrade}
                style={styles.upgradeBtn}
                size="md"
              />
              <Text style={styles.upgradeAlt}>or $79/year (save 34%)</Text>
            </View>
          )}

          {isSubscribed && (
            <Pressable onPress={() => Alert.alert('Restore', 'Checking your purchases…')}>
              <Text style={styles.restoreText}>Restore purchase</Text>
            </Pressable>
          )}
        </View>

        {/* Free tier details */}
        {!isSubscribed && (
          <View style={styles.freeDetails}>
            <Text style={styles.freeDetailsTitle}>Free tier includes:</Text>
            {[
              'Unlimited wine entries',
              'Full scoring (Structure Wheel + Technical Score)',
              'Aroma wheel input',
              'Basic search (keyword + 3 filters)',
              'Last 30 wines browsable',
              'Basic analytics',
              'One shareable tasting card',
            ].map((item) => (
              <View key={item} style={styles.freeItem}>
                <Text style={styles.freeItemDot}>·</Text>
                <Text style={styles.freeItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* App info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>App Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Version</Text>
            <Text style={styles.infoVal}>1.0.0</Text>
          </View>
        </View>

        {/* Sign out */}
        <Button
          label="Sign Out"
          onPress={handleSignOut}
          variant="secondary"
          style={styles.signOutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 28,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.playfair,
    fontSize: 20,
    color: Colors.ink,
  },
  profileInfo: { flex: 1, gap: 2 },
  displayName: {
    fontFamily: Fonts.playfair,
    fontSize: 17,
    color: Colors.ink,
  },
  email: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  subsCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    gap: Spacing.lg,
  },
  subsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subsLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 3,
  },
  subsTier: {
    fontFamily: Fonts.playfair,
    fontSize: 17,
    color: Colors.gold,
  },
  proBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.gold,
  },
  proBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  upgradeBlock: {
    gap: Spacing.sm,
  },
  upgradeTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 16,
    color: Colors.white,
  },
  upgradeDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 18,
  },
  upgradeBtn: {
    width: '100%',
  },
  upgradeAlt: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  restoreText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.gold,
    textAlign: 'center',
  },
  freeDetails: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: 6,
  },
  freeDetailsTitle: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.inkMid,
    marginBottom: 4,
  },
  freeItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  freeItemDot: {
    color: Colors.gold,
    fontSize: 16,
    lineHeight: 20,
  },
  freeItemText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    flex: 1,
    lineHeight: 20,
  },
  infoSection: {
    gap: Spacing.sm,
  },
  infoSectionTitle: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  infoKey: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMid,
  },
  infoVal: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  signOutBtn: {
    marginTop: Spacing.md,
  },
});
