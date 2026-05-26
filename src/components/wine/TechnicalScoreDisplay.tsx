import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { WineEntry, TECHNICAL_CATEGORIES, TechnicalCategory } from '@/types';
import { InfoPopover } from '@/components/ui/InfoPopover';

interface TechnicalScoreDisplayProps {
  entry: Partial<WineEntry>;
}

export function TechnicalScoreDisplay({ entry }: TechnicalScoreDisplayProps) {
  const total = entry.technical_score ?? 0;
  const [active, setActive] = useState<TechnicalCategory | null>(null);

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
        {TECHNICAL_CATEGORIES.map((cat) => {
          const val: number = (entry[cat.key] as number | undefined) ?? 0;
          return (
            <TouchableOpacity
              key={cat.key}
              style={styles.row}
              onPress={() => setActive(cat)}
              activeOpacity={0.6}
            >
              <Text style={styles.catLabel}>{cat.label}</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${(val / 20) * 100}%` }]} />
              </View>
              <Text style={styles.catScore}>{val}</Text>
              <View style={styles.infoBtn}>
                <Text style={styles.infoBtnText}>i</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <InfoPopover
        visible={active !== null}
        onClose={() => setActive(null)}
        title={active?.label ?? ''}
      >
        <Text style={popoverStyles.description}>{active?.description}</Text>
        {active && (
          <View style={popoverStyles.scoreRow}>
            <Text style={popoverStyles.scoreLabel}>Your score</Text>
            <Text style={popoverStyles.scoreValue}>
              {(entry[active.key] as number | undefined) ?? 0}
              <Text style={popoverStyles.scoreMax}> / 20</Text>
            </Text>
          </View>
        )}
      </InfoPopover>
    </View>
  );
}

const popoverStyles = StyleSheet.create({
  description: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMid,
    lineHeight: 21,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  scoreLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 22,
    color: Colors.ink,
  },
  scoreMax: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
  },
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3E2A32',
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
    color: 'rgba(255,255,255,0.65)',
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
    color: 'rgba(255,255,255,0.5)',
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
    borderTopColor: 'rgba(201,168,76,0.25)',
    paddingTop: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 14,
  },
  catLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    width: 90,
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
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
