import { create } from 'zustand';
import { CheeseEntry, CheeseEntryDraft, CheeseScoreDraft, CheeseScore, FilterParams, AnalyticsData } from '@/types';
import {
  listCheeseEntries,
  createCheeseEntry,
  updateCheeseEntry,
  deleteCheeseEntry,
  searchCheeseEntries,
  createCheeseScore,
  getCheeseScore,
  searchEntriesWithFilters,
  fetchAnalyticsData,
} from '@/lib/supabase';

const FREE_TIER_LIMIT = 30;

interface CheeseStore {
  entries: CheeseEntry[];
  totalCount: number;
  loading: boolean;
  searchResults: CheeseEntry[];
  searching: boolean;

  loadEntries: (userId: string, isPro: boolean) => Promise<void>;
  addEntry: (userId: string, draft: CheeseEntryDraft) => Promise<CheeseEntry | null>;
  updateEntry: (id: string, updates: Partial<CheeseEntryDraft>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  search: (userId: string, query: string, filters?: {
    style?: string;
    milk_type?: string;
    region?: string;
  }) => Promise<void>;
  clearSearch: () => void;
  searchWithFilters: (userId: string, params: FilterParams) => Promise<void>;
  analytics: AnalyticsData | null;
  analyticsLoading: boolean;
  loadAnalytics: (userId: string) => Promise<void>;
  addScore: (userId: string, entryId: string, draft: CheeseScoreDraft) => Promise<CheeseScore | null>;
  fetchScore: (entryId: string) => Promise<CheeseScore | null>;
}

export const useCheeseStore = create<CheeseStore>((set) => ({
  entries: [],
  totalCount: 0,
  loading: false,
  searchResults: [],
  searching: false,
  analytics: null,
  analyticsLoading: false,

  loadEntries: async (userId, isPro) => {
    set({ loading: true });
    const limit = isPro ? undefined : FREE_TIER_LIMIT;
    const { data, error } = await listCheeseEntries(userId, { limit });
    if (!error && data) {
      set({ entries: data as CheeseEntry[], totalCount: data.length, loading: false });
    } else {
      set({ loading: false });
    }
  },

  addEntry: async (userId, draft) => {
    const { data, error } = await createCheeseEntry({ ...draft, user_id: userId });
    if (error || !data) return null;
    const entry = data as CheeseEntry;
    set((state) => ({ entries: [entry, ...state.entries] }));
    return entry;
  },

  updateEntry: async (id, updates) => {
    const { data, error } = await updateCheeseEntry(id, updates);
    if (!error && data) {
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? (data as CheeseEntry) : e)),
      }));
    }
  },

  removeEntry: async (id) => {
    await deleteCheeseEntry(id);
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
  },

  search: async (userId, query, filters) => {
    set({ searching: true });
    const { data, error } = await searchCheeseEntries(userId, query, filters);
    if (!error && data) {
      set({ searchResults: data as CheeseEntry[], searching: false });
    } else {
      set({ searching: false });
    }
  },

  clearSearch: () => set({ searchResults: [] }),

  searchWithFilters: async (userId, params) => {
    set({ searching: true });
    const { data, error } = await searchEntriesWithFilters(userId, params);
    if (!error && data) {
      set({ searchResults: data as CheeseEntry[], searching: false });
    } else {
      set({ searching: false });
    }
  },

  loadAnalytics: async (userId) => {
    set({ analyticsLoading: true });
    const { data, error } = await fetchAnalyticsData(userId);
    if (error || !data) { set({ analyticsLoading: false }); return; }

    const total = data.length;

    // Average score
    const scored = data.filter((e: any) => e.cheese_scores?.[0]?.technical_score != null);
    const avgScore = scored.length
      ? Math.round(scored.reduce((s: number, e: any) => s + e.cheese_scores[0].technical_score, 0) / scored.length)
      : null;

    // Score buckets
    const bucketMap: Record<string, number> = { '0–60': 0, '61–70': 0, '71–80': 0, '81–90': 0, '91–100': 0 };
    const bucketMin:  Record<string, number> = { '0–60': 0, '61–70': 61, '71–80': 71, '81–90': 81, '91–100': 91 };
    scored.forEach((e: any) => {
      const s = e.cheese_scores[0].technical_score;
      if (s <= 60)      bucketMap['0–60']++;
      else if (s <= 70) bucketMap['61–70']++;
      else if (s <= 80) bucketMap['71–80']++;
      else if (s <= 90) bucketMap['81–90']++;
      else              bucketMap['91–100']++;
    });
    const scoreBuckets = Object.entries(bucketMap).map(([label, count]) => ({
      label, count, minVal: bucketMin[label],
    }));

    // Milk type counts
    const milkMap: Record<string, number> = {};
    data.forEach((e: any) => { milkMap[e.milk_type] = (milkMap[e.milk_type] ?? 0) + 1; });
    const milkTypeCounts = Object.entries(milkMap)
      .map(([milk_type, count]) => ({ milk_type, count }))
      .sort((a, b) => b.count - a.count);

    // Style counts
    const styleMap: Record<string, number> = {};
    data.forEach((e: any) => { styleMap[e.style] = (styleMap[e.style] ?? 0) + 1; });
    const styleCounts = Object.entries(styleMap)
      .map(([style, count]) => ({ style, count }))
      .sort((a, b) => b.count - a.count);

    // Top regions by avg score
    const regionScoreMap: Record<string, number[]> = {};
    data.forEach((e: any) => {
      if (!e.region) return;
      const score = e.cheese_scores?.[0]?.technical_score;
      if (score == null) return;
      if (!regionScoreMap[e.region]) regionScoreMap[e.region] = [];
      regionScoreMap[e.region].push(score);
    });
    const topRegions = Object.entries(regionScoreMap)
      .map(([region, scores]) => ({
        region,
        avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        count: scores.length,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    // Would buy again
    const answered = data.filter((e: any) => e.would_buy_again != null);
    const yesCount = data.filter((e: any) => e.would_buy_again === true).length;
    const buyAgainRate = answered.length
      ? Math.round((yesCount / answered.length) * 100)
      : null;

    set({
      analyticsLoading: false,
      analytics: {
        total, avgScore, scoreBuckets, milkTypeCounts, styleCounts,
        topRegions, buyAgainRate, buyAgainAnswered: answered.length,
      },
    });
  },

  addScore: async (userId, entryId, draft) => {
    const { data, error } = await createCheeseScore({ ...draft, entry_id: entryId, user_id: userId });
    if (error || !data) return null;
    return data as CheeseScore;
  },

  fetchScore: async (entryId) => {
    const { data, error } = await getCheeseScore(entryId);
    if (error || !data) return null;
    return data as CheeseScore;
  },
}));
