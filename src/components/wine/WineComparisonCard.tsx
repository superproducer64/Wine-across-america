import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { WineEntry } from '@/types';
import { ProWineCard } from './ProWineCard';

interface Props {
  entryA: WineEntry;
  entryB: WineEntry;
}

export function WineComparisonCard({ entryA, entryB }: Props) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Comparison Mode</Text>

      <View style={styles.row}>
        {/* Wine A */}
        <View style={styles.cardWrap}>
          <ProWineCard entry={entryA} compact />
        </View>

        {/* Wine B */}
        <View style={styles.cardWrap}>
          <ProWineCard entry={entryB} compact />
        </View>
      </View>

      {/* Score comparison bar */}
      <View style={styles.scoreCompare}>
        <Text style={styles.scoreCompareTitle}>Score Comparison</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreName} numberOfLines={1}>
            {entryA.producer || entryA.name}
          </Text>
          <Text style={styles.scoreNum}>{entryA.technical_score}</Text>
        </View>
        <View style={styles.scoreBarRow}>
          <View style={styles.scoreTrackLeft}>
            <View
              style={[
                styles.scoreBarLeft,
                { width: `${entryA.technical_score}%` as any },
              ]}
            />
          </View>
          <View style={styles.scoreTrackRight}>
            <View
              style={[
                styles.scoreBarRight,
                { width: `${entryB.technical_score}%` as any },
              ]}
            />
          </View>
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreName} numberOfLines={1}>
            {entryB.producer || entryB.name}
          </Text>
          <Text style={styles.scoreNum}>{entryB.technical_score}</Text>
        </View>

        {/* Winner callout */}
        {entryA.technical_score !== entryB.technical_score && (
          <View style={styles.winnerBadge}>
            <Text style={styles.winnerText}>
              🏆{' '}
              {entryA.technical_score > entryB.technical_score
                ? entryA.producer || entryA.name
                : entryB.producer || entryB.name}{' '}
              scores higher
            </Text>
          </View>
        )}
        {entryA.technical_score === entryB.technical_score && entryA.technical_score > 0 && (
          <View style={styles.winnerBadge}>
            <Text style={styles.winnerText}>🤝 Tied score</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    gap: Spacing.lg,
    paddingBottom: 40,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
  },

  // Side-by-side row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  cardWrap: {
    flex: 1,
  },

  // Score comparison block
  scoreCompare: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  scoreCompareTitle: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 14,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreName: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMid,
    flex: 1,
  },
  scoreNum: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 16,
    color: Colors.ink,
    marginLeft: Spacing.sm,
  },
  scoreBarRow: {
    flexDirection: 'row',
    height: 10,
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
    gap: 2,
  },
  scoreTrackLeft: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  scoreBarLeft: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
  },
  scoreTrackRight: {
    flex: 1,
  },
  scoreBarRight: {
    height: '100%',
    backgroundColor: Colors.inkMid,
    borderRadius: Radius.full,
  },
  winnerBadge: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.full,
    paddingVertical: 6,
    paddingHorizontal: Spacing.lg,
    alignSelf: 'center',
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    marginTop: Spacing.sm,
  },
  winnerText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.ink,
  },
});
