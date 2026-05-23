import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  clamp,
} from 'react-native-reanimated';
import { Colors, Fonts, Spacing } from '@/theme';

interface FlavorWheelSheetProps {
  visible: boolean;
  onClose: () => void;
}

const SOURCE = require('../../../assets/flavor-wheel.jpg');
const FALLBACK_H_W_RATIO = 2200 / 1700;
const MIN_SCALE = 1;
const MAX_SCALE = 5;

export function FlavorWheelSheet({ visible, onClose }: FlavorWheelSheetProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [imageHeight, setImageHeight] = React.useState(screenWidth * FALLBACK_H_W_RATIO);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetTransform = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
    savedScale.value = 1;
    translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.05) {
        resetTransform();
      }
    });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      const maxX = (screenWidth * (scale.value - 1)) / 2;
      const maxY = (imageHeight * (scale.value - 1)) / 2;
      translateX.value = clamp(savedTranslateX.value + e.translationX, -maxX, maxX);
      translateY.value = clamp(savedTranslateY.value + e.translationY, -maxY, maxY);
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      resetTransform();
    });

  const composed = Gesture.Simultaneous(
    Gesture.Race(doubleTap, panGesture),
    pinchGesture,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handleClose = () => {
    resetTransform();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Wine Flavor Wheel</Text>
              <Text style={styles.hint}>Pinch to zoom · Double-tap to reset</Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={16}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Zoomable image */}
          <View style={[styles.imageContainer, { height: screenHeight - 110 }]}>
            <GestureDetector gesture={composed}>
              <Animated.View style={[styles.animatedWrap, animatedStyle]}>
                <Image
                  source={SOURCE}
                  style={{ width: screenWidth, height: imageHeight }}
                  resizeMode="contain"
                  onLoad={(e) => {
                    const { width, height } = e.nativeEvent.source;
                    if (width && height) {
                      setImageHeight(screenWidth * (height / width));
                    }
                  }}
                />
              </Animated.View>
            </GestureDetector>
          </View>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
    gap: 4,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.gold,
  },
  hint: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
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
  imageContainer: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
