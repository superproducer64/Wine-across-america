import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { WineEntry, TECHNICAL_CATEGORIES } from '@/types';

interface TechnicalScoreDisplayProps {
  entry: Partial<WineEntry>;
}

export function TechnicalScoreDisplay({ entry }: TechnicalScoreDisplayProps) {
  const total = entry.technical_score ?? 0;

  const scoreLabel = (score: number): string => {
    if (score >= 90) return 'Outstanding';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    return 'Fair';
  };

  return (
    <View style={styles.container}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Technical Score</Text>
        <View style={styles.totalBadge}>
          <Text style={styles.totalScore}>{total}</Text>
          <Text style={styles.totalMax}>/100</Text>
        </View>
      </View>
      <Text style={styles.tier}>{scoreLabel(total)}</Text>

      <View style={styles.breakdown}>
        {TECHNICAL_CATEGORIES.map(({ key, label }) => {
          const val: number = (entry[key] as number | undefined) ?? 0;
          return (
            <View key={key} style={styles.row}>
              <Text style={styles.catLabel}>{label}</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(val / 20) * 100}%` }]} />
              </View>
              <Text style={styles.catScore}>{val}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  totalLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  totalScore: {
    fontFamily: Fonts.playfair,
    fontSize: 28,
    color: Colors.gold,
    lineHeight: 32,
  },
  totalMax: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
  },
  tier: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 13,
    color: Colors.goldLight,
    marginBottom: Spacing.md,
  },
  breakdown: {
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(201,168,76,0.15)',
    paddingTop: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    width: 90,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.full,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
  },
  catScore: {
    fontFamily: Fonts.playfair,
    fontSize: 13,
    color: Colors.gold,
    width: 22,
    textAlign: 'right',
  },
});
