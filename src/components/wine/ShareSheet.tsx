import React, { useRef, useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { WineEntry } from '@/types';
import { WineCardTemplate, CARD_WIDTH, CARD_HEIGHT } from '@/components/wine/WineCardTemplate';
import { shareToInstagramStoriesOrFallback } from '@/utils/instagramShare';

interface Props {
  visible: boolean;
  onClose: () => void;
  entry: WineEntry;
  onShareText: () => void;
  onShareWithMember: () => void;
}

export function ShareSheet({ visible, onClose, entry, onShareText, onShareWithMember }: Props) {
  const cardRef = useRef<View>(null);
  const [sharingSocial, setSharingSocial] = useState(false);
  const [socialError, setSocialError] = useState('');

  const handleShareText = () => {
    onClose();
    onShareText();
  };

  const handleShareWithMember = () => {
    onClose();
    onShareWithMember();
  };

  const photoReadyRef = useRef(false);
  const pendingCaptureRef = useRef<(() => void) | null>(null);

  const handlePhotoReady = () => {
    photoReadyRef.current = true;
    pendingCaptureRef.current?.();
    pendingCaptureRef.current = null;
  };

  const handleShareOnSocial = () => {
    setSocialError('');
    setSharingSocial(true);

    const doCapture = async () => {
      try {
        const uri = await captureRef(cardRef, {
          format: 'png',
          quality: 1,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        });
        const shared = await shareToInstagramStoriesOrFallback(uri);
        setSharingSocial(false);
        if (shared) {
          onClose();
        } else {
          setSocialError('Sharing is not available on this device.');
        }
      } catch (err) {
        console.warn('Share on Social failed:', err);
        setSharingSocial(false);
        setSocialError('Could not share the card. Please try again.');
      }
    };

    if (photoReadyRef.current) {
      doCapture();
      return;
    }

    // Photo hasn't signalled ready yet (rare — the card is normally already
    // mounted by the time this button is reachable). Wait for it, with a
    // safety net in case the signal never arrives (e.g. a network hang).
    let captured = false;
    const runOnce = () => {
      if (captured) return;
      captured = true;
      doCapture();
    };
    const maxWaitTimer = setTimeout(runOnce, 4000);
    pendingCaptureRef.current = () => {
      clearTimeout(maxWaitTimer);
      setTimeout(runOnce, 50);
    };
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={sharingSocial ? undefined : onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Share This Wine</Text>

          <Pressable style={styles.option} onPress={handleShareText} disabled={sharingSocial}>
            <Text style={styles.optionIcon}>⬆</Text>
            <Text style={styles.optionText}>Text / Email</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={handleShareWithMember} disabled={sharingSocial}>
            <Text style={styles.optionIcon}>🍷</Text>
            <Text style={styles.optionText}>Share with App Member</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={handleShareOnSocial} disabled={sharingSocial}>
            {sharingSocial ? (
              <ActivityIndicator size="small" color={Colors.gold} style={styles.optionIcon} />
            ) : (
              <Text style={styles.optionIcon}>📷</Text>
            )}
            <Text style={styles.optionText}>Share on Social</Text>
          </Pressable>

          {socialError ? <Text style={styles.errorText}>{socialError}</Text> : null}

          <Pressable style={styles.cancelBtn} onPress={onClose} disabled={sharingSocial}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>

      {/* Off-screen capture target — same finished card used by "Send to PAA member". */}
      <View style={styles.offscreen} pointerEvents="none">
        <View ref={cardRef} collapsable={false}>
          <WineCardTemplate entry={entry} onReady={handlePhotoReady} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 10, 12, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
    ...Shadows.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 18,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  optionIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  optionText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: Colors.ink,
  },
  errorText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.red,
    textAlign: 'center',
  },
  cancelBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  cancelBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: Colors.inkMuted,
  },
  offscreen: {
    position: 'absolute',
    top: 0,
    left: -100000,
  },
});
