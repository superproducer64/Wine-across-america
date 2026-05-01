import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { TextInput } from '@/components/ui/TextInput';
import { analyzeWineLabelWithAI, WineLabelData } from '@/utils/wineOcr';
import { uploadLabelPhoto } from '@/lib/supabase';
import { useWineStore } from '@/stores/wineStore';
import { WineEntry } from '@/types';
import type { MainStackParamList } from '@/navigation/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (data: Partial<WineLabelData> & { photoUrl?: string }) => void;
  userId: string;
}

type Phase = 'pick' | 'scanning' | 'uploading' | 'recognition' | 'review' | 'error';

interface WineMatch {
  entry: WineEntry;
  matchType: 'exact' | 'same_winery';
}

function formatMatchDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function findMatches(entries: WineEntry[], producer: string, vintageStr: string): WineMatch[] {
  const producerLower = producer.trim().toLowerCase();
  if (!producerLower) return [];
  const vintage = vintageStr ? parseInt(vintageStr) : null;
  const matches: WineMatch[] = [];

  for (const entry of entries) {
    const entryProducer = (entry.producer || entry.name || '').toLowerCase();
    if (!entryProducer.includes(producerLower) && !producerLower.includes(entryProducer)) continue;
    const isExact = vintage !== null && entry.vintage === vintage;
    matches.push({ entry, matchType: isExact ? 'exact' : 'same_winery' });
  }

  // Sort: exact matches first, then by most recent tasting date
  matches.sort((a, b) => {
    if (a.matchType === 'exact' && b.matchType !== 'exact') return -1;
    if (b.matchType === 'exact' && a.matchType !== 'exact') return 1;
    return new Date(b.entry.tasting_date).getTime() - new Date(a.entry.tasting_date).getTime();
  });

  return matches.slice(0, 3);
}

export function LabelScannerModal({ visible, onClose, onApply, userId }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { entries } = useWineStore();

  const [phase, setPhase] = useState<Phase>('pick');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [matches, setMatches] = useState<WineMatch[]>([]);

  // Editable extracted fields
  const [name, setName] = useState('');
  const [producer, setProducer] = useState('');
  const [vintageStr, setVintageStr] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [appellation, setAppellation] = useState('');
  const [grapes, setGrapes] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);

  const reset = () => {
    setPhase('pick');
    setImageUri(null);
    setErrorMsg('');
    setName('');
    setProducer('');
    setVintageStr('');
    setCountry('');
    setRegion('');
    setAppellation('');
    setGrapes([]);
    setPhotoUrl(null);
    setAiSuccess(false);
    setMatches([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processImage = async (uri: string) => {
    setImageUri(uri);
    setPhase('uploading');

    const [uploadResult, extracted] = await Promise.all([
      uploadLabelPhoto(userId, uri),
      analyzeWineLabelWithAI(uri),
    ]);

    setPhotoUrl(uploadResult.url);

    const hasData = !!(extracted.name || extracted.producer || extracted.country || extracted.vintage);
    setAiSuccess(hasData);

    setName(extracted.name);
    setProducer(extracted.producer);
    setVintageStr(extracted.vintage ? String(extracted.vintage) : '');
    setCountry(extracted.country);
    setRegion(extracted.region);
    setAppellation(extracted.appellation);
    setGrapes(extracted.grapes ?? []);

    // Check history for matches before going to review
    const found = findMatches(entries, extracted.producer, extracted.vintage ? String(extracted.vintage) : '');
    setMatches(found);
    setPhase(found.length > 0 ? 'recognition' : 'review');
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Camera permission denied.');
      setPhase('error');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const uri = asset.base64
      ? `data:image/jpeg;base64,${asset.base64}`
      : asset.uri;
    await processImage(uri);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Photo library permission denied.');
      setPhase('error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const uri = asset.base64
      ? `data:image/jpeg;base64,${asset.base64}`
      : asset.uri;
    await processImage(uri);
  };

  const handleApply = () => {
    onApply({
      name: name.trim() || undefined,
      producer: producer.trim() || undefined,
      vintage: vintageStr ? parseInt(vintageStr) || null : null,
      country: country.trim() || undefined,
      region: region.trim() || undefined,
      appellation: appellation.trim() || undefined,
      grapes: grapes.length > 0 ? grapes : undefined,
      photoUrl: photoUrl ?? undefined,
    });
    reset();
    onClose();
  };

  // Navigate to existing wine's detail screen to log a visit there
  const handleLogVisit = (entryId: string) => {
    reset();
    onClose();
    navigation.navigate('WineDetail', { entryId });
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
            <Text style={styles.title}>Scan Wine Label</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Phase: pick ── */}
            {phase === 'pick' && (
              <View style={styles.pickPhase}>
                <Text style={styles.pickIcon}>📸</Text>
                <Text style={styles.pickTitle}>Scan Wine Label</Text>
                <Text style={styles.pickSubtitle}>
                  Take a photo of the label and AI will instantly identify the wine,
                  winery, vintage, region, and grape varieties.
                </Text>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>✨ Powered by GPT-4o Vision</Text>
                </View>
                <View style={styles.pickButtons}>
                  <Pressable style={styles.pickBtn} onPress={pickFromCamera}>
                    <Text style={styles.pickBtnIcon}>📷</Text>
                    <Text style={styles.pickBtnText}>Camera</Text>
                  </Pressable>
                  <Pressable style={styles.pickBtn} onPress={pickFromGallery}>
                    <Text style={styles.pickBtnIcon}>🖼️</Text>
                    <Text style={styles.pickBtnText}>Gallery</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* ── Phase: scanning / uploading ── */}
            {(phase === 'scanning' || phase === 'uploading') && (
              <View style={styles.loadingPhase}>
                {imageUri && (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                )}
                <ActivityIndicator color={Colors.gold} size="large" style={{ marginTop: 24 }} />
                <Text style={styles.loadingText}>Analyzing label with AI…</Text>
                <Text style={styles.loadingSubtext}>GPT-4o Vision is reading your wine label</Text>
              </View>
            )}

            {/* ── Phase: recognition ── */}
            {phase === 'recognition' && (
              <View style={styles.recognitionPhase}>
                {imageUri && (
                  <Image source={{ uri: imageUri }} style={styles.recognitionImage} />
                )}

                <View style={styles.recognitionHeader}>
                  <Text style={styles.recognitionIcon}>🍷</Text>
                  <Text style={styles.recognitionTitle}>We know this wine!</Text>
                  <Text style={styles.recognitionSubtitle}>
                    {matches[0]?.matchType === 'exact'
                      ? `You've had this exact vintage before.`
                      : `You've had wine from this winery before.`}
                  </Text>
                </View>

                {matches.map((match) => {
                  const e = match.entry;
                  const lastPrice = e.price.length > 0 ? e.price[e.price.length - 1] : null;
                  return (
                    <View key={e.id} style={styles.matchCard}>
                      <View style={styles.matchCardTop}>
                        <View style={styles.matchBadge}>
                          <Text style={styles.matchBadgeText}>
                            {match.matchType === 'exact' ? '✓ Same vintage' : '🔄 Different vintage'}
                          </Text>
                        </View>
                        {e.technical_score > 0 && (
                          <View style={styles.scorePill}>
                            <Text style={styles.scorePillText}>{e.technical_score}</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.matchName}>
                        {e.name || e.producer}{e.vintage ? ` ${e.vintage}` : ''}
                      </Text>
                      {match.matchType === 'same_winery' && e.vintage ? (
                        <Text style={styles.matchVintageDiff}>
                          You had the {e.vintage} vintage — this label shows {vintageStr || 'a different vintage'}
                        </Text>
                      ) : null}

                      <View style={styles.matchMeta}>
                        {e.tasting_date ? (
                          <Text style={styles.matchMetaText}>🗓 {formatMatchDate(e.tasting_date)}</Text>
                        ) : null}
                        {e.location_name ? (
                          <Text style={styles.matchMetaText}>📍 {e.location_name}</Text>
                        ) : null}
                        {lastPrice ? (
                          <Text style={styles.matchMetaText}>
                            {lastPrice.type === 'glass' ? '🥂' : '🍾'} {lastPrice.currency} {lastPrice.amount.toFixed(2)}
                          </Text>
                        ) : null}
                      </View>

                      <Pressable
                        style={styles.logVisitBtn}
                        onPress={() => handleLogVisit(e.id)}
                      >
                        <Text style={styles.logVisitBtnText}>Log a visit to this wine →</Text>
                      </Pressable>
                    </View>
                  );
                })}

                <View style={styles.recognitionDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Pressable style={styles.newEntryBtn} onPress={() => setPhase('review')}>
                  <Text style={styles.newEntryBtnText}>Add as a new entry</Text>
                </Pressable>
                <Text style={styles.newEntryHint}>
                  Creates a separate log — useful for tracking different vintages or tastings side by side.
                </Text>
              </View>
            )}

            {/* ── Phase: review ── */}
            {phase === 'review' && (
              <View style={styles.reviewPhase}>
                {/* Photo preview */}
                {imageUri && (
                  <View style={styles.photoPreviewWrap}>
                    <Image source={{ uri: imageUri }} style={styles.reviewImage} />
                    {photoUrl && (
                      <View style={styles.savedBadge}>
                        <Text style={styles.savedBadgeText}>📎 Photo saved</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* AI result banner */}
                {aiSuccess ? (
                  <View style={styles.aiSuccessBanner}>
                    <Text style={styles.aiSuccessText}>✨ AI identified this wine — review and confirm below</Text>
                  </View>
                ) : (
                  <Text style={styles.reviewHint}>
                    AI couldn't confidently read this label. Fill in what you can.
                  </Text>
                )}

                <TextInput
                  label="Wine Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Château Margaux"
                />
                <TextInput
                  label="Producer / Winery"
                  value={producer}
                  onChangeText={setProducer}
                  placeholder="e.g., Château Margaux"
                />
                <TextInput
                  label="Vintage"
                  value={vintageStr}
                  onChangeText={setVintageStr}
                  keyboardType="number-pad"
                  placeholder="e.g., 2019"
                />
                <TextInput
                  label="Country"
                  value={country}
                  onChangeText={setCountry}
                  placeholder="e.g., France"
                />
                <TextInput
                  label="Region"
                  value={region}
                  onChangeText={setRegion}
                  placeholder="e.g., Bordeaux"
                />
                <TextInput
                  label="Appellation"
                  value={appellation}
                  onChangeText={setAppellation}
                  placeholder="e.g., Margaux"
                />

                {/* Grapes identified by AI */}
                {grapes.length > 0 && (
                  <View style={styles.grapesWrap}>
                    <Text style={styles.grapesLabel}>Grape Varieties Detected</Text>
                    <View style={styles.grapeChips}>
                      {grapes.map((g) => (
                        <View key={g} style={styles.grapeChip}>
                          <Text style={styles.grapeChipText}>{g}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={styles.grapesHint}>These will be added to the grape blends section</Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.reviewActions}>
                  <Pressable style={styles.applyBtn} onPress={handleApply}>
                    <Text style={styles.applyBtnText}>Apply to Entry</Text>
                  </Pressable>
                  <Pressable style={styles.retakeBtn} onPress={() => setPhase('pick')}>
                    <Text style={styles.retakeBtnText}>Retake</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* ── Phase: error ── */}
            {phase === 'error' && (
              <View style={styles.errorPhase}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorMsg}>{errorMsg}</Text>
                <Pressable style={styles.retakeBtn} onPress={() => setPhase('pick')}>
                  <Text style={styles.retakeBtnText}>Try Again</Text>
                </Pressable>
              </View>
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
  closeBtn: { padding: Spacing.sm },
  closeBtnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 16,
    color: Colors.inkMuted,
  },
  body: {
    padding: Spacing.xl,
    flexGrow: 1,
  },

  // Pick phase
  pickPhase: {
    alignItems: 'center',
    paddingTop: Spacing.huge,
    gap: Spacing.lg,
  },
  pickIcon: { fontSize: 52 },
  pickTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
  },
  pickSubtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
  },
  nativeNote: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  nativeNoteText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  pickButtons: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  pickBtn: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 110,
    ...Shadows.md,
  },
  pickBtnIcon: { fontSize: 28 },
  pickBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.gold,
  },

  // Loading phase
  loadingPhase: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: Radius.lg,
    resizeMode: 'cover',
  },
  loadingText: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.ink,
    marginTop: Spacing.lg,
  },
  loadingSubtext: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    marginTop: 4,
  },

  // Recognition phase
  recognitionPhase: {
    gap: Spacing.lg,
  },
  recognitionImage: {
    width: '100%',
    height: 160,
    borderRadius: Radius.lg,
    resizeMode: 'cover',
  },
  recognitionHeader: {
    alignItems: 'center',
    gap: 6,
  },
  recognitionIcon: {
    fontSize: 36,
  },
  recognitionTitle: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
  },
  recognitionSubtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  matchCard: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  matchCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchBadge: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
  },
  matchBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  scorePill: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
  },
  scorePillText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  matchName: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 17,
    color: Colors.ink,
    lineHeight: 23,
  },
  matchVintageDiff: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  matchMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  matchMetaText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  logVisitBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  logVisitBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  recognitionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkFaint,
  },
  newEntryBtn: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.surface,
  },
  newEntryBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  newEntryHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkFaint,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: -Spacing.sm,
  },

  // Review phase
  reviewPhase: {
    gap: Spacing.sm,
  },
  photoPreviewWrap: {
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  reviewImage: {
    width: '100%',
    height: 180,
    borderRadius: Radius.lg,
    resizeMode: 'cover',
  },
  savedBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  savedBadgeText: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.white,
  },
  reviewHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    marginBottom: Spacing.sm,
    lineHeight: 19,
  },
  reviewActions: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  applyBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  applyBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: Colors.ink,
  },
  retakeBtn: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  retakeBtnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMuted,
  },

  // AI badge (pick phase)
  aiBadge: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
  },
  aiBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.gold,
  },

  // AI success banner (review phase)
  aiSuccessBanner: {
    backgroundColor: '#F0F9F0',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: '#A8D5A2',
    marginBottom: Spacing.sm,
  },
  aiSuccessText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: '#2D7A27',
    textAlign: 'center',
  },

  // Grapes section
  grapesWrap: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  grapesLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  grapeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  grapeChip: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  grapeChipText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.gold,
  },
  grapesHint: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 11,
    color: Colors.inkMuted,
    fontStyle: 'italic',
  },

  // Error phase
  errorPhase: {
    alignItems: 'center',
    paddingTop: Spacing.huge,
    gap: Spacing.lg,
  },
  errorIcon: { fontSize: 40 },
  errorMsg: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.red,
    textAlign: 'center',
  },
});
