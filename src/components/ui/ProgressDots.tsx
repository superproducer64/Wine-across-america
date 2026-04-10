import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radius } from '@/theme';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current && styles.activeDot,
            i < current && styles.completedDot,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  activeDot: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
    width: 22,
    borderRadius: 4,
  },
  completedDot: {
    backgroundColor: Colors.goldLight,
    borderColor: Colors.gold,
  },
});
