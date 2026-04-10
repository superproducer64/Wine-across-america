import { create } from 'zustand';
import { WineEntryDraft, TerriorSoil, TerriorClimate } from '@/types';

function makeDefaultDraft(): WineEntryDraft {
  return {
    name: '',
    producer: '',
    vintage: null,
    country: '',
    region: '',
    appellation: '',
    grapes: [],
    price: [],
    tasting_date: new Date().toISOString().split('T')[0],
    location_name: '',
    location_geo: null,

    // Structure Wheel
    acidity: 5,
    tannin: 5,
    body: 5,
    alcohol: 5,
    intensity: 5,
    finish_length: 5,

    // Technical Score
    score_balance: 10,
    score_intensity: 10,
    score_complexity: 10,
    score_finish: 10,
    score_typicity: 10,

    // Notes
    free_notes: '',
    aromas_l1: [],
    aromas_l2: [],
    tags: [],
    want_another_glass: false,
    want_to_buy: false,

    // Terroir
    terroir_soil: null,
    terroir_climate: null,
    terroir_visible: false,

    // Signature (creator only)
    sig_sense_of_place: null,
    sig_story: null,
    sig_viticulture: null,
    sig_structure: null,
    sig_enjoyment: null,
  };
}

interface EntryDraftStore {
  draft: WineEntryDraft;
  currentStep: number;

  // Setters per step
  setBasics: (data: Partial<Pick<WineEntryDraft,
    'name' | 'producer' | 'vintage' | 'country' | 'region' | 'appellation' |
    'grapes' | 'price' | 'tasting_date' | 'location_name' | 'location_geo'>>) => void;

  setStructureWheel: (data: Partial<Pick<WineEntryDraft,
    'acidity' | 'tannin' | 'body' | 'alcohol' | 'intensity' | 'finish_length'>>) => void;

  setAromas: (aromas_l1: string[], aromas_l2: string[]) => void;

  setTechnicalScore: (data: Partial<Pick<WineEntryDraft,
    'score_balance' | 'score_intensity' | 'score_complexity' | 'score_finish' | 'score_typicity'>>) => void;

  setNotesAndTerroir: (data: Partial<Pick<WineEntryDraft,
    'free_notes' | 'tags' | 'want_another_glass' | 'want_to_buy' |
    'terroir_soil' | 'terroir_climate' | 'terroir_visible'>>) => void;

  setStep: (step: number) => void;
  reset: () => void;
  loadForEdit: (entry: WineEntryDraft) => void;
}

export const useEntryDraftStore = create<EntryDraftStore>((set) => ({
  draft: makeDefaultDraft(),
  currentStep: 0,

  setBasics: (data) =>
    set((state) => ({ draft: { ...state.draft, ...data } })),

  setStructureWheel: (data) =>
    set((state) => ({ draft: { ...state.draft, ...data } })),

  setAromas: (aromas_l1, aromas_l2) =>
    set((state) => ({ draft: { ...state.draft, aromas_l1, aromas_l2 } })),

  setTechnicalScore: (data) =>
    set((state) => ({ draft: { ...state.draft, ...data } })),

  setNotesAndTerroir: (data) =>
    set((state) => ({ draft: { ...state.draft, ...data } })),

  setStep: (step) => set({ currentStep: step }),

  reset: () => set({ draft: makeDefaultDraft(), currentStep: 0 }),

  loadForEdit: (entry) => set({ draft: entry, currentStep: 0 }),
}));
