import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing } from '@/theme';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { RadarChart } from '@/components/charts/RadarChart';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { STRUCTURE_DIMENSIONS } from '@/types';

export function Step2StructureWheel() {
  const { draft, setStructureWheel } = useEntryDraftStore();

  const scores = {
    sweetness: draft.sweetness,
    acidity: draft.acidity,
    tannin: draft.tannin,
    body: draft.body,
    alcohol: draft.alcohol,
    intensity: draft.intensity,
    finish_length: draft.finish_length,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.stepTitle}>Structure Wheel</Text>
      <Text style={styles.intro}>
        Rate each dimension from 1–10. The radar chart updates live as you score.
      </Text>

      {/* Live radar preview */}
      <View style={styles.radarWrap}>
        <RadarChart scores={scores} size={200} />
      </View>

      {/* Sliders */}
      {STRUCTURE_DIMENSIONS.map((dim) => (
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
  radarWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
});
