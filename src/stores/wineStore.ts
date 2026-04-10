import { create } from 'zustand';
import { WineEntry, WineEntryDraft, computeTechnicalScore } from '@/types';
import {
  listWineEntries,
  createWineEntry,
  updateWineEntry,
  deleteWineEntry,
  searchWineEntries,
} from '@/lib/supabase';

const FREE_TIER_LIMIT = 30;

interface WineStore {
  entries: WineEntry[];
  totalCount: number;
  loading: boolean;
  searchResults: WineEntry[];
  searching: boolean;

  loadEntries: (userId: string, isPro: boolean) => Promise<void>;
  addEntry: (userId: string, draft: WineEntryDraft) => Promise<WineEntry | null>;
  updateEntry: (id: string, updates: Partial<WineEntryDraft>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  search: (userId: string, query: string, filters?: Record<string, unknown>) => Promise<void>;
  clearSearch: () => void;
}

export const useWineStore = create<WineStore>((set, get) => ({
  entries: [],
  totalCount: 0,
  loading: false,
  searchResults: [],
  searching: false,

  loadEntries: async (userId, isPro) => {
    set({ loading: true });
    const limit = isPro ? undefined : FREE_TIER_LIMIT;
    const { data, error } = await listWineEntries(userId, { limit });
    if (!error && data) {
      set({ entries: data as WineEntry[], totalCount: data.length, loading: false });
    } else {
      set({ loading: false });
    }
  },

  addEntry: async (userId, draft) => {
    const technical_score = computeTechnicalScore(draft as Partial<WineEntry>);
    const { data, error } = await createWineEntry({
      ...draft,
      user_id: userId,
      technical_score,
    });
    if (error || !data) return null;

    const entry = data as WineEntry;
    set((state) => ({ entries: [entry, ...state.entries] }));
    return entry;
  },

  updateEntry: async (id, updates) => {
    const technical_score =
      updates.score_balance !== undefined ||
      updates.score_intensity !== undefined ||
      updates.score_complexity !== undefined ||
      updates.score_finish !== undefined ||
      updates.score_typicity !== undefined
        ? computeTechnicalScore(updates as Partial<WineEntry>)
        : undefined;

    const payload = technical_score !== undefined ? { ...updates, technical_score } : updates;
    const { data, error } = await updateWineEntry(id, payload);
    if (!error && data) {
      set((state) => ({
        entries: state.entries.map((e) => (e.id === id ? (data as WineEntry) : e)),
      }));
    }
  },

  removeEntry: async (id) => {
    await deleteWineEntry(id);
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));
  },

  search: async (userId, query, filters) => {
    set({ searching: true });
    const { data, error } = await searchWineEntries(userId, query, filters);
    if (!error && data) {
      set({ searchResults: data as WineEntry[], searching: false });
    } else {
      set({ searching: false });
    }
  },

  clearSearch: () => set({ searchResults: [] }),
}));
