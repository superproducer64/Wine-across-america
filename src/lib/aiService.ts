import { supabase } from './supabase';
import { CheeseEntry, CheeseScore, CheeseScoreDraft, FilterParams } from '@/types';

// ─── Shared invoke helper ─────────────────────────────────────────────────────

async function invokeEdgeFunction<T>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(functionName, { body });
  if (error) throw error;
  return data as T;
}

// ─── Auto-Tagging ─────────────────────────────────────────────────────────────

export interface GenerateTagsResult {
  tags: string[];
}

export async function generateTags(
  entry: CheeseEntry,
  scores?: CheeseScore | CheeseScoreDraft | null,
): Promise<GenerateTagsResult> {
  return invokeEdgeFunction<GenerateTagsResult>('generate-tags', {
    entry_id: entry.id,
    entry: {
      name: entry.name,
      producer: entry.producer,
      style: entry.style,
      milk_type: entry.milk_type,
      pasteurization: entry.pasteurization,
      region: entry.region,
      notes: entry.notes,
    },
    scores: scores ?? undefined,
  });
}

// ─── Typicity Description ─────────────────────────────────────────────────────

export interface GenerateTypicityResult {
  description: string;
}

export async function generateTypicity(
  entry: CheeseEntry,
  scores?: CheeseScore | CheeseScoreDraft | null,
): Promise<GenerateTypicityResult> {
  return invokeEdgeFunction<GenerateTypicityResult>('generate-typicity', {
    entry_id: entry.id,
    entry: {
      name: entry.name,
      producer: entry.producer,
      style: entry.style,
      milk_type: entry.milk_type,
      region: entry.region,
      notes: entry.notes,
    },
    scores: scores
      ? {
          aroma:      (scores as CheeseScore).aroma,
          complexity: (scores as CheeseScore).complexity,
          finish:     (scores as CheeseScore).finish,
          typicity:   (scores as CheeseScore).typicity,
        }
      : undefined,
  });
}

// ─── Taste Fingerprint ────────────────────────────────────────────────────────

export interface TasteFingerprint {
  description: string;
  recommendations: string[];
  blind_spot: string;
  avg_scores: Record<string, number>;
  entry_count: number;
  generated_at: string;
}

export async function generateFingerprint(force = false): Promise<TasteFingerprint> {
  return invokeEdgeFunction<TasteFingerprint>('generate-fingerprint', { force });
}

export async function getCachedFingerprint(): Promise<TasteFingerprint | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('taste_fingerprints')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return data ?? null;
}

// ─── Natural Language Search ──────────────────────────────────────────────────

export interface NLSearchResult extends FilterParams {
  summary: string;
}

export async function naturalLanguageSearch(query: string): Promise<NLSearchResult> {
  return invokeEdgeFunction<NLSearchResult>('natural-language-search', { query });
}
