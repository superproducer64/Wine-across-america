import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { TECHNICAL_CATEGORIES, computeTechnicalScore } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';

export function Step4TechnicalScore() {
  const { draft, setTechnicalScore } = useEntryDraftStore();
  const { isWide } = useResponsive();

  // Auto-fill Intensity from structure score × 2 on mount.
  // The user can override by moving the slider freely afterward.
  useEffect(() => {
    const autofilled = Math.min(20, Math.round(draft.intensity * 2));
    setTechnicalScore({ score_intensity: autofilled });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Shows badge when value still matches the autofill formula
  const autofilledValue = Math.min(20, Math.round(draft.intensity * 2));
  const isAutoFilled = draft.score_intensity === autofilledValue;

  const scoreCard = (
    <View style={[styles.totalCard, isWide && styles.totalCardWide]}>
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
      {isWide && (
        <Text style={styles.scoreCardHint}>
          Adjust the sliders on the right to fine-tune your score. Each dimension is worth up to 20 points.
        </Text>
      )}
    </View>
  );

  const sliders = (
    <View style={isWide ? styles.slidersCol : undefined}>
      {TECHNICAL_CATEGORIES.map((cat) => (
        <View key={cat.key} style={styles.catBlock}>
          <View style={styles.catHeader}>
            <Text style={styles.catDesc}>{cat.description}</Text>
            {cat.key === 'score_intensity' && isAutoFilled && (
              <View style={styles.autoBadge}>
                <Text style={styles.autoBadgeText}>Auto · Structure ×2</Text>
              </View>
            )}
          </View>
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
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, isWide && styles.contentWide]}
    >
      <Text style={styles.stepTitle}>Technical Score</Text>
      <Text style={styles.intro}>
        Rate each quality dimension from 0–20. They sum to a maximum of 100.
      </Text>

      {isWide ? (
        <View style={styles.twoColRow}>
          <View style={styles.leftCol}>
            {scoreCard}
          </View>
          <View style={styles.rightCol}>
            {sliders}
          </View>
        </View>
      ) : (
        <>
          {scoreCard}
          {sliders}
        </>
      )}
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
  contentWide: {
    padding: Spacing.xxl,
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
  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 5,
    minWidth: 200,
  },
  rightCol: {
    flex: 7,
  },
  totalCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: 6,
  },
  totalCardWide: {
    marginBottom: 0,
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
  scoreCardHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: Spacing.md,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  slidersCol: {
    gap: 4,
  },
  catBlock: {
    marginBottom: 4,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  catDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: 'italic',
    flex: 1,
  },
  autoBadge: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  autoBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 9,
    color: Colors.inkMid,
    letterSpacing: 0.3,
  },
});
