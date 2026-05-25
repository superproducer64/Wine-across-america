import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { LABEL_PHOTO_PLACEHOLDER } from '@/utils/imagePlaceholder';

const { width: SW, height: SH } = Dimensions.get('window');

export interface LabelPhoto {
  uri: string;
  label: string;
  blurhash?: string | null;
}

interface LabelPhotoModalProps {
  visible: boolean;
  onClose: () => void;
  photos: LabelPhoto[];
  wineName?: string;
  initialIndex?: number;
}

export function LabelPhotoModal({
  visible,
  onClose,
  photos,
  wineName,
  initialIndex = 0,
}: LabelPhotoModalProps) {
  const [activeIdx, setActiveIdx] = useState(initialIndex);

  useEffect(() => {
    if (visible) setActiveIdx(initialIndex);
  }, [visible, initialIndex]);

  const current = photos[activeIdx] ?? photos[0];
  if (!current) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* ── Header bar ── */}
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 2 }}>
            {wineName ? (
              <Text style={styles.wineName} numberOfLines={1}>{wineName}</Text>
            ) : null}
            <Text style={styles.photoLabel}>{current.label}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* ── Main image ── */}
        <Pressable style={styles.imageWrap} onPress={() => {}}>
          <Image
            source={{ uri: current.uri }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
            placeholder={current.blurhash ?? LABEL_PHOTO_PLACEHOLDER}
            placeholderContentFit="cover"
            transition={200}
          />
        </Pressable>

        {/* ── Tab strip (only when front + back both exist) ── */}
        {photos.length > 1 && (
          <View style={styles.tabRow}>
            {photos.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.tab, i === activeIdx && styles.tabActive]}
                onPress={() => setActiveIdx(i)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: p.uri }}
                  style={styles.tabThumb}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={150}
                />
                <Text style={[styles.tabText, i === activeIdx && styles.tabTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Tap-outside hint ── */}
        <Text style={styles.hint}>tap outside to close</Text>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 8, 0.93)',
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: Spacing.md,
  },
  wineName: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  photoLabel: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.white,
    opacity: 0.55,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.white,
    opacity: 0.75,
  },

  // Main image
  imageWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: Math.min(SW - 48, 480),
    height: SH * 0.62,
    borderRadius: Radius.md,
  },

  // Tab strip
  tabRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    alignItems: 'center',
    gap: 6,
    opacity: 0.45,
  },
  tabActive: {
    opacity: 1,
  },
  tabThumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    fontFamily: Fonts.dmSansMedium,
  },

  // Hint
  hint: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 11,
    color: Colors.white,
    opacity: 0.3,
    letterSpacing: 0.3,
  },
});
