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
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { TextInput } from '@/components/ui/TextInput';
import { runOcr, parseWineLabelText, WineLabelData } from '@/utils/wineOcr';
import { uploadLabelPhoto } from '@/lib/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
  onApply: (data: Partial<WineLabelData> & { photoUrl?: string }) => void;
  userId: string;
}

type Phase = 'pick' | 'scanning' | 'uploading' | 'review' | 'error';

export function LabelScannerModal({ visible, onClose, onApply, userId }: Props) {
  const [phase, setPhase] = useState<Phase>('pick');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Editable extracted fields
  const [name, setName] = useState('');
  const [producer, setProducer] = useState('');
  const [vintageStr, setVintageStr] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [appellation, setAppellation] = useState('');
  const [rawText, setRawText] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

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
    setRawText('');
    setPhotoUrl(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processImage = async (uri: string) => {
    setImageUri(uri);
    setPhase('scanning');

    // Upload photo to Supabase Storage
    setPhase('uploading');
    const { url } = await uploadLabelPhoto(userId, uri);
    setPhotoUrl(url);

    // OCR (web only)
    setPhase('scanning');
    let extracted: WineLabelData = {
      name: '', producer: '', vintage: null,
      country: '', region: '', appellation: '', rawText: '',
    };

    if (Platform.OS === 'web') {
      try {
        const text = await runOcr(uri);
        setRawText(text);
        extracted = parseWineLabelText(text);
      } catch {
        // OCR failed — still show review with photo
      }
    }

    setName(extracted.name);
    setProducer(extracted.producer);
    setVintageStr(extracted.vintage ? String(extracted.vintage) : '');
    setCountry(extracted.country);
    setRegion(extracted.region);
    setAppellation(extracted.appellation);
    setPhase('review');
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
      photoUrl: photoUrl ?? undefined,
    });
    reset();
    onClose();
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
                <Text style={styles.pickTitle}>Photograph the Label</Text>
                <Text style={styles.pickSubtitle}>
                  Point your camera at the wine label. The app will read the text and
                  pre-fill the entry form for you.
                </Text>
                {Platform.OS !== 'web' && (
                  <View style={styles.nativeNote}>
                    <Text style={styles.nativeNoteText}>
                      Note: Text recognition works best in the web version.
                      On mobile, the photo will be saved for reference.
                    </Text>
                  </View>
                )}
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
                <Text style={styles.loadingText}>
                  {phase === 'uploading' ? 'Saving photo…' : 'Reading label…'}
                </Text>
                <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
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

                <Text style={styles.reviewHint}>
                  {Platform.OS === 'web' && rawText
                    ? 'Review and edit the extracted information below.'
                    : 'Fill in the details from the label, or skip to save with just the photo.'}
                </Text>

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
