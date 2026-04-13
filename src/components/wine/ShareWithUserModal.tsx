import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { searchUserByEmail, shareWineWithUser } from '@/lib/supabase';
import { WineEntry } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  entry: WineEntry;
  senderId: string;
  senderName: string;
}

interface FoundUser {
  id: string;
  email: string;
  display_name: string | null;
}

export function ShareWithUserModal({ visible, onClose, entry, senderId, senderName }: Props) {
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FoundUser[]>([]);
  const [selected, setSelected] = useState<FoundUser | null>(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'self'>('idle');
  const [searchDone, setSearchDone] = useState(false);

  const reset = () => {
    setEmail('');
    setResults([]);
    setSelected(null);
    setStatus('idle');
    setSearchDone(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSearch = async () => {
    if (!email.trim()) return;
    setSearching(true);
    setResults([]);
    setSelected(null);
    setStatus('idle');
    setSearchDone(false);

    const { data, error } = await searchUserByEmail(email.trim());
    setSearching(false);
    setSearchDone(true);

    if (error || !data) return;

    // Filter out the sender themselves
    const filtered = (data as FoundUser[]).filter((u) => u.id !== senderId);
    setResults(filtered);
  };

  const handleSend = async () => {
    if (!selected) return;
    setSending(true);
    setStatus('idle');

    // Build snapshot — full WineEntry minus internal IDs
    const snapshot: Record<string, unknown> = { ...entry };

    const { error } = await shareWineWithUser(
      senderId,
      senderName,
      selected.id,
      snapshot
    );

    setSending(false);

    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      setTimeout(() => {
        handleClose();
      }, 1800);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Share with a Member</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
          >
            {/* Wine preview */}
            <View style={styles.winePreview}>
              <Text style={styles.winePreviewLabel}>Sharing</Text>
              <Text style={styles.winePreviewName}>
                {entry.name || 'Untitled Wine'}
                {entry.vintage ? ` ${entry.vintage}` : ''}
              </Text>
              {entry.producer ? (
                <Text style={styles.winePreviewProducer}>{entry.producer}</Text>
              ) : null}
            </View>

            {/* Search */}
            <Text style={styles.inputLabel}>Enter recipient's email</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setSearchDone(false);
                  setResults([]);
                  setSelected(null);
                  setStatus('idle');
                }}
                placeholder="friend@example.com"
                placeholderTextColor={Colors.inkFaint}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              <Pressable
                style={[styles.searchBtn, searching && styles.searchBtnDisabled]}
                onPress={handleSearch}
                disabled={searching || !email.trim()}
              >
                {searching ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.searchBtnText}>Find</Text>
                )}
              </Pressable>
            </View>

            {/* Results */}
            {searchDone && results.length === 0 && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>
                  No Pour Across America member found with that email.
                </Text>
              </View>
            )}

            {results.map((user) => {
              const isSelected = selected?.id === user.id;
              return (
                <Pressable
                  key={user.id}
                  style={[styles.userRow, isSelected && styles.userRowSelected]}
                  onPress={() => setSelected(isSelected ? null : user)}
                >
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {(user.display_name ?? user.email)[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {user.display_name ?? 'App Member'}
                    </Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              );
            })}

            {/* Status feedback */}
            {status === 'success' && (
              <View style={[styles.feedback, styles.feedbackSuccess]}>
                <Text style={styles.feedbackText}>
                  🍷 Wine card sent to {selected?.display_name ?? selected?.email}!
                </Text>
              </View>
            )}
            {status === 'error' && (
              <View style={[styles.feedback, styles.feedbackError]}>
                <Text style={styles.feedbackText}>
                  Something went wrong. Please try again.
                </Text>
              </View>
            )}

            {/* Send button */}
            {selected && status !== 'success' && (
              <Pressable
                style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color={Colors.ink} size="small" />
                ) : (
                  <Text style={styles.sendBtnText}>
                    Send to {selected.display_name ?? selected.email}
                  </Text>
                )}
              </Pressable>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 20,
    color: Colors.ink,
  },
  closeBtn: {
    padding: Spacing.sm,
  },
  closeBtnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 16,
    color: Colors.inkMuted,
  },
  body: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  winePreview: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 3,
    marginBottom: Spacing.sm,
  },
  winePreviewLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  winePreviewName: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.white,
    lineHeight: 24,
  },
  winePreviewProducer: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  inputLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: Colors.white,
  },
  searchBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 64,
  },
  searchBtnDisabled: {
    opacity: 0.5,
  },
  searchBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.white,
  },
  noResults: {
    paddingVertical: Spacing.md,
  },
  noResultsText: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  userRowSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldPale,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontFamily: Fonts.playfair,
    fontSize: 17,
    color: Colors.ink,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.ink,
  },
  userEmail: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  checkmark: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 18,
    color: Colors.gold,
  },
  feedback: {
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  feedbackSuccess: {
    backgroundColor: '#EBF7F0',
    borderWidth: 0.5,
    borderColor: Colors.green,
  },
  feedbackError: {
    backgroundColor: Colors.redLight,
    borderWidth: 0.5,
    borderColor: Colors.red,
  },
  feedbackText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMid,
    textAlign: 'center',
  },
  sendBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: Colors.ink,
  },
});
