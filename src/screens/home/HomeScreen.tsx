import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { useCheeseStore } from '@/stores/cheeseStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { CheeseListItem } from '@/components/cheese/CheeseListItem';
import { MainStackParamList, TabParamList } from '@/navigation/types';
import { CheeseEntry, CHEESE_STYLE_LABELS } from '@/types';

type HomeNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<MainStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user, profile } = useAuthStore();
  const { entries, loading, loadEntries } = useCheeseStore();
  const { isSubscribed } = useSubscriptionStore();

  useEffect(() => {
    if (user) loadEntries(user.id, isSubscribed);
  }, [user, isSubscribed]);

  const firstName = profile?.display_name?.split(' ')[0] ?? 'there';

  const topStyle = (() => {
    if (!entries.length) return null;
    const counts: Record<string, number> = {};
    entries.forEach((e) => { counts[e.style] = (counts[e.style] ?? 0) + 1; });
    const key = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0];
    return key ? CHEESE_STYLE_LABELS[key as keyof typeof CHEESE_STYLE_LABELS] : null;
  })();

  const topRegion = (() => {
    if (!entries.length) return null;
    const counts: Record<string, number> = {};
    entries.forEach((e) => { if (e.region) counts[e.region] = (counts[e.region] ?? 0) + 1; });
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
  })();

  const recentEntries = entries.slice(0, 10);

  const handleCheesePress = (entry: CheeseEntry) => {
    navigation.navigate('CheeseDetail', { entryId: entry.id });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Pressable onPress={() => navigation.navigate('Settings' as never)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {firstName[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
            </Pressable>
          </View>
          <Text style={styles.tagline}>Your artisan cheese journal</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{entries.length}</Text>
            <Text style={styles.statLabel}>Cheeses Logged</Text>
            {!isSubscribed && entries.length >= 30 && (
              <Text style={styles.freeLimitHint}>Free limit reached</Text>
            )}
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue} numberOfLines={1}>
              {topStyle ?? '—'}
            </Text>
            <Text style={styles.statLabel}>Top Style</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue} numberOfLines={1}>
              {topRegion ?? '—'}
            </Text>
            <Text style={styles.statLabel}>Top Region</Text>
          </View>
        </View>

        {/* Pro upsell */}
        {!isSubscribed && (
          <Pressable style={styles.upsellCard} onPress={() => navigation.navigate('Settings' as never)}>
            <View style={styles.upsellText}>
              <Text style={styles.upsellTitle}>Unlock Cheese Intelligence</Text>
              <Text style={styles.upsellBody}>
                Taste fingerprint, style radar, score-vs-price charts, and more.
              </Text>
            </View>
            <View style={styles.upsellBadge}>
              <Text style={styles.upsellBadgeText}>PRO</Text>
            </View>
          </Pressable>
        )}

        {/* Recent cheeses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Cheeses</Text>
          <Pressable onPress={() => navigation.navigate('Search' as never)}>
            <Text style={styles.viewAll}>View all →</Text>
          </Pressable>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading your cheeses…</Text>
        ) : recentEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🧀</Text>
            <Text style={styles.emptyTitle}>Your journal is empty</Text>
            <Text style={styles.emptyBody}>
              Tap the + button to log your first cheese
            </Text>
          </View>
        ) : (
          recentEntries.map((entry) => (
            <CheeseListItem key={entry.id} entry={entry} onPress={handleCheesePress} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge },
  header: { marginBottom: Spacing.xl },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontFamily: Fonts.playfair,
    fontSize: 24,
    color: Colors.ink,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.playfair,
    fontSize: 16,
    color: Colors.ink,
  },
  tagline: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.gold,
    lineHeight: 24,
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
  freeLimitHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 9,
    color: Colors.red,
    marginTop: 2,
    textAlign: 'center',
  },
  upsellCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  upsellText: { flex: 1, marginRight: Spacing.md },
  upsellTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 16,
    color: Colors.gold,
    marginBottom: 3,
  },
  upsellBody: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 17,
  },
  upsellBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.gold,
  },
  upsellBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.ink,
  },
  viewAll: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.gold,
  },
  loadingText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
    gap: Spacing.sm,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.ink,
  },
  emptyBody: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
});
