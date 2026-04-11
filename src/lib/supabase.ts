import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ─── Secure Storage Adapter ───────────────────────────────────────────────────

const ExpoSecureStoreAdapter = {
  getItem: (key: string): string | null | Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): void | Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): void | Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// ─── Supabase Client ──────────────────────────────────────────────────────────

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';


const createSupabaseClient = () => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch (e) {
    console.warn('Supabase client could not be initialized. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    return createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
};

export const supabase = createSupabaseClient();

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  return supabase.auth.signOut();
}

// ─── Wine Entry CRUD ──────────────────────────────────────────────────────────

export async function createWineEntry(entry: Omit<Parameters<typeof supabase.from>[0] extends 'wine_entries' ? never : object, never>) {
  return supabase.from('wine_entries').insert(entry).select().single();
}

export async function updateWineEntry(id: string, updates: Record<string, unknown>) {
  return supabase.from('wine_entries').update(updates).eq('id', id).select().single();
}

export async function deleteWineEntry(id: string) {
  return supabase.from('wine_entries').delete().eq('id', id);
}

export async function getWineEntry(id: string) {
  return supabase.from('wine_entries').select('*').eq('id', id).single();
}

export async function listWineEntries(userId: string, options?: {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
  filters?: Record<string, unknown>;
}) {
  let query = supabase
    .from('wine_entries')
    .select('*')
    .eq('user_id', userId)
    .order(options?.orderBy ?? 'created_at', { ascending: options?.ascending ?? false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);
  }

  return query;
}

export async function searchWineEntries(userId: string, searchQuery: string, filters?: {
  minScore?: number;
  maxScore?: number;
  country?: string;
  region?: string;
  terroir_soil?: string;
  maxPrice?: number;
}) {
  let query = supabase
    .from('wine_entries')
    .select('*')
    .eq('user_id', userId);

  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,producer.ilike.%${searchQuery}%,region.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%`
    );
  }

  if (filters?.minScore !== undefined) {
    query = query.gte('technical_score', filters.minScore);
  }
  if (filters?.maxScore !== undefined) {
    query = query.lte('technical_score', filters.maxScore);
  }
  if (filters?.country) {
    query = query.eq('country', filters.country);
  }
  if (filters?.region) {
    query = query.eq('region', filters.region);
  }
  if (filters?.terroir_soil) {
    query = query.eq('terroir_soil', filters.terroir_soil);
  }

  return query.order('created_at', { ascending: false });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string) {
  return supabase.from('user_profiles').select('*').eq('id', userId).single();
}

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  return supabase.from('user_profiles').update(updates).eq('id', userId).select().single();
}
