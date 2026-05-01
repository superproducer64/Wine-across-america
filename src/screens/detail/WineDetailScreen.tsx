import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Share,
  Platform,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { LABEL_PHOTO_PLACEHOLDER } from '@/utils/imagePlaceholder';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { useResponsive, MAX_CONTENT_WIDTH } from '@/hooks/useResponsive';
import { VivinoStyleCard } from '@/components/wine/VivinoStyleCard';
import { ProWineCard } from '@/components/wine/ProWineCard';
import { Button } from '@/components/ui/Button';
import { DatePickerInput } from '@/components/ui/DatePickerInput';
import { getWineEntry } from '@/lib/supabase';
import { useWineStore } from '@/stores/wineStore';
import { useAuthStore } from '@/stores/authStore';
import { ShareWithUserModal } from '@/components/wine/ShareWithUserModal';
import { WineEntry, PriceEntry } from '@/types';
import { MainStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'WineDetail'>;

function buildShareText(entry: WineEntry): string {
  const lines: string[] = [];

  const vintage = entry.vintage ? ` ${entry.vintage}` : '';
  lines.push(`🍷 ${entry.name || 'Untitled Wine'}${vintage}`);

  if (entry.producer) lines.push(entry.producer);

  const origin = [entry.appellation, entry.region, entry.country]
    .filter(Boolean)
    .join(', ');
  if (origin) lines.push(origin);

  lines.push('');

  if (entry.technical_score) {
    lines.push(`Technical Score: ${entry.technical_score}/100`);
  }

  if (entry.aromas_l1.length > 0) {
    lines.push(`Aromas: ${entry.aromas_l1.join(', ')}`);
  }

  if (entry.grapes.length > 0) {
    lines.push(`Grapes: ${entry.grapes.join(', ')}`);
  }

  if (entry.free_notes) {
    lines.push('');
    lines.push(`"${entry.free_notes}"`);
  }

  lines.push('');

  if (entry.location_name) {
    lines.push(`📍 ${entry.location_name}`);
  }

  lines.push(
    `🗓 ${new Date(entry.tasting_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`
  );

  if (entry.want_another_glass) lines.push('🥂 Would have another glass');
  if (entry.want_to_buy) lines.push('🛒 Would buy a bottle');

  lines.push('');
  lines.push('Logged with Pour Across America');

  return lines.join('\n');
}

const TODAY = new Date().toISOString().slice(0, 10);

export function WineDetailScreen({ route, navigation }: Props) {
  const { entryId } = route.params;
  const { entries, removeEntry, updateEntry } = useWineStore();
  const { isWide } = useResponsive();
  const { user, profile } = useAuthStore();

  // Use cached store entry immediately — avoids a network round-trip on every open.
  // Only fall back to fetching if the entry isn't in the store (e.g. deep link).
  const cached = entries.find((e) => e.id === entryId) ?? null;
  const [entry, setEntry] = useState<WineEntry | null>(cached);
  const [loading, setLoading] = useState(cached === null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareToast, setShareToast] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  // ── Log another visit ──────────────────────────────────────────────────────
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitDate, setVisitDate] = useState(TODAY);
  const [visitLocation, setVisitLocation] = useState('');
  const [visitAmount, setVisitAmount] = useState('');
  const [visitCurrency, setVisitCurrency] = useState('USD');
  const [visitType, setVisitType] = useState<'glass' | 'bottle'>('bottle');
  const [savingVisit, setSavingVisit] = useState(false);
  const [visitBanner, setVisitBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleSaveVisit = async () => {
    if (!entry) return;
    const amount = parseFloat(visitAmount);
    if (!visitAmount || isNaN(amount) || amount <= 0) {
      setVisitBanner({ type: 'error', msg: 'Please enter a valid price.' });
      return;
    }
    setSavingVisit(true);
    setVisitBanner(null);
    const newPrice: PriceEntry = {
      amount,
      currency: visitCurrency.trim() || 'USD',
      date: visitDate,
      location: visitLocation.trim(),
      type: visitType,
    };
    const updatedPrices = [...entry.price, newPrice];
    await updateEntry(entryId, { price: updatedPrices });
    const updated = { ...entry, price: updatedPrices };
    setEntry(updated);
    setVisitBanner({ type: 'success', msg: 'Visit saved!' });
    setVisitAmount('');
    setVisitLocation('');
    setVisitDate(TODAY);
    setVisitType('bottle');
    setSavingVisit(false);
    setTimeout(() => { setShowVisitForm(false); setVisitBanner(null); }, 1500);
  };

  // ── Editable notes ─────────────────────────────────────────────────────────
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesBanner, setNotesBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleEditNotes = () => {
    setNotesText(entry?.free_notes ?? '');
    setNotesBanner(null);
    setEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    if (!entry) return;
    setSavingNotes(true);
    setNotesBanner(null);
    await updateEntry(entryId, { free_notes: notesText.trim() });
    const updated = { ...entry, free_notes: notesText.trim() };
    setEntry(updated);
    setNotesBanner({ type: 'success', msg: 'Notes saved!' });
    setSavingNotes(false);
    setTimeout(() => { setEditingNotes(false); setNotesBanner(null); }, 1200);
  };

  useEffect(() => {
    if (cached !== null) return; // already have it, skip the fetch
    (async () => {
      const { data, error } = await getWineEntry(entryId);
      if (!error && data) {
        setEntry(data as WineEntry);
      }
      setLoading(false);
    })();
  }, [entryId]);

  const handleDelete = async () => {
    setDeleting(true);
    await removeEntry(entryId);
    navigation.goBack();
  };

  const handleShare = async () => {
    if (!entry) return;
    const text = buildShareText(entry);
    const title = `${entry.name || 'Wine'}${entry.vintage ? ` ${entry.vintage}` : ''}`;

    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({ title, text });
        } catch {
          // user cancelled — do nothing
        }
      } else {
        try {
          await navigator.clipboard.writeText(text);
          setShareToast('Copied to clipboard!');
          setTimeout(() => setShareToast(''), 3000);
        } catch {
          setShareToast('Could not copy — please copy manually.');
          setTimeout(() => setShareToast(''), 3000);
        }
      }
    } else {
      try {
        await Share.share({ message: text, title });
      } catch {
        // user cancelled — do nothing
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.gold} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Wine not found.</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav Bar */}
      <View style={styles.navbar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹ Back</Text>
        </Pressable>

        <View style={styles.navRight}>
          {/* Share button */}
          {!confirmDelete && (
            <Pressable onPress={handleShare} style={styles.navBtn}>
              <Text style={styles.shareText}>Share</Text>
            </Pressable>
          )}

          {/* Delete flow */}
          {confirmDelete ? (
            <View style={styles.deleteConfirmRow}>
              <Pressable onPress={() => setConfirmDelete(false)} style={styles.navBtn}>
                <Text style={styles.navBtnText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleDelete} disabled={deleting} style={styles.navBtn}>
                <Text style={styles.deleteText}>{deleting ? 'Deleting…' : 'Confirm Delete'}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setConfirmDelete(true)} style={styles.navBtn}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Clipboard toast (web fallback) */}
      {shareToast !== '' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{shareToast}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, isWide && { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date & location meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {new Date(entry.tasting_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          {entry.location_name ? (
            <Text style={styles.metaText}>📍 {entry.location_name}</Text>
          ) : null}
        </View>

        {/* Free-form notes */}
        <View style={styles.notesBlock}>
          <View style={styles.notesHeader}>
            <Text style={styles.notesLabel}>Tasting Notes</Text>
            {!editingNotes && (
              <Pressable onPress={handleEditNotes} hitSlop={8}>
                <Text style={styles.editLink}>{entry.free_notes ? 'Edit' : '+ Add notes'}</Text>
              </Pressable>
            )}
          </View>
          {notesBanner && (
            <Text style={notesBanner.type === 'success' ? styles.successBanner : styles.errorBanner}>
              {notesBanner.msg}
            </Text>
          )}
          {editingNotes ? (
            <View style={styles.notesEditWrap}>
              <TextInput
                style={styles.notesInput}
                value={notesText}
                onChangeText={setNotesText}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholder="Your tasting notes…"
                placeholderTextColor={Colors.inkFaint}
                autoFocus
              />
              <View style={styles.notesEditBtns}>
                <Pressable onPress={() => { setEditingNotes(false); setNotesBanner(null); }} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSaveNotes} disabled={savingNotes} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>{savingNotes ? 'Saving…' : 'Save Notes'}</Text>
                </Pressable>
              </View>
            </View>
          ) : entry.free_notes ? (
            <Text style={styles.notesText}>{entry.free_notes}</Text>
          ) : (
            <Text style={styles.notesEmpty}>No tasting notes yet.</Text>
          )}
        </View>

        {/* Intelligence Card — radar chart layout */}
        <ProWineCard entry={entry} />

        {/* Original Wine Card */}
        <VivinoStyleCard entry={entry} />

        {/* Price history + Log Another Visit */}
        <View style={styles.priceBlock}>
          <View style={styles.priceHeader}>
            <Text style={styles.priceLabel}>Price History</Text>
            <Pressable onPress={() => { setShowVisitForm((v) => !v); setVisitBanner(null); }} hitSlop={8}>
              <Text style={styles.editLink}>{showVisitForm ? 'Cancel' : '+ Log a visit'}</Text>
            </Pressable>
          </View>

          {entry.price.length > 0 ? entry.price.map((p, i) => (
            <View key={i} style={styles.priceRow}>
              <View style={styles.priceRowLeft}>
                <Text style={styles.priceType}>{p.type === 'glass' ? '🥂 Glass' : '🍾 Bottle'}</Text>
                {p.location ? <Text style={styles.priceLocation}>📍 {p.location}</Text> : null}
                {p.date ? <Text style={styles.priceDate}>{new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text> : null}
              </View>
              <Text style={styles.priceValue}>{p.currency} {p.amount.toFixed(2)}</Text>
            </View>
          )) : (
            <Text style={styles.notesEmpty}>No price logged yet.</Text>
          )}

          {showVisitForm && (
            <View style={styles.visitForm}>
              <Text style={styles.visitFormTitle}>Log Another Visit</Text>

              {visitBanner && (
                <Text style={visitBanner.type === 'success' ? styles.successBanner : styles.errorBanner}>
                  {visitBanner.msg}
                </Text>
              )}

              {/* Date */}
              <DatePickerInput
                label="Date"
                value={visitDate}
                onChange={setVisitDate}
              />

              {/* Location */}
              <View style={styles.visitFieldWrap}>
                <Text style={styles.visitFieldLabel}>Location</Text>
                <TextInput
                  style={styles.visitTextInput}
                  value={visitLocation}
                  onChangeText={setVisitLocation}
                  placeholder="Restaurant, shop, etc."
                  placeholderTextColor={Colors.inkFaint}
                />
              </View>

              {/* Glass / Bottle toggle */}
              <View style={styles.visitFieldWrap}>
                <Text style={styles.visitFieldLabel}>Type</Text>
                <View style={styles.typeToggle}>
                  <Pressable
                    style={[styles.typeBtn, visitType === 'glass' && styles.typeBtnActive]}
                    onPress={() => setVisitType('glass')}
                  >
                    <Text style={[styles.typeBtnText, visitType === 'glass' && styles.typeBtnTextActive]}>🥂 Glass</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.typeBtn, visitType === 'bottle' && styles.typeBtnActive]}
                    onPress={() => setVisitType('bottle')}
                  >
                    <Text style={[styles.typeBtnText, visitType === 'bottle' && styles.typeBtnTextActive]}>🍾 Bottle</Text>
                  </Pressable>
                </View>
              </View>

              {/* Price + Currency */}
              <View style={styles.visitFieldWrap}>
                <Text style={styles.visitFieldLabel}>Price</Text>
                <View style={styles.priceInputRow}>
                  <TextInput
                    style={styles.currencyInput}
                    value={visitCurrency}
                    onChangeText={setVisitCurrency}
                    maxLength={4}
                    autoCapitalize="characters"
                    placeholder="USD"
                    placeholderTextColor={Colors.inkFaint}
                  />
                  <TextInput
                    style={styles.amountInput}
                    value={visitAmount}
                    onChangeText={setVisitAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={Colors.inkFaint}
                    selectTextOnFocus
                  />
                </View>
              </View>

              <Pressable onPress={handleSaveVisit} disabled={savingVisit} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>{savingVisit ? 'Saving…' : 'Save Visit'}</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Grapes */}
        {entry.grapes.length > 0 && (
          <View style={styles.grapesBlock}>
            <Text style={styles.grapesLabel}>Grape Varieties</Text>
            <Text style={styles.grapesValue}>{entry.grapes.join(', ')}</Text>
          </View>
        )}

        {/* Label photo */}
        {entry.label_photo_url ? (
          <View style={styles.labelPhotoBlock}>
            <Text style={styles.labelPhotoLabel}>Label Photo</Text>
            <Image
              source={{ uri: entry.label_photo_url }}
              style={styles.labelPhoto}
              contentFit="cover"
              cachePolicy="memory-disk"
              placeholder={{ uri: LABEL_PHOTO_PLACEHOLDER }}
              transition={200}
            />
          </View>
        ) : null}

        {/* Share buttons at bottom */}
        <View style={styles.shareButtons}>
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>⬆ Share via Text / Email</Text>
          </Pressable>
          <Pressable onPress={() => setShowShareModal(true)} style={[styles.shareButton, styles.shareButtonInApp]}>
            <Text style={[styles.shareButtonText, styles.shareButtonInAppText]}>🍷 Share with App Member</Text>
          </Pressable>
        </View>

        <View style={{ height: Spacing.huge }} />
      </ScrollView>

      {/* In-app share modal */}
      {user && (
        <ShareWithUserModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          entry={entry}
          senderId={user.id}
          senderName={profile?.display_name ?? profile?.email ?? 'A member'}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  deleteConfirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  navBtnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 16,
    color: Colors.gold,
  },
  shareText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.gold,
  },
  deleteText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.red,
  },
  toast: {
    backgroundColor: Colors.ink,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  toastText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.white,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  notesBlock: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  notesLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 6,
  },
  notesText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 14,
    color: Colors.inkMid,
    lineHeight: 21,
  },
  // Notes editing
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  editLink: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.gold,
  },
  notesEmpty: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkFaint,
    fontStyle: 'italic',
  },
  notesEditWrap: {
    gap: Spacing.sm,
    marginTop: 4,
  },
  notesInput: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: Spacing.md,
    minHeight: 110,
    lineHeight: 21,
  },
  notesEditBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  saveBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.gold,
  },
  saveBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  successBanner: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.green,
    backgroundColor: 'rgba(46,107,69,0.08)',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    textAlign: 'center',
  },
  errorBanner: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.red,
    backgroundColor: 'rgba(139,46,46,0.08)',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    textAlign: 'center',
  },

  // Price history + visit form
  priceBlock: {
    gap: Spacing.sm,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  priceRowLeft: {
    gap: 2,
    flex: 1,
  },
  priceType: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  priceLocation: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  priceDate: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkFaint,
  },
  priceValue: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: Colors.ink,
  },
  visitForm: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  visitFormTitle: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 15,
    color: Colors.ink,
  },
  visitFieldWrap: {
    gap: 6,
  },
  visitFieldLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  visitTextInput: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 44,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  typeBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(196,132,122,0.12)',
  },
  typeBtnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  typeBtnTextActive: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.gold,
  },
  priceInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  currencyInput: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    width: 72,
    textAlign: 'center',
    height: 44,
  },
  amountInput: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flex: 1,
    height: 44,
  },
  grapesBlock: {
    gap: 4,
  },
  grapesLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  grapesValue: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMid,
  },
  labelPhotoBlock: {
    marginTop: Spacing.xl,
  },
  labelPhotoLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: Spacing.sm,
  },
  labelPhoto: {
    width: '100%',
    height: 220,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
  },
  shareButtons: {
    gap: Spacing.sm,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  shareButtonInApp: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  shareButtonText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  shareButtonInAppText: {
    color: Colors.gold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.xl,
  },
  errorText: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.inkMuted,
  },
});
