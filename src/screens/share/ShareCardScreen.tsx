import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { WineCardTemplate, CARD_WIDTH, CARD_HEIGHT } from '@/components/wine/WineCardTemplate';
import { ShareCardToMemberModal } from '@/components/wine/ShareCardToMemberModal';
import { useWineStore } from '@/stores/wineStore';
import { useAuthStore } from '@/stores/authStore';
import { MainStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'ShareCard'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const PREVIEW_WIDTH = Math.min(SCREEN_WIDTH - Spacing.xl * 2, 420);
const CARD_ASPECT = CARD_WIDTH / CARD_HEIGHT;

export function ShareCardScreen({ route, navigation }: Props) {
  const { entryId } = route.params;
  const { entries } = useWineStore();
  const { user } = useAuthStore();
  const entry = entries.find((e) => e.id === entryId) ?? null;

  const cardRef = useRef<View>(null);
  const [cardUri, setCardUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(true);
  const [captureError, setCaptureError] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [externalError, setExternalError] = useState('');

  useEffect(() => {
    if (!entry) return;
    let cancelled = false;
    setCapturing(true);
    setCaptureError('');
    // Give the off-screen template a frame to finish its first paint before capturing.
    const timer = setTimeout(async () => {
      try {
        const uri = await captureRef(cardRef, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        });
        if (!cancelled) setCardUri(uri);
      } catch {
        if (!cancelled) setCaptureError('Could not generate the card image.');
      } finally {
        if (!cancelled) setCapturing(false);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [entry]);

  const handleShareExternally = async () => {
    if (!cardUri) return;
    setExternalError('');
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setExternalError('Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(cardUri, { mimeType: 'image/png', UTI: 'public.png' });
    } catch {
      // user cancelled — do nothing
    }
  };

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Wine not found.</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navbar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>Share Card</Text>
        <View style={styles.navBtn} />
      </View>

      <View style={styles.previewArea}>
        <View style={[styles.previewFrame, { width: PREVIEW_WIDTH, height: PREVIEW_WIDTH / CARD_ASPECT }]}>
          {cardUri ? (
            <Image source={{ uri: cardUri }} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <View style={styles.previewPlaceholder}>
              <ActivityIndicator color={Colors.gold} />
              <Text style={styles.capturingText}>Preparing your card…</Text>
            </View>
          )}
        </View>
        {captureError ? <Text style={styles.errorText}>{captureError}</Text> : null}
      </View>

      {/* Off-screen, full-resolution instance used only as the capture target. */}
      <View style={styles.offscreen} pointerEvents="none">
        <View ref={cardRef} collapsable={false}>
          <WineCardTemplate entry={entry} />
        </View>
      </View>

      {externalError ? <Text style={styles.errorText}>{externalError}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionBtn, styles.actionBtnPrimary, (!cardUri || capturing) && styles.actionBtnDisabled]}
          onPress={() => setShowMemberModal(true)}
          disabled={!cardUri || capturing}
        >
          <Text style={styles.actionBtnPrimaryText}>Send to PAA member</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, (!cardUri || capturing) && styles.actionBtnDisabled]}
          onPress={handleShareExternally}
          disabled={!cardUri || capturing}
        >
          <Text style={styles.actionBtnText}>Share externally</Text>
        </Pressable>
      </View>

      {cardUri && user && (
        <ShareCardToMemberModal
          visible={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          entry={entry}
          senderId={user.id}
          cardImageUri={cardUri}
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
  navBtn: { paddingVertical: 6, paddingHorizontal: 4, minWidth: 56 },
  navBtnText: { fontFamily: Fonts.dmSansRegular, fontSize: 16, color: Colors.gold },
  navTitle: { fontFamily: Fonts.playfair, fontSize: 16, color: Colors.ink },
  previewArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  previewFrame: {
    overflow: 'hidden',
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  capturingText: { fontFamily: Fonts.dmSans, fontSize: 13, color: Colors.inkMuted },
  offscreen: {
    position: 'absolute',
    top: 0,
    left: -100000,
  },
  errorText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.red,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  backLink: { padding: Spacing.md },
  backLinkText: { fontFamily: Fonts.dmSansMedium, fontSize: 14, color: Colors.gold },
  actions: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { fontFamily: Fonts.dmSansMedium, fontSize: 14, color: Colors.gold, letterSpacing: 0.3 },
  actionBtnPrimaryText: { fontFamily: Fonts.dmSansMedium, fontSize: 14, color: Colors.gold, letterSpacing: 0.3 },
});
