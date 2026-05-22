import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { TextInput } from '@/components/ui/TextInput';
import { CheeseListItem } from '@/components/cheese/CheeseListItem';
import { useAuthStore } from '@/stores/authStore';
import { useCheeseStore } from '@/stores/cheeseStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { CheeseEntry, CHEESE_STYLE_LABELS, CheeseStyle } from '@/types';
import { MainStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<MainStackParamList>;

const SORT_OPTIONS = ['Recent', 'Name A–Z', 'Region A–Z'] as const;
type SortOption = typeof SORT_OPTIONS[number];

const STYLE_FILTER_OPTIONS: Array<{ key: CheeseStyle | ''; label: string }> = [
  { key: '', label: 'All Styles' },
  { key: 'bloomy', label: 'Bloomy' },
  { key: 'washed', label: 'Washed' },
  { key: 'alpine', label: 'Alpine' },
  { key: 'blue', label: 'Blue' },
  { key: 'fresh', label: 'Fresh' },
  { key: 'pressed', label: 'Pressed' },
  { key: 'hard', label: 'Hard' },
];

function sortEntries(entries: CheeseEntry[], sort: SortOption): CheeseEntry[] {
  return [...entries].sort((a, b) => {
    switch (sort) {
      case 'Name A–Z': return a.name.localeCompare(b.name);
      case 'Region A–Z': return (a.region ?? '').localeCompare(b.region ?? '');
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
}

export function SearchScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const { entries, searchResults, searching, search, clearSearch, loadEntries } = useCheeseStore();
  const { isSubscribed } = useSubscriptionStore();

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('Recent');
  const [filterStyle, setFilterStyle] = useState<CheeseStyle | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (user) loadEntries(user.id, isSubscribed);
  }, [user]);

  const runSearch = useCallback(
    (q: string, style: CheeseStyle | '') => {
      if (!user) return;
      if (!q && !style) { clearSearch(); return; }
      search(user.id, q, { style: style || undefined });
    },
    [user, search, clearSearch]
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => runSearch(text, filterStyle), 400);
    setDebounceTimer(timer);
  };

  const displayEntries = query || filterStyle
    ? searchResults
    : sortEntries(entries, sortBy);

  const handleCheesePress = (entry: CheeseEntry) => {
    navigation.navigate('CheeseDetail', { entryId: entry.id });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cheeses</Text>
        <Text style={styles.count}>{entries.length} entries</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search cheese, creamery, region…"
          containerStyle={styles.searchInput}
        />
        <Pressable
          onPress={() => setShowFilters((v) => !v)}
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
        >
          <Text style={styles.filterBtnText}>⚡ Filter</Text>
        </Pressable>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filtersTitle}>Style</Text>
          <View style={styles.styleFilterRow}>
            {STYLE_FILTER_OPTIONS.map(({ key, label }) => (
              <Pressable
                key={key}
                style={[styles.filterChip, filterStyle === key && styles.filterChipActive]}
                onPress={() => {
                  setFilterStyle(key);
                  runSearch(query, key);
                }}
              >
                <Text style={[styles.filterChipText, filterStyle === key && styles.filterChipTextActive]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          {!isSubscribed && (
            <View style={styles.paywallHint}>
              <Text style={styles.paywallText}>
                🔒 Upgrade to Pro for compound search (milk type, region, price range…)
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Sort chips */}
      {!query && !filterStyle && (
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt}
              style={[styles.sortChip, sortBy === opt && styles.sortChipActive]}
              onPress={() => setSortBy(opt)}
            >
              <Text style={[styles.sortText, sortBy === opt && styles.sortTextActive]}>
                {opt}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {searching ? (
        <View style={styles.searchingWrap}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      ) : (
        <FlatList
          data={displayEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CheeseListItem entry={item} onPress={handleCheesePress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {query || filterStyle ? 'No cheeses match your search' : 'No cheeses logged yet'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 24,
    color: Colors.ink,
  },
  count: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  searchWrap: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  searchInput: { flex: 1, marginBottom: 0 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  filterBtnActive: {
    backgroundColor: Colors.goldPale,
    borderColor: Colors.gold,
  },
  filterBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.inkMid,
  },
  filtersPanel: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  filtersTitle: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  styleFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  filterChipText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMid,
  },
  filterChipTextActive: {
    color: Colors.ink,
    fontFamily: Fonts.dmSansMedium,
  },
  paywallHint: {
    backgroundColor: Colors.blueLight,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  paywallText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.blue,
    lineHeight: 17,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  sortChipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  sortText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMid,
  },
  sortTextActive: { color: Colors.gold },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  searchingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingTop: Spacing.huge,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 15,
    color: Colors.inkMuted,
  },
});
