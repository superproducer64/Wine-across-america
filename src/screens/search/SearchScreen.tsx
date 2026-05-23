import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, Pressable,
  ActivityIndicator, Modal, Animated, ScrollView, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { TextInput } from '@/components/ui/TextInput';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { CheeseListItem } from '@/components/cheese/CheeseListItem';
import { useAuthStore } from '@/stores/authStore';
import { useCheeseStore } from '@/stores/cheeseStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import {
  CheeseEntry, FilterParams,
  MILK_TYPE_LABELS, CHEESE_STYLE_LABELS, US_REGIONS,
  MilkType, CheeseStyle,
} from '@/types';
import { MainStackParamList } from '@/navigation/types';
import { naturalLanguageSearch } from '@/lib/aiService';

type NavProp = NativeStackNavigationProp<MainStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MILK_TYPES: MilkType[] = ['cow', 'sheep', 'goat', 'buffalo', 'mixed'];
const STYLE_OPTIONS: CheeseStyle[] = ['bloomy', 'washed', 'alpine', 'blue', 'fresh', 'pressed', 'hard'];

// Count active filters (excluding query which is shown in search bar)
function countActiveFilters(params: FilterParams): number {
  let n = 0;
  if (params.milkTypes?.length) n++;
  if (params.styles?.length) n++;
  if (params.regions?.length) n++;
  if (params.minScore != null && params.minScore > 0) n++;
  if (params.maxScore != null && params.maxScore < 100) n++;
  if (params.minPrice != null && params.minPrice > 0) n++;
  if (params.maxPrice != null && params.maxPrice < 200) n++;
  return n;
}

export function SearchScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const { entries, searchResults, searching, searchWithFilters, clearSearch, loadEntries } = useCheeseStore();
  const { isSubscribed } = useSubscriptionStore();

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterParams>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Draft filter state inside drawer (only committed on Apply)
  const [draftFilters, setDraftFilters] = useState<FilterParams>({});
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Natural language search (Pro only)
  const [nlQuery, setNlQuery] = useState('');
  const [nlSummary, setNlSummary] = useState<string | null>(null);
  const [nlLoading, setNlLoading] = useState(false);

  // Slide animation for filter drawer
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    if (user) loadEntries(user.id, isSubscribed);
  }, [user]);

  const openDrawer = () => {
    setDraftFilters(filters);
    setDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  const applyFilters = () => {
    const newFilters = { ...draftFilters, query };
    setFilters(newFilters);
    closeDrawer();
    if (user) searchWithFilters(user.id, newFilters);
  };

  const clearFilters = () => {
    setDraftFilters({});
    setFilters({});
    clearSearch();
  };

  const runSearch = useCallback(
    (q: string, f: FilterParams) => {
      if (!user) return;
      const params = { ...f, query: q };
      if (!q && !countActiveFilters(f)) { clearSearch(); return; }
      searchWithFilters(user.id, params);
    },
    [user, searchWithFilters, clearSearch]
  );

  const handleNlSearch = async () => {
    if (!nlQuery.trim() || !user) return;
    setNlLoading(true);
    try {
      const result = await naturalLanguageSearch(nlQuery.trim());
      const { summary, ...appliedFilters } = result;
      setNlSummary(summary ?? null);
      setFilters(appliedFilters);
      setQuery(appliedFilters.query ?? '');
      runSearch(appliedFilters.query ?? '', appliedFilters);
    } catch {
      setNlSummary(null);
    } finally {
      setNlLoading(false);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => runSearch(text, filters), 400);
    setDebounceTimer(timer);
  };

  const toggleMilkType = (mt: string) => {
    const cur = draftFilters.milkTypes ?? [];
    setDraftFilters({
      ...draftFilters,
      milkTypes: cur.includes(mt) ? cur.filter((x) => x !== mt) : [...cur, mt],
    });
  };

  const toggleStyle = (s: string) => {
    const cur = draftFilters.styles ?? [];
    setDraftFilters({
      ...draftFilters,
      styles: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    });
  };

  const toggleRegion = (r: string) => {
    const cur = draftFilters.regions ?? [];
    setDraftFilters({
      ...draftFilters,
      regions: cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r],
    });
  };

  const activeFilterCount = countActiveFilters(filters);
  const isFiltered = !!query || activeFilterCount > 0;
  const displayEntries = isFiltered ? searchResults : entries;

  const handleCheesePress = (entry: CheeseEntry) => {
    navigation.navigate('CheeseDetail', { entryId: entry.id });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Cheeses</Text>
        <Text style={styles.count}>{entries.length} entries</Text>
      </View>

      {/* Natural language search (Pro only) */}
      {isSubscribed && (
        <View style={styles.nlWrap}>
          <View style={styles.nlInputRow}>
            <TextInput
              value={nlQuery}
              onChangeText={setNlQuery}
              placeholder={'Ask AI: "stinky Vermont goat under $20"…'}
              containerStyle={styles.nlInput}
              onSubmitEditing={handleNlSearch}
              returnKeyType="search"
            />
            <Pressable
              onPress={handleNlSearch}
              style={[styles.nlBtn, nlLoading && styles.nlBtnDisabled]}
              disabled={nlLoading}
            >
              <Text style={styles.nlBtnText}>{nlLoading ? '…' : '✦'}</Text>
            </Pressable>
          </View>
          {nlSummary ? (
            <View style={styles.nlSummaryRow}>
              <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View>
              <Text style={styles.nlSummaryText}>{nlSummary}</Text>
              <Pressable onPress={() => { setNlSummary(null); setNlQuery(''); clearFilters(); }}>
                <Text style={styles.nlClear}>✕</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}

      {/* Search bar + filter button */}
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={handleQueryChange}
          placeholder="Search cheese, creamery, region…"
          containerStyle={styles.searchInput}
        />
        <Pressable
          onPress={openDrawer}
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
        >
          <Text style={[styles.filterBtnText, activeFilterCount > 0 && styles.filterBtnTextActive]}>
            {activeFilterCount > 0 ? `Filter (${activeFilterCount})` : 'Filter'}
          </Text>
        </Pressable>
      </View>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersRow}>
          <Pressable onPress={clearFilters} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕ Clear all</Text>
          </Pressable>
        </View>
      )}

      {/* Results */}
      {searching ? (
        <View style={styles.loadingWrap}>
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
                {isFiltered ? 'No cheeses match your filters' : 'No cheeses logged yet'}
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Drawer Modal */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.drawerContainer}>
          <Pressable style={styles.drawerBackdrop} onPress={closeDrawer} />
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
            <SafeAreaView style={styles.drawerInner}>
              {/* Drawer header */}
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Filters</Text>
                <Pressable onPress={closeDrawer} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.drawerClose}>✕</Text>
                </Pressable>
              </View>

              <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>

                {/* Milk Type */}
                <Text style={styles.filterLabel}>Milk Type</Text>
                <View style={styles.chipWrap}>
                  {MILK_TYPES.map((mt) => {
                    const active = draftFilters.milkTypes?.includes(mt);
                    return (
                      <Pressable
                        key={mt}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => toggleMilkType(mt)}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {MILK_TYPE_LABELS[mt]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Style */}
                <Text style={styles.filterLabel}>Style</Text>
                <View style={styles.chipWrap}>
                  {STYLE_OPTIONS.map((s) => {
                    const active = draftFilters.styles?.includes(s);
                    return (
                      <Pressable
                        key={s}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => toggleStyle(s)}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {CHEESE_STYLE_LABELS[s]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Region */}
                <Text style={styles.filterLabel}>Region</Text>
                <View style={styles.chipWrap}>
                  {US_REGIONS.slice(0, 24).map((r) => {
                    const active = draftFilters.regions?.includes(r);
                    return (
                      <Pressable
                        key={r}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => toggleRegion(r)}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{r}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Score Range */}
                <Text style={styles.filterLabel}>Score Range</Text>
                <ScoreSlider
                  label="Min Score"
                  value={draftFilters.minScore ?? 0}
                  min={0} max={100} step={5}
                  onChange={(v) => setDraftFilters({ ...draftFilters, minScore: v })}
                  accentColor={Colors.gold}
                />
                <ScoreSlider
                  label="Max Score"
                  value={draftFilters.maxScore ?? 100}
                  min={0} max={100} step={5}
                  onChange={(v) => setDraftFilters({ ...draftFilters, maxScore: v })}
                  accentColor={Colors.gold}
                />

                {/* Price Range */}
                <Text style={styles.filterLabel}>Price Range (per lb / unit)</Text>
                <ScoreSlider
                  label="Min Price"
                  value={draftFilters.minPrice ?? 0}
                  min={0} max={200} step={5}
                  onChange={(v) => setDraftFilters({ ...draftFilters, minPrice: v })}
                  accentColor={Colors.gold}
                />
                <ScoreSlider
                  label="Max Price"
                  value={draftFilters.maxPrice ?? 200}
                  min={0} max={200} step={5}
                  onChange={(v) => setDraftFilters({ ...draftFilters, maxPrice: v })}
                  accentColor={Colors.gold}
                />

                <View style={{ height: Spacing.huge }} />
              </ScrollView>

              {/* Drawer footer */}
              <View style={styles.drawerFooter}>
                <Pressable
                  style={styles.clearDrawerBtn}
                  onPress={() => setDraftFilters({})}
                >
                  <Text style={styles.clearDrawerText}>Clear</Text>
                </Pressable>
                <Pressable style={styles.applyBtn} onPress={applyFilters}>
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
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
  title: { fontFamily: Fonts.playfair, fontSize: 24, color: Colors.ink },
  count: { fontFamily: Fonts.dmSans, fontSize: 13, color: Colors.inkMuted },
  nlWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    gap: 6,
  },
  nlInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  nlInput: { flex: 1, marginBottom: 0 },
  nlBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nlBtnDisabled: { opacity: 0.5 },
  nlBtnText: { fontSize: 18, color: Colors.ink },
  nlSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  aiBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  aiBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 9,
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  nlSummaryText: {
    flex: 1,
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMid,
  },
  nlClear: { fontFamily: Fonts.dmSans, fontSize: 14, color: Colors.inkMuted },
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
  filterBtnActive: { backgroundColor: Colors.goldPale, borderColor: Colors.gold },
  filterBtnText: { fontFamily: Fonts.dmSansMedium, fontSize: 13, color: Colors.inkMid },
  filterBtnTextActive: { color: Colors.gold },
  activeFiltersRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    gap: 6,
    alignItems: 'center',
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  clearBtnText: { fontFamily: Fonts.dmSans, fontSize: 12, color: Colors.inkMuted },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.huge },
  emptyState: { paddingTop: Spacing.huge, alignItems: 'center' },
  emptyText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 15,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  // Drawer
  drawerContainer: { flex: 1, flexDirection: 'row' },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,23,16,0.45)',
  },
  drawer: {
    width: SCREEN_WIDTH * 0.82,
    backgroundColor: Colors.surface,
    borderLeftWidth: 0.5,
    borderLeftColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerInner: { flex: 1 },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  drawerTitle: { fontFamily: Fonts.playfair, fontSize: 20, color: Colors.ink },
  drawerClose: { fontFamily: Fonts.dmSans, fontSize: 18, color: Colors.inkMuted },
  drawerScroll: { flex: 1, paddingHorizontal: Spacing.xl },
  filterLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginTop: Spacing.lg,
    marginBottom: 8,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  chipActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  chipText: { fontFamily: Fonts.dmSans, fontSize: 12, color: Colors.inkMid },
  chipTextActive: { fontFamily: Fonts.dmSansMedium, color: Colors.ink },
  drawerFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  clearDrawerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearDrawerText: { fontFamily: Fonts.dmSansMedium, fontSize: 14, color: Colors.inkMid },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: { fontFamily: Fonts.dmSansMedium, fontSize: 14, color: Colors.gold },
});
