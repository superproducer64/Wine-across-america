import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing } from '@/theme';
import { CheeseScore } from '@/types';

interface Props {
  scores: CheeseScore;
  dark?: boolean;
}

const BARS: Array<{
  leftLabel: string;
  rightLabel: string;
  getValue: (s: CheeseScore) => number;
  colors: readonly [string, string, ...string[]];
}> = [
  {
    leftLabel:  'Mild',
    rightLabel: 'Pungent',
    getValue:   (s) => (s.aroma + s.flavor_intensity) / 20,
    colors:     ['#D4C99A', '#8B5E1A'],
  },
  {
    leftLabel:  'Soft',
    rightLabel: 'Firm',
    getValue:   (s) => s.texture / 10,
    colors:     ['#C4D4B0', '#2E5C3A'],
  },
  {
    leftLabel:  'Lactic',
    rightLabel: 'Savory',
    getValue:   (s) => s.flavor_intensity / 10,
    colors:     ['#B8D4D4', '#2E4E6B'],
  },
  {
    leftLabel:  'Young',
    rightLabel: 'Aged',
    getValue:   (s) => (s.complexity + s.finish) / 20,
    colors:     ['#D4C0A0', '#5C3D1E'],
  },
];

export function StyleSummaryBar({ scores, dark = false }: Props) {
  const labelColor = dark ? 'rgba(255,255,255,0.4)' : Colors.inkMuted;
  const emptyColor = dark ? 'rgba(255,255,255,0.08)' : Colors.border;

  return (
    <View style={styles.container}>
      {BARS.map((bar) => {
        const pos = Math.max(0.02, Math.min(0.98, bar.getValue(scores)));
        return (
          <View key={bar.leftLabel} style={styles.row}>
            <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
              {bar.leftLabel}
            </Text>

            <View style={styles.trackOuter}>
              {/* Filled portion — gradient */}
              <LinearGradient
                colors={bar.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.trackFill, { flex: pos }]}
              />
              {/* Dot at boundary */}
              <View style={[styles.dot, { backgroundColor: dark ? '#fff' : Colors.ink }]} />
              {/* Empty portion */}
              <View style={[styles.trackEmpty, { flex: 1 - pos, backgroundColor: emptyColor }]} />
            </View>

            <Text style={[styles.label, styles.labelRight, { color: labelColor }]} numberOfLines={1}>
              {bar.rightLabel}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    width: 44,
  },
  labelRight: {
    textAlign: 'right',
  },
  trackOuter: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
  },
  trackFill: {
    height: 6,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: -1,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  trackEmpty: {
    flex: 1,
    height: 6,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
});
