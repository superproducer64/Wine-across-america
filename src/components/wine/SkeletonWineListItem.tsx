import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, DimensionValue } from 'react-native';
import { Colors, Radius, Spacing } from '@/theme';

function SkeletonBlock({
  width,
  height,
  opacity,
  style,
}: {
  width: DimensionValue;
  height: number;
  opacity: Animated.Value;
  style?: object;
}) {
  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: Radius.sm,
          backgroundColor: Colors.surfaceAlt,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonWineListItem() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View style={styles.container}>
      {/* Flag/icon column */}
      <SkeletonBlock width={36} height={36} opacity={opacity} style={styles.iconBlock} />

      {/* Text lines */}
      <View style={styles.info}>
        <SkeletonBlock width="70%" height={14} opacity={opacity} />
        <SkeletonBlock width="50%" height={11} opacity={opacity} />
        <SkeletonBlock width="35%" height={10} opacity={opacity} />
      </View>

      {/* Score column */}
      <View style={styles.scoreCol}>
        <SkeletonBlock width={32} height={22} opacity={opacity} />
        <SkeletonBlock width={24} height={9} opacity={opacity} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  iconBlock: {
    borderRadius: Radius.md,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  scoreCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
});
