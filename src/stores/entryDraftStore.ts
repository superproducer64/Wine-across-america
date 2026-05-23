import { create } from 'zustand';
import { CheeseEntryDraft, CheeseScoreDraft, makeDefaultScoreDraft } from '@/types';

function makeDefaultDraft(): CheeseEntryDraft {
  return {
    name: '',
    producer: '',
    milk_type: 'cow',
    pasteurization: 'pasteurized',
    style: 'fresh',
    region: '',
    tasting_date: new Date().toISOString().split('T')[0],
    price: null,
    notes: '',
    would_buy_again: null,
  };
}

interface EntryDraftStore {
  draft: CheeseEntryDraft;
  scores: CheeseScoreDraft;
  setField: (data: Partial<CheeseEntryDraft>) => void;
  setScore: (data: Partial<CheeseScoreDraft>) => void;
  reset: () => void;
  loadForEdit: (entry: CheeseEntryDraft, scores?: CheeseScoreDraft) => void;
}

export const useEntryDraftStore = create<EntryDraftStore>((set) => ({
  draft: makeDefaultDraft(),
  scores: makeDefaultScoreDraft(),

  setField: (data) =>
    set((state) => ({ draft: { ...state.draft, ...data } })),

  setScore: (data) =>
    set((state) => ({ scores: { ...state.scores, ...data } })),

  reset: () =>
    set({ draft: makeDefaultDraft(), scores: makeDefaultScoreDraft() }),

  loadForEdit: (entry, scores) =>
    set({ draft: entry, scores: scores ?? makeDefaultScoreDraft() }),
}));
