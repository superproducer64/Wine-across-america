import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import {
  TECHNICAL_CATEGORIES,
  TechnicalScores,
  computeTechnicalScore,
  technicalScoreTier,
} from '@/types';

export function Step3TechnicalScore() {
  const { scores, setScore } = useEntryDraftStore();
  const total = computeTechnicalScore(scores);
  const tier = technicalScoreTier(total);
  const progress = total / 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Technical Score</Text>
      <Text style={styles.intro}>
        Score each category 0–20. The total out of 100 updates live.
      </Text>

      {/* Running total card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreCardLeft}>
          <Text style={styles.scoreTotalLabel}>Total Score</Text>
          <Text style={[styles.scoreTierLabel, { color: tier.color }]}>{tier.label}</Text>
        </View>
        <View style={styles.scoreCardRight}>
          <Text style={styles.scoreTotalNumber}>{total}</Text>
          <Text style={styles.scoreTotalMax}>/100</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: tier.color }]} />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressTick}>0</Text>
        <Text style={styles.progressTick}>25</Text>
        <Text style={styles.progressTick}>50</Text>
        <Text style={styles.progressTick}>75</Text>
        <Text style={styles.progressTick}>100</Text>
      </View>

      {/* Category sliders */}
      <View style={styles.sliders}>
        {TECHNICAL_CATEGORIES.map((cat) => (
          <View key={cat.key} style={styles.catRow}>
            <View style={styles.catHeader}>
              <Text style={styles.catLabel}>{cat.label}</Text>
              <View style={styles.catScoreBadge}>
                <Text style={styles.catScoreText}>
                  {scores[cat.key as keyof TechnicalScores]}
                </Text>
              </View>
            </View>
            <Text style={styles.catDesc}>{cat.description}</Text>
            <ScoreSlider
              label=""
              value={scores[cat.key as keyof TechnicalScores]}
              min={0}
              max={20}
              step={1}
              onChange={(v) => setScore({ [cat.key]: v })}
              accentColor={Colors.gold}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  stepTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 22,
    color: Colors.ink,
    marginBottom: 6,
  },
  intro: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    marginBottom: Spacing.lg,
    lineHeight: 19,
  },
  scoreCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  scoreCardLeft: {
    gap: 4,
  },
  scoreCardRight: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  scoreTotalLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  scoreTierLabel: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 16,
  },
  scoreTotalNumber: {
    fontFamily: Fonts.playfair,
    fontSize: 52,
    color: Colors.gold,
    lineHeight: 56,
  },
  scoreTotalMax: {
    fontFamily: Fonts.dmSans,
    fontSize: 18,
    color: 'rgba(255,255,255,0.4)',
    paddingBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  progressTick: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkFaint,
  },
  sliders: {
    gap: Spacing.sm,
  },
  catRow: {
    marginBottom: Spacing.md,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  catScoreBadge: {
    minWidth: 32,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.goldPale,
    borderWidth: 0.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  catScoreText: {
    fontFamily: Fonts.playfair,
    fontSize: 12,
    color: Colors.gold,
    lineHeight: 16,
  },
  catDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
    marginBottom: 8,
  },
});
