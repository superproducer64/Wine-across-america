import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  ImageSourcePropType,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Colors, Fonts, Spacing } from '@/theme';

interface ImageInfoSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  sources: ImageSourcePropType[];
  initialIndex?: number;
}

const FALLBACK_H_W_RATIO = 2200 / 1700;

export function ImageInfoSheet({
  visible,
  onClose,
  title,
  sources,
  initialIndex = 0,
}: ImageInfoSheetProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [ratios, setRatios] = useState<number[]>(
    sources.map(() => FALLBACK_H_W_RATIO),
  );
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    if (page !== currentIndex) setCurrentIndex(page);
  };

  const handleLayout = () => {
    if (scrollRef.current && initialIndex > 0) {
      scrollRef.current.scrollTo({ x: initialIndex * screenWidth, animated: false });
    }
  };

  const setRatio = (index: number, ratio: number) => {
    setRatios(prev => {
      const next = [...prev];
      next[index] = ratio;
      return next;
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={16}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={handleLayout}
          style={styles.carousel}
          contentContainerStyle={{ alignItems: 'flex-start' }}
        >
          {sources.map((src, i) => (
            <ScrollView
              key={i}
              style={{ width: screenWidth }}
              contentContainerStyle={styles.pageContent}
              showsVerticalScrollIndicator={false}
              bounces
            >
              <Image
                source={src}
                style={{ width: screenWidth, height: screenWidth * ratios[i] }}
                resizeMode="contain"
                onLoad={(e) => {
                  const { width, height } = e.nativeEvent.source;
                  if (width && height) setRatio(i, height / width);
                }}
              />
            </ScrollView>
          ))}
        </ScrollView>

        {sources.length > 1 && (
          <View style={styles.dots}>
            {sources.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 52,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.gold,
    flex: 1,
    paddingRight: 12,
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
  carousel: {
    flex: 1,
  },
  pageContent: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingBottom: 28,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: '#C4847A',
    width: 18,
    borderRadius: 3,
  },
});
