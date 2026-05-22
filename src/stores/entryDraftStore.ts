import { create } from 'zustand';
import { CheeseEntryDraft } from '@/types';

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
  };
}

interface EntryDraftStore {
  draft: CheeseEntryDraft;
  setField: (data: Partial<CheeseEntryDraft>) => void;
  reset: () => void;
  loadForEdit: (entry: CheeseEntryDraft) => void;
}

export const useEntryDraftStore = create<EntryDraftStore>((set) => ({
  draft: makeDefaultDraft(),
  setField: (data) => set((state) => ({ draft: { ...state.draft, ...data } })),
  reset: () => set({ draft: makeDefaultDraft() }),
  loadForEdit: (entry) => set({ draft: entry }),
}));
