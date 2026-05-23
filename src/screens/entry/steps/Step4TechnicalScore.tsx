import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { ScoreSlider, SliderZone } from '@/components/ui/ScoreSlider';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { useAuthStore } from '@/stores/authStore';
import { TECHNICAL_CATEGORIES, computeTechnicalScore } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';

export function Step4TechnicalScore() {
  const { draft, setTechnicalScore } = useEntryDraftStore();
  const { profile } = useAuthStore();
  const { isWide } = useResponsive();

  const isSommelier =
    profile?.user_role === 'sommelier' && profile?.sommelier_status === 'approved';

  // Zone definitions for score sliders (0–20 scale)
  const SCORE_ZONES: Record<string, SliderZone[]> = {
    score_balance: [
      { label: 'Unbalanced', min: 0,  max: 5,  color: '#E57373' },
      { label: 'Off-balance', min: 6,  max: 10, color: '#FFB74D' },
      { label: 'Neutral',    min: 11, max: 14, color: '#FDD835' },
      { label: 'Balanced',   min: 15, max: 17, color: '#AED581' },
      { label: 'Perfect',    min: 18, max: 20, color: '#4CAF50' },
    ],
    score_intensity: [
      { label: 'Low',    min: 0,  max: 6,  color: '#A8C96A' },
      { label: 'Medium', min: 7,  max: 13, color: '#5BA858' },
      { label: 'High',   min: 14, max: 20, color: '#2E7D32' },
    ],
    score_complexity: [
      { label: 'Simple',    min: 0,  max: 7,  color: '#E1BEE7' },
      { label: 'Moderate',  min: 8,  max: 13, color: '#AB47BC' },
      { label: 'Complex',   min: 14, max: 17, color: '#7B1FA2' },
      { label: 'Intricate', min: 18, max: 20, color: '#4A148C' },
    ],
    score_finish: [
      { label: 'Short',  min: 0,  max: 6,  color: '#C5A8E0' },
      { label: 'Medium', min: 7,  max: 13, color: '#8E44BC' },
      { label: 'Long',   min: 14, max: 20, color: '#4A1080' },
    ],
    score_typicity: [
      { label: 'Generic',       min: 0,  max: 7,  color: '#80CBC4' },
      { label: 'Recognizable',  min: 8,  max: 13, color: '#26A69A' },
      { label: 'Clear',         min: 14, max: 17, color: '#00796B' },
      { label: 'Precise',       min: 18, max: 20, color: '#004D40' },
    ],
  };

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
      {TECHNICAL_CATEGORIES.map((cat) => {
        const isIntensity = cat.key === 'score_intensity';
        const intensityLocked = isIntensity && !isSommelier;
        return (
          <View key={cat.key} style={styles.catBlock}>
            <View style={styles.catHeader}>
              <Text style={styles.catDesc}>{cat.description}</Text>
              {isIntensity && isAutoFilled && (
                <View style={styles.autoBadge}>
                  <Text style={styles.autoBadgeText}>
                    {intensityLocked ? 'Auto · locked' : 'Auto · Structure ×2'}
                  </Text>
                </View>
              )}
            </View>
            <ScoreSlider
              label={cat.label}
              value={draft[cat.key] ?? 10}
              min={0}
              max={20}
              step={1}
              disabled={intensityLocked}
              zones={SCORE_ZONES[cat.key]}
              onChange={(v) => setTechnicalScore({ [cat.key]: v })}
            />
            {intensityLocked && (
              <Text style={styles.lockedHint}>
                Auto-filled from Structure × 2. Sommelier profile unlocks manual adjustment.
              </Text>
            )}
          </View>
        );
      })}
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
  lockedHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkFaint,
    fontStyle: 'italic',
    marginTop: -Spacing.md,
    marginBottom: Spacing.md,
  },
});
