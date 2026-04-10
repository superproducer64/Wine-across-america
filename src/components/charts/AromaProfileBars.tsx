import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AROMA_CATEGORIES } from '@/types';
import { Colors, Fonts, Radius, Spacing } from '@/theme';

interface AromaProfileBarsProps {
  aromasL1: string[];
  maxBars?: number;
}

export function AromaProfileBars({ aromasL1, maxBars = 6 }: AromaProfileBarsProps) {
  if (!aromasL1.length) return null;

  // Count occurrences of each category
  const counts: Record<string, number> = {};
  aromasL1.forEach((id) => {
    counts[id] = (counts[id] ?? 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxBars);

  const maxCount = sorted[0]?.[1] ?? 1;

  return (
    <View style={styles.container}>
      {sorted.map(([id, count]) => {
        const category = AROMA_CATEGORIES.find((c) => c.id === id);
        if (!category) return null;
        const fillPct = (count / maxCount) * 100;
        return (
          <View key={id} style={styles.row}>
            <Text style={styles.emoji}>{category.emoji}</Text>
            <View style={styles.barWrap}>
              <Text style={styles.barLabel}>{category.label}</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${fillPct}%` }]} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
  },
  barWrap: {
    flex: 1,
  },
  barLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
    marginBottom: 2,
  },
  track: {
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
  },
});
