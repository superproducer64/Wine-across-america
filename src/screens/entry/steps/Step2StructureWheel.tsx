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

// ─── Simplified picker options for Wine Explorer ───────────────────────────
// Maps to the same 1-10 numeric storage, so Sommelier's slider reads them fine.

const BODY_OPTIONS: PickerOption[] = [
  { label: 'Light', sublabel: '💧 watery', value: 2 },
  { label: 'Medium', sublabel: '🍵 tea-like', value: 5 },
  { label: 'Full', sublabel: '🍷 silky', value: 8 },
  { label: 'Bold', sublabel: '🥛 creamy', value: 10 },
];

const ALCOHOL_OPTIONS: PickerOption[] = [
  { label: 'Low', sublabel: '< 11%', value: 2 },
  { label: 'Medium', sublabel: '11–13%', value: 5 },
  { label: 'High', sublabel: '13–15%', value: 8 },
  { label: 'Warm', sublabel: '15%+', value: 10 },
];

const INTENSITY_OPTIONS: PickerOption[] = [
  { label: 'Delicate', sublabel: 'subtle', value: 2 },
  { label: 'Medium', sublabel: 'moderate', value: 5 },
  { label: 'Pronounced', sublabel: 'expressive', value: 8 },
  { label: 'Powerful', sublabel: 'intense', value: 10 },
];

// The three axes that get simplified pickers for Wine Explorer
const PICKER_KEYS = new Set(['body', 'alcohol', 'intensity']);

// Map each dimension key to its picker options
const PICKER_OPTIONS: Record<string, PickerOption[]> = {
  body: BODY_OPTIONS,
  alcohol: ALCOHOL_OPTIONS,
  intensity: INTENSITY_OPTIONS,
};

export function Step2StructureWheel() {
  const { draft, setStructureWheel } = useEntryDraftStore();
  const { profile } = useAuthStore();

  // Sommelier-approved users get the full 1-10 slider for all axes
  const isSommelier =
    profile?.user_role === 'sommelier' && profile?.sommelier_status === 'approved';
  const { isWide } = useResponsive();

  const scores = {
    sweetness: draft.sweetness,
    acidity: draft.acidity,
    tannin: draft.tannin,
    body: draft.body,
    alcohol: draft.alcohol,
    intensity: draft.intensity,
    finish_length: draft.finish_length,
  };

  const radarSize = isWide ? 260 : 200;

  const radarPanel = (
    <View style={[styles.radarWrap, isWide && styles.radarWrapWide]}>
      <RadarChart scores={scores} size={radarSize} />
      {isWide && (
        <Text style={styles.radarHint}>
          Chart updates live as you adjust each slider.
        </Text>
      )}
    </View>
  );

  const slidersPanel = (
    <View style={isWide && styles.slidersCol}>
      {/* Profile badge */}
      {!isSommelier && (
        <View style={styles.modeBadge}>
          <Text style={styles.modeBadgeText}>Wine Explorer mode — tap to select</Text>
        </View>
      )}

      {/* Controls — slider for all on Sommelier, picker for body/alcohol/intensity on Explorer */}
      {STRUCTURE_DIMENSIONS.map((dim) => {
        const useSimplePicker = !isSommelier && PICKER_KEYS.has(dim.key);

        if (useSimplePicker) {
          return (
            <SegmentedPicker
              key={dim.key}
              label={dim.displayLabel}
              tip={dim.tip}
              options={PICKER_OPTIONS[dim.key]}
              value={scores[dim.key]}
              onChange={(v) => setStructureWheel({ [dim.key]: v })}
            />
          );
        }

        return (
          <ScoreSlider
            key={dim.key}
            label={dim.displayLabel}
            value={scores[dim.key]}
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
      <Text style={styles.stepTitle}>Structure Wheel</Text>
      <Text style={styles.intro}>
        {isSommelier
          ? 'Rate each dimension from 1–10. The radar chart updates live as you score.'
          : 'Select a level for each dimension. The radar chart updates live as you choose.'}
      </Text>

      {isWide ? (
        <View style={styles.twoColRow}>
          <View style={styles.leftCol}>
            {radarPanel}
          </View>
          <View style={styles.rightCol}>
            {slidersPanel}
          </View>
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
  leftCol: {
    flex: 5,
    minWidth: 200,
  },
  rightCol: {
    flex: 7,
  },
  radarWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
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
  radarWrapWide: {
    marginBottom: 0,
  },
  radarHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  slidersCol: {
    gap: 4,
  },
});
