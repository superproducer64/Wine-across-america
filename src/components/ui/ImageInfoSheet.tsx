import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { Colors, Fonts, Spacing } from '@/theme';

interface ImageInfoSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  source: ImageSourcePropType;
  scrollHint?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const FALLBACK_RATIO = 2200 / 1700;

export function ImageInfoSheet({ visible, onClose, title, source, scrollHint }: ImageInfoSheetProps) {
  const asset = Image.resolveAssetSource(source);
  const imageHeight = asset && asset.width > 0
    ? SCREEN_WIDTH * (asset.height / asset.width)
    : SCREEN_WIDTH * FALLBACK_RATIO;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {scrollHint ? (
              <View style={styles.scrollHintPill}>
                <Text style={styles.scrollHintText}>{scrollHint}</Text>
              </View>
            ) : null}
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={16}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <Image
            source={source}
            style={[styles.image, { height: imageHeight }]}
            resizeMode="contain"
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1014',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 52,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
    gap: 6,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.gold,
  },
  scrollHintPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(196,132,122,0.18)',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#C4847A',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  scrollHintText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: '#C4847A',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  image: {
    width: SCREEN_WIDTH,
  },
});
