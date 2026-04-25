import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius, Shadows } from '@/theme';
import { useResponsive, SIDEBAR_WIDTH, MAX_CONTENT_WIDTH } from '@/hooks/useResponsive';
import { useAuthStore } from '@/stores/authStore';
import { useWineStore } from '@/stores/wineStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { WineListItem } from '@/components/wine/WineListItem';
import { SkeletonWineListItem } from '@/components/wine/SkeletonWineListItem';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MainStackParamList, TabParamList } from '@/navigation/types';
import { WineEntry } from '@/types';
import { getSharedWithMe, markShareSeen } from '@/lib/supabase';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type HomeNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<MainStackParamList>
>;

interface SharedWineItem {
  id: string;
  sender_name: string;
  wine_snapshot: Record<string, unknown>;
  seen: boolean;
  created_at: string;
}

export function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user, profile } = useAuthStore();
  const { entries, loading, loadEntries } = useWineStore();
  const { isSubscribed } = useSubscriptionStore();
  const [sharedWines, setSharedWines] = useState<SharedWineItem[]>([]);

  useEffect(() => {
    if (!user) return;
    // Only fetch entries when the store is empty — avoids re-fetching
    // on every back-navigation from a detail screen.
    if (entries.length === 0) {
      loadEntries(user.id, isSubscribed);
    }
    // Shared wines are lightweight; always refresh so new shares appear.
    getSharedWithMe(user.id).then(({ data }) => {
      if (data) setSharedWines(data as SharedWineItem[]);
    });
  }, [user]);

  const handleSharedWinePress = async (item: SharedWineItem) => {
    if (!item.seen) {
      await markShareSeen(item.id);
      setSharedWines((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, seen: true } : s))
      );
    }
    navigation.navigate('SharedWineDetail', {
      snapshot: item.wine_snapshot,
      senderName: item.sender_name,
    });
  };

  const firstName = profile?.display_name?.split(' ')[0] ?? 'there';

  const avgScore = useMemo(() => {
    if (!entries.length) return 0;
    return Math.round(entries.reduce((s, e) => s + e.technical_score, 0) / entries.length);
  }, [entries]);

  const topCountry = useMemo(() => {
    if (!entries.length) return null;
    const counts: Record<string, number> = {};
    entries.forEach((e) => { counts[e.country] = (counts[e.country] ?? 0) + 1; });
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
  }, [entries]);

  const topGrape = useMemo(() => {
    if (!entries.length) return null;
    const counts: Record<string, number> = {};
    entries.forEach((e) => e.grapes.forEach((g) => { counts[g] = (counts[g] ?? 0) + 1; }));
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
  }, [entries]);

  const recentEntries = useMemo(() => entries.slice(0, 10), [entries]);

  const handleWinePress = useCallback((entry: WineEntry) => {
    navigation.navigate('WineDetail', { entryId: entry.id } as never);
  }, [navigation]);

  const { isWide } = useResponsive();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isWide && { paddingLeft: SIDEBAR_WIDTH + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
      <View style={isWide ? { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' } : undefined}>
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
          <Text style={styles.tagline}>Your wine intelligence journal</Text>
        </View>

        {/* Analytics Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{entries.length}</Text>
            <Text style={styles.statLabel}>Wines Logged</Text>
            {!isSubscribed && entries.length >= 30 && (
              <Text style={styles.freeLimitHint}>Free limit reached</Text>
            )}
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{avgScore}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{topCountry ?? '—'}</Text>
            <Text style={styles.statLabel}>Top Country</Text>
          </View>
        </View>

        {topGrape && (
          <View style={styles.grapeCard}>
            <Text style={styles.grapeEmoji}>🍇</Text>
            <View>
              <Text style={styles.grapeLabel}>Favourite Grape</Text>
              <Text style={styles.grapeName}>{topGrape}</Text>
            </View>
          </View>
        )}

        {/* Pro Upsell */}
        {!isSubscribed && (
          <Pressable style={styles.upsellCard} onPress={() => navigation.navigate('Settings')}>
            <View>
              <Text style={styles.upsellTitle}>Unlock Wine Intelligence</Text>
              <Text style={styles.upsellBody}>
                Taste fingerprint, score-vs-price charts, compound search, and more.
              </Text>
            </View>
            <View style={styles.upsellBadge}>
              <Text style={styles.upsellBadgeText}>PRO</Text>
            </View>
          </Pressable>
        )}

        {/* Shared with Me */}
        {sharedWines.length > 0 && (
          <View style={styles.sharedSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sharedTitleRow}>
                <Text style={styles.sectionTitle}>Shared with Me</Text>
                {sharedWines.some((s) => !s.seen) && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {sharedWines.filter((s) => !s.seen).length}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {sharedWines.map((item) => {
              const snap = item.wine_snapshot;
              const wineName = (snap.name as string) || 'Untitled Wine';
              const vintage = snap.vintage ? ` ${snap.vintage}` : '';
              const producer = snap.producer as string | undefined;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.sharedItem, !item.seen && styles.sharedItemUnread]}
                  onPress={() => handleSharedWinePress(item)}
                >
                  <View style={styles.sharedItemLeft}>
                    <Text style={styles.sharedWineName}>{wineName}{vintage}</Text>
                    {producer ? (
                      <Text style={styles.sharedWineProducer}>{producer}</Text>
                    ) : null}
                    <Text style={styles.sharedFrom}>from {item.sender_name}</Text>
                  </View>
                  <View style={styles.sharedItemRight}>
                    {!item.seen && <View style={styles.unreadDot} />}
                    <Text style={styles.sharedChevron}>›</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Recent Wines */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Wines</Text>
          <View style={styles.sectionActions}>
            {entries.length >= 2 && (
              <Pressable
                onPress={() => navigation.navigate('Comparison' as never)}
                style={styles.compareBtn}
              >
                <Text style={styles.compareBtnText}>Compare ⚖️</Text>
              </Pressable>
            )}
            <Pressable onPress={() => navigation.navigate('Search' as never)}>
              <Text style={styles.viewAll}>View all →</Text>
            </Pressable>
          </View>
        </View>

        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonWineListItem key={i} />
            ))}
          </>
        ) : (
          <FlatList
            key={isWide ? 'grid' : 'list'}
            data={recentEntries}
            keyExtractor={(item) => item.id}
            numColumns={isWide ? 2 : 1}
            columnWrapperStyle={isWide ? { gap: Spacing.md } : undefined}
            renderItem={({ item }) => (
              <WineListItem entry={item} onPress={handleWinePress} style={isWide ? styles.gridItem : undefined} />
            )}
            scrollEnabled={false}
            removeClippedSubviews
            initialNumToRender={8}
            maxToRenderPerBatch={5}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🍾</Text>
                <Text style={styles.emptyTitle}>Your journal is empty</Text>
                <Text style={styles.emptyBody}>
                  Tap the + button to log your first wine
                </Text>
              </View>
            }
          />
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  header: {
    marginBottom: Spacing.xl,
  },
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
    fontSize: 22,
    color: Colors.gold,
    lineHeight: 26,
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
  grapeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    marginBottom: Spacing.md,
  },
  grapeEmoji: { fontSize: 24 },
  grapeLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  grapeName: {
    fontFamily: Fonts.playfair,
    fontSize: 17,
    color: Colors.ink,
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
    maxWidth: 240,
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
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  compareBtn: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  compareBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  viewAll: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.gold,
  },
  gridItem: {
    flex: 1,
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

  // Shared with Me
  sharedSection: {
    marginBottom: Spacing.xl,
  },
  sharedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unreadBadge: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.ink,
  },
  sharedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 0.5,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  sharedItemUnread: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldPale,
  },
  sharedItemLeft: {
    flex: 1,
    gap: 2,
  },
  sharedWineName: {
    fontFamily: Fonts.playfair,
    fontSize: 15,
    color: Colors.ink,
    lineHeight: 20,
  },
  sharedWineProducer: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  sharedFrom: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.gold,
    marginTop: 2,
  },
  sharedItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  sharedChevron: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 20,
    color: Colors.inkFaint,
  },
});
