import { create } from 'zustand';
import { CheeseEntry, CheeseEntryDraft, CheeseScoreDraft, CheeseScore } from '@/types';
import {
  listCheeseEntries,
  createCheeseEntry,
  updateCheeseEntry,
  deleteCheeseEntry,
  searchCheeseEntries,
  createCheeseScore,
  getCheeseScore,
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
  addScore: (userId: string, entryId: string, draft: CheeseScoreDraft) => Promise<CheeseScore | null>;
  fetchScore: (entryId: string) => Promise<CheeseScore | null>;
}

export const useCheeseStore = create<CheeseStore>((set) => ({
  entries: [],
  totalCount: 0,
  loading: false,
  searchResults: [],
  searching: false,

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
