import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { TECHNICAL_CATEGORIES, computeTechnicalScore } from '@/types';

export function Step4TechnicalScore() {
  const { draft, setTechnicalScore } = useEntryDraftStore();

  const total = computeTechnicalScore(draft);
  const pct = (total / 100) * 100;

  const tierColor =
    total >= 85 ? Colors.green :
    total >= 70 ? Colors.gold :
    Colors.inkMuted;

  const tierLabel =
    total >= 90 ? 'Outstanding' :
    total >= 80 ? 'Excellent' :
    total >= 70 ? 'Very Good' :
    total >= 60 ? 'Good' :
    'Fair';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.stepTitle}>Technical Score</Text>
      <Text style={styles.intro}>
        Rate each quality dimension from 0–20. They sum to a maximum of 100.
      </Text>

      {/* Live total */}
      <View style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Score</Text>
          <Text style={[styles.totalScore, { color: tierColor }]}>{total}</Text>
        </View>
        <Text style={styles.tierLabel}>{tierLabel}</Text>
        <View style={styles.totalTrack}>
          <View
            style={[
              styles.totalFill,
              { width: `${pct}%`, backgroundColor: tierColor },
            ]}
          />
        </View>
      </View>

      {/* Sliders */}
      {TECHNICAL_CATEGORIES.map((cat) => (
        <View key={cat.key} style={styles.catBlock}>
          <Text style={styles.catDesc}>{cat.description}</Text>
          <ScoreSlider
            label={cat.label}
            value={draft[cat.key] ?? 10}
            min={0}
            max={20}
            step={1}
            onChange={(v) => setTechnicalScore({ [cat.key]: v })}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: 4,
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
  totalCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  totalScore: {
    fontFamily: Fonts.playfair,
    fontSize: 36,
    lineHeight: 40,
  },
  tierLabel: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 13,
    color: Colors.goldLight,
  },
  totalTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.full,
    marginTop: 4,
  },
  totalFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  catBlock: {
    marginBottom: 4,
  },
  catDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: 'italic',
    marginBottom: 4,
  },
});
