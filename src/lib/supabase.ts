import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
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

// ─── Apple Sign In ────────────────────────────────────────────────────────────

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function generateAppleNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  const rawNonce = generateRandomString(32);
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );
  return { rawNonce, hashedNonce };
}

export async function signInWithApple(
  identityToken: string,
  rawNonce: string,
  displayName?: string | null
): Promise<{ error: string | null }> {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identityToken,
    nonce: rawNonce,
  });

  if (error) return { error: error.message };

  if (data.session && data.user) {
    await supabase.auth.getSession();

    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!existingProfile) {
      await supabase.from('user_profiles').upsert({
        id: data.user.id,
        email: data.user.email ?? '',
        display_name: displayName ?? null,
        user_role: 'enthusiast',
        subscription_tier: 'free',
        is_creator: false,
      });
    }
  }

  return { error: null };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  userRole: 'enthusiast' | 'sommelier' = 'enthusiast'
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, user_role: userRole },
    },
  });
  if (error) throw error;

  // When email confirmation is disabled the session is available immediately.
  // Create the profile from the client using the authenticated session.
  // The server-side trigger is a no-op; this is the sole profile creation path.
  if (data.session && data.user) {
    // Call getSession() first to ensure the Supabase client has fully committed
    // the new session to its in-memory state before making authenticated DB calls.
    // This guards against a React Native timing issue with async SecureStore.
    await supabase.auth.getSession();

    const { error: profileError } = await supabase.from('user_profiles').upsert(
      {
        id: data.user.id,
        email: data.user.email ?? email,
        display_name: displayName,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    if (profileError) {
      console.error('[signup] profile upsert error:', JSON.stringify(profileError));
      throw new Error(profileError.message);
    }
  }

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
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const query = supabase
    .from('wine_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order(options?.orderBy ?? 'created_at', { ascending: options?.ascending ?? false })
    .range(offset, offset + limit - 1);

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

// ─── Sommelier Certification Upload ──────────────────────────────────────────

export async function uploadSommelierCert(
  userId: string,
  imageDataUrl: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const ext = blob.type === 'image/png' ? 'png' : 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('sommelier-certs')
      .upload(path, blob, { contentType: blob.type, upsert: true });

    if (error) return { url: null, error: error.message };

    const { data } = supabase.storage.from('sommelier-certs').getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  } catch (e: unknown) {
    return { url: null, error: String(e) };
  }
}

export async function submitSommelierApplication(
  userId: string,
  certUrl: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      user_role: 'sommelier',
      sommelier_cert_url: certUrl,
      sommelier_status: 'pending',
    })
    .eq('id', userId);
  if (error) {
    console.error('[submitSommelierApplication] error:', JSON.stringify(error));
    return { error: error.message };
  }
  return { error: null };
}

// ─── Admin: Sommelier Applications ───────────────────────────────────────────

export async function getPendingSommelierCount(): Promise<number> {
  const { count } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('sommelier_status', 'pending');
  return count ?? 0;
}

export async function fetchPendingSommelierApplications() {
  return supabase
    .from('user_profiles')
    .select('id, email, display_name, sommelier_cert_url, sommelier_status, created_at')
    .eq('sommelier_status', 'pending')
    .order('created_at', { ascending: true });
}

export async function updateSommelierStatus(
  userId: string,
  decision: 'approved' | 'rejected'
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_profiles')
    .update({
      sommelier_status: decision,
      user_role: decision === 'approved' ? 'sommelier' : 'enthusiast',
    })
    .eq('id', userId);
  if (error) {
    console.error('[updateSommelierStatus] error:', JSON.stringify(error));
    return { error: error.message };
  }
  return { error: null };
}

export async function getSommelierCertSignedUrl(
  certUrl: string
): Promise<string | null> {
  try {
    const marker = '/sommelier-certs/';
    const idx = certUrl.indexOf(marker);
    if (idx === -1) return certUrl;
    const path = certUrl.slice(idx + marker.length);
    const { data, error } = await supabase.storage
      .from('sommelier-certs')
      .createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

// ─── Label Photo Upload ───────────────────────────────────────────────────────

export async function uploadLabelPhoto(
  userId: string,
  imageDataUrl: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const ext = blob.type === 'image/png' ? 'png' : 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('wine-labels')
      .upload(path, blob, { contentType: blob.type, upsert: false });

    if (error) return { url: null, error: error.message };

    const { data } = supabase.storage.from('wine-labels').getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  } catch (e: unknown) {
    return { url: null, error: String(e) };
  }
}

// ─── User Search ──────────────────────────────────────────────────────────────

export async function searchUserByEmail(email: string) {
  return supabase
    .from('user_profiles')
    .select('id, email, display_name')
    .ilike('email', email.trim())
    .limit(5);
}

// ─── Wine Sharing ─────────────────────────────────────────────────────────────

export async function shareWineWithUser(
  senderId: string,
  senderName: string,
  recipientId: string,
  wineSnapshot: Record<string, unknown>
) {
  return supabase.from('shared_wines').insert({
    sender_id: senderId,
    sender_name: senderName,
    recipient_id: recipientId,
    wine_snapshot: wineSnapshot,
  });
}

export async function getSharedWithMe(userId: string) {
  return supabase
    .from('shared_wines')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
}

export async function markShareSeen(shareId: string) {
  return supabase
    .from('shared_wines')
    .update({ seen: true })
    .eq('id', shareId);
}
