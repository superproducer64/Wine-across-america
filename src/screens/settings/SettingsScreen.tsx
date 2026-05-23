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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { MainStackParamList } from '@/navigation/types';

export function SettingsScreen() {
  const { user, profile, signOut } = useAuthStore();
  const { isSubscribed } = useSubscriptionStore();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again to access your cheeses.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Account</Text>

        {/* Profile card */}
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

        {/* Subscription card */}
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
                Unlimited entries • Taste fingerprint • Score vs. price{'\n'}
                Advanced search • Creator database • Monthly picks
              </Text>
              <Button
                label="Upgrade — $9.99/mo"
                onPress={() => navigation.navigate('Paywall')}
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

        {/* Free tier details for non-pro */}
        {!isSubscribed && (
          <View style={styles.freeDetails}>
            <Text style={styles.freeDetailsTitle}>Free tier includes:</Text>
            {[
              'Up to 30 cheese entries',
              'Full cheese details (style, milk type, region)',
              'Basic search (keyword + style filter)',
              'Technical score radar & terroir',
              'Date and price tracking',
            ].map((item) => (
              <View key={item} style={styles.freeItem}>
                <Text style={styles.freeItemDot}>·</Text>
                <Text style={styles.freeItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Creator section */}
        {profile?.is_creator && (
          <View style={styles.creatorSection}>
            <Text style={styles.sectionLabel}>Creator Studio</Text>
            <Pressable
              style={styles.creatorCard}
              onPress={() => navigation.navigate('CreatorDashboard')}
            >
              <View style={styles.creatorCardLeft}>
                <Text style={styles.creatorCardTitle}>Signature Scores</Text>
                <Text style={styles.creatorCardSub}>
                  Manage creator scores, curated lists, and monthly picks
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>
        )}

        {/* App info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>App Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Version</Text>
            <Text style={styles.infoVal}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>App</Text>
            <Text style={styles.infoVal}>Cheese Across America</Text>
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
  upgradeBlock: { gap: Spacing.sm },
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
  upgradeBtn: { width: '100%' },
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
  sectionLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 8,
  },
  creatorSection: { gap: 4 },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    gap: Spacing.md,
  },
  creatorCardLeft: { flex: 1, gap: 3 },
  creatorCardTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 16,
    color: Colors.ink,
  },
  creatorCardSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
  },
  chevron: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 22,
    color: Colors.gold,
  },
  infoSection: { gap: Spacing.sm },
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
  signOutBtn: { marginTop: Spacing.md },
});
