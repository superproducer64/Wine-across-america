import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing } from '@/theme';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { SegmentedPicker, PickerOption } from '@/components/ui/SegmentedPicker';
import { RadarChart } from '@/components/charts/RadarChart';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { useAuthStore } from '@/stores/authStore';
import { STRUCTURE_DIMENSIONS } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';

// ─── Enthusiast pickers (3 options) ────────────────────────────────────────
const BODY_ENTHUSIAST: PickerOption[] = [
  { label: 'Light',  value: 3, hint: 'Like water or skim milk' },
  { label: 'Medium', value: 6, hint: 'Like whole milk' },
  { label: 'Full',   value: 9, hint: 'Like cream' },
];
const ALCOHOL_ENTHUSIAST: PickerOption[] = [
  { label: 'Low',    value: 3, hint: 'Light, no warmth in the back of your throat, few/no legs' },
  { label: 'Medium', value: 6, hint: 'Gentle warmth, legs move at a moderate speed' },
  { label: 'High',   value: 9, hint: 'Noticeable heat, many legs, that move slowly' },
];
const INTENSITY_ENTHUSIAST: PickerOption[] = [
  { label: 'Low',    value: 3, hint: 'Subtle, you need to bring your nose into the glass' },
  { label: 'Medium', value: 6, hint: 'Noticeable, you smell it at nose or chin level' },
  { label: 'High',   value: 9, hint: 'Expressive, you can smell it at chin level or even lower' },
];

// ─── Sommelier pickers (5 options) ─────────────────────────────────────────
const BODY_SOMMELIER: PickerOption[] = [
  { label: 'Light',    value: 2,  hint: 'Like water or skim milk' },
  { label: 'Medium −', value: 4,  hint: 'Lighter side of medium body' },
  { label: 'Medium',   value: 6,  hint: 'Like whole milk' },
  { label: 'Medium +', value: 8,  hint: 'Fuller side of medium body' },
  { label: 'Full',     value: 10, hint: 'Like cream' },
];
const ALCOHOL_SOMMELIER: PickerOption[] = [
  { label: 'Low',      value: 2,  hint: 'Light, no warmth in the back of your throat, few/no legs' },
  { label: 'Medium −', value: 4,  hint: 'Slight warmth, minimal legs' },
  { label: 'Medium',   value: 6,  hint: 'Gentle warmth, legs move at a moderate speed' },
  { label: 'Medium +', value: 8,  hint: 'Noticeable warmth, legs move slowly' },
  { label: 'High',     value: 10, hint: 'Noticeable heat, many legs, that move slowly' },
];
const INTENSITY_SOMMELIER: PickerOption[] = [
  { label: 'Low',      value: 2,  hint: 'Subtle, you need to bring your nose into the glass' },
  { label: 'Medium −', value: 4,  hint: 'Faint, detectable only up close' },
  { label: 'Medium',   value: 6,  hint: 'Noticeable, you smell it at nose or chin level' },
  { label: 'Medium +', value: 8,  hint: 'Pronounced, detectable slightly away from the glass' },
  { label: 'High',     value: 10, hint: 'Expressive, you can smell it at chin level or even lower' },
];

// Axes that use categorical pickers for both profiles
const PICKER_KEYS = new Set(['body', 'alcohol', 'intensity']);

export function Step2StructureWheel() {
  const { draft, setStructureWheel } = useEntryDraftStore();
  const { profile } = useAuthStore();

  const isSommelier =
    profile?.user_role === 'sommelier' && profile?.sommelier_status === 'approved';
  const { isWide } = useResponsive();

  const scores = {
    sweetness:     draft.sweetness,
    acidity:       draft.acidity,
    tannin:        draft.tannin,
    body:          draft.body,
    alcohol:       draft.alcohol,
    intensity:     draft.intensity,
    finish_length: draft.finish_length,
  };

  const getPickerOptions = (key: string): PickerOption[] => {
    if (isSommelier) {
      if (key === 'body')      return BODY_SOMMELIER;
      if (key === 'alcohol')   return ALCOHOL_SOMMELIER;
      if (key === 'intensity') return INTENSITY_SOMMELIER;
    }
    if (key === 'body')      return BODY_ENTHUSIAST;
    if (key === 'alcohol')   return ALCOHOL_ENTHUSIAST;
    if (key === 'intensity') return INTENSITY_ENTHUSIAST;
    return [];
  };

  const radarSize = isWide ? 260 : 200;

  const radarPanel = (
    <View style={[styles.radarWrap, isWide && styles.radarWrapWide]}>
      <RadarChart scores={scores} size={radarSize} />
      {isWide && (
        <Text style={styles.radarHint}>
          Chart updates live as you adjust each control.
        </Text>
      )}
    </View>
  );

  const slidersPanel = (
    <View style={isWide && styles.slidersCol}>
      {/* Profile badge */}
      <View style={styles.modeBadge}>
        <Text style={styles.modeBadgeText}>
          {isSommelier ? '🎓 Sommelier profile' : 'Wine Explorer profile — tap to select'}
        </Text>
      </View>

      {STRUCTURE_DIMENSIONS.map((dim) => {
        if (PICKER_KEYS.has(dim.key)) {
          return (
            <SegmentedPicker
              key={dim.key}
              label={dim.displayLabel}
              tip={dim.tip}
              options={getPickerOptions(dim.key)}
              value={scores[dim.key as keyof typeof scores]}
              onChange={(v) => setStructureWheel({ [dim.key]: v })}
            />
          );
        }

        return (
          <ScoreSlider
            key={dim.key}
            label={dim.displayLabel}
            value={scores[dim.key as keyof typeof scores]}
            min={1}
            max={10}
            tip={dim.tip}
            lowLabel={dim.lowAnchor}
            highLabel={dim.highAnchor}
            onChange={(v) => setStructureWheel({ [dim.key]: v })}
          />
        );
      })}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, isWide && styles.contentWide]}
    >
      <Text style={styles.stepTitle}>Structure</Text>
      <Text style={styles.intro}>
        Rate Sweetness, Acidity, Tannin and Finish on a 1–10 scale.
        Select a level for Body, Alcohol and Intensity.
      </Text>

      {isWide ? (
        <View style={styles.twoColRow}>
          <View style={styles.leftCol}>{radarPanel}</View>
          <View style={styles.rightCol}>{slidersPanel}</View>
        </View>
      ) : (
        <>
          {radarPanel}
          {slidersPanel}
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
  leftCol:  { flex: 5, minWidth: 200 },
  rightCol: { flex: 7 },
  radarWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  radarWrapWide: { marginBottom: 0 },
  radarHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  modeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.goldPale,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: Spacing.lg,
  },
  modeBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.inkMid,
    letterSpacing: 0.2,
  },
  slidersCol: { gap: 4 },
});
