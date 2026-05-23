import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { CheeseEntryDraft, CheeseScoreDraft, computeTechnicalScore, CheeseTerroirDraft, CreatorScoreDraft } from '@/types';

// ─── Secure Storage Adapter ───────────────────────────────────────────────────

const ExpoSecureStoreAdapter = {
  getItem: (key: string): string | null | Promise<string | null> => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): void | Promise<void> => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): void | Promise<void> => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    return SecureStore.deleteItemAsync(key);
  },
};

// ─── Supabase Client ──────────────────────────────────────────────────────────

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function signInWithGoogle() {
  const redirectUrl = Linking.createURL('auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (result.type === 'success') {
      const codeMatch = result.url.match(/[?&]code=([^&]+)/);
      const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;
      if (code) {
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) throw sessionError;
      }
    }
  }
}

// ─── Cheese Entry CRUD ────────────────────────────────────────────────────────

export async function createCheeseEntry(entry: CheeseEntryDraft & { user_id: string }) {
  return supabase.from('cheese_entries').insert(entry).select().single();
}

export async function updateCheeseEntry(id: string, updates: Partial<CheeseEntryDraft>) {
  return supabase.from('cheese_entries').update(updates).eq('id', id).select().single();
}

export async function deleteCheeseEntry(id: string) {
  return supabase.from('cheese_entries').delete().eq('id', id);
}

export async function getCheeseEntry(id: string) {
  return supabase.from('cheese_entries').select('*').eq('id', id).single();
}

export async function listCheeseEntries(
  userId: string,
  options?: { limit?: number; offset?: number; orderBy?: string; ascending?: boolean }
) {
  let query = supabase
    .from('cheese_entries')
    .select('*')
    .eq('user_id', userId)
    .order(options?.orderBy ?? 'created_at', { ascending: options?.ascending ?? false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);
  }
  return query;
}

export async function searchCheeseEntries(
  userId: string,
  searchQuery: string,
  filters?: { style?: string; milk_type?: string; region?: string }
) {
  let query = supabase
    .from('cheese_entries')
    .select('*')
    .eq('user_id', userId);

  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,producer.ilike.%${searchQuery}%,region.ilike.%${searchQuery}%`
    );
  }
  if (filters?.style)     query = query.eq('style', filters.style);
  if (filters?.milk_type) query = query.eq('milk_type', filters.milk_type);
  if (filters?.region)    query = query.eq('region', filters.region);

  return query.order('created_at', { ascending: false });
}

// ─── Cheese Score CRUD ────────────────────────────────────────────────────────

export async function createCheeseScore(
  score: CheeseScoreDraft & { entry_id: string; user_id: string }
) {
  const technical_score = computeTechnicalScore(score);
  return supabase
    .from('cheese_scores')
    .insert({ ...score, technical_score })
    .select()
    .single();
}

export async function getCheeseScore(entryId: string) {
  return supabase
    .from('cheese_scores')
    .select('*')
    .eq('entry_id', entryId)
    .single();
}

export async function updateCheeseScore(
  entryId: string,
  updates: Partial<CheeseScoreDraft>
) {
  return supabase
    .from('cheese_scores')
    .update(updates)
    .eq('entry_id', entryId)
    .select()
    .single();
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string) {
  return supabase.from('user_profiles').select('*').eq('id', userId).single();
}

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  return supabase.from('user_profiles').update(updates).eq('id', userId).select().single();
}

// ─── Search with Filters ──────────────────────────────────────────────────────

export async function searchEntriesWithFilters(
  userId: string,
  params: {
    query?: string;
    milkTypes?: string[];
    styles?: string[];
    regions?: string[];
    minScore?: number;
    maxScore?: number;
    minPrice?: number;
    maxPrice?: number;
  }
) {
  let q = supabase
    .from('cheese_entries')
    .select('*, cheese_scores(technical_score)')
    .eq('user_id', userId);

  if (params.query) {
    const like = `%${params.query}%`;
    q = q.or(
      `name.ilike.${like},producer.ilike.${like},region.ilike.${like},notes.ilike.${like}`
    );
  }
  if (params.milkTypes?.length) q = q.in('milk_type', params.milkTypes);
  if (params.styles?.length)    q = q.in('style', params.styles);
  if (params.regions?.length)   q = q.in('region', params.regions);
  if (params.minPrice != null)  q = q.gte('price', params.minPrice);
  if (params.maxPrice != null)  q = q.lte('price', params.maxPrice);

  const { data, error } = await q.order('created_at', { ascending: false });

  if (error || !data) return { data, error };

  // Apply score range client-side (score lives in related cheese_scores row)
  const minScore = params.minScore ?? 0;
  const maxScore = params.maxScore ?? 100;
  const hasScoreFilter = params.minScore != null || params.maxScore != null;

  const filtered = hasScoreFilter
    ? data.filter((e: any) => {
        const score = e.cheese_scores?.[0]?.technical_score;
        if (score == null) return params.minScore == null;
        return score >= minScore && score <= maxScore;
      })
    : data;

  return { data: filtered, error: null };
}

// ─── Analytics Data ───────────────────────────────────────────────────────────

export async function fetchAnalyticsData(userId: string) {
  return supabase
    .from('cheese_entries')
    .select('milk_type, style, region, price, would_buy_again, cheese_scores(technical_score)')
    .eq('user_id', userId);
}

// ─── Cheese Terroir ───────────────────────────────────────────────────────────

export async function createCheeseTerroirRecord(
  record: CheeseTerroirDraft & { entry_id: string; user_id: string }
) {
  return supabase.from('cheese_terroir').insert(record).select().single();
}

export async function getCheeseTerroirRecord(entryId: string) {
  return supabase
    .from('cheese_terroir')
    .select('*')
    .eq('entry_id', entryId)
    .maybeSingle();
}

export async function updateCheeseTerroirRecord(
  entryId: string,
  updates: Partial<CheeseTerroirDraft>
) {
  return supabase
    .from('cheese_terroir')
    .update(updates)
    .eq('entry_id', entryId)
    .select()
    .single();
}

// ─── Creator Scores ───────────────────────────────────────────────────────────

export async function listMyCreatorScores() {
  return supabase
    .from('creator_cheese_scores')
    .select('*')
    .order('updated_at', { ascending: false });
}

export async function createCreatorScore(draft: CreatorScoreDraft) {
  return supabase.from('creator_cheese_scores').insert(draft).select().single();
}

export async function updateCreatorScore(id: string, updates: Partial<CreatorScoreDraft>) {
  return supabase
    .from('creator_cheese_scores')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

export async function deleteCreatorScore(id: string) {
  return supabase.from('creator_cheese_scores').delete().eq('id', id);
}

export async function getCreatorScore(id: string) {
  return supabase.from('creator_cheese_scores').select('*').eq('id', id).single();
}
