import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  SafeAreaView,
} from 'react-native';
import {
  VictoryChart,
  VictoryPolarAxis,
  VictoryArea,
} from 'victory-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import {
  STRUCTURE_DIMENSIONS,
  StructureDimension,
  StructureScores,
} from '@/types';

const CHART_SIZE = 260;
const AXIS_LABELS = ['Aroma', 'Texture', 'Intensity', 'Complexity', 'Finish', 'Typicity'];

export function Step2StructureWheel() {
  const { scores, setScore } = useEntryDraftStore();
  const [activeDim, setActiveDim] = useState<StructureDimension | null>(null);

  const chartData = [
    { x: 'Aroma',      y: scores.aroma },
    { x: 'Texture',    y: scores.texture },
    { x: 'Intensity',  y: scores.flavor_intensity },
    { x: 'Complexity', y: scores.complexity },
    { x: 'Finish',     y: scores.finish },
    { x: 'Typicity',   y: scores.typicity },
  ];

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.stepTitle}>Structure Wheel</Text>
        <Text style={styles.intro}>
          Rate each dimension 1–10. The radar updates live. Tap{' '}
          <Text style={styles.infoGlyph}>ℹ</Text> for guidance.
        </Text>

        {/* Victory Native Radar Chart */}
        <View style={styles.chartWrap}>
          <VictoryChart
            polar
            domain={{ y: [0, 10] }}
            width={CHART_SIZE}
            height={CHART_SIZE}
          >
            {/* Dependent axis — concentric grid rings */}
            <VictoryPolarAxis
              dependentAxis
              tickValues={[2, 4, 6, 8, 10]}
              style={{
                axis: { stroke: 'none' },
                grid: { stroke: Colors.border, strokeWidth: 0.5, opacity: 0.8 },
                tickLabels: {
                  fill: Colors.inkFaint,
                  fontSize: 8,
                  fontFamily: Fonts.dmSans,
                },
              }}
            />

            {/* One independent axis per dimension */}
            {AXIS_LABELS.map((label) => (
              <VictoryPolarAxis
                key={label}
                axisValue={label}
                label={label}
                labelPlacement="vertical"
                style={{
                  axis: { stroke: Colors.border, strokeWidth: 0.5 },
                  axisLabel: {
                    fill: Colors.inkMuted,
                    fontSize: 10,
                    fontFamily: Fonts.dmSansMedium,
                    padding: 26,
                  },
                  tickLabels: { fill: 'none' },
                  grid: { stroke: 'none' },
                }}
              />
            ))}

            {/* Score polygon */}
            <VictoryArea
              animate={{ duration: 180 }}
              data={chartData}
              style={{
                data: {
                  fill: 'rgba(201,168,76,0.18)',
                  stroke: Colors.gold,
                  strokeWidth: 2,
                },
              }}
            />
          </VictoryChart>
        </View>

        {/* Sliders */}
        <View style={styles.sliders}>
          {STRUCTURE_DIMENSIONS.map((dim) => (
            <View key={dim.key} style={styles.dimRow}>
              {/* Tappable label row */}
              <Pressable
                style={styles.dimLabel}
                onPress={() => setActiveDim(dim)}
                hitSlop={{ top: 8, bottom: 8, left: 0, right: 8 }}
              >
                <Text style={styles.dimLabelText}>{dim.label}</Text>
                <View style={styles.infoBtn}>
                  <Text style={styles.infoBtnText}>ℹ</Text>
                </View>
              </Pressable>

              <ScoreSlider
                label=""
                value={scores[dim.key as keyof StructureScores]}
                min={1}
                max={10}
                onChange={(v) => setScore({ [dim.key]: v })}
                accentColor={Colors.gold}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Info Modal */}
      <Modal
        visible={activeDim !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveDim(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setActiveDim(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            {activeDim && <DimInfoContent dim={activeDim} onClose={() => setActiveDim(null)} />}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function DimInfoContent({
  dim,
  onClose,
}: {
  dim: StructureDimension;
  onClose: () => void;
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.modalContent}
      bounces={false}
    >
      {/* Pull handle */}
      <View style={styles.handle} />

      {/* Title */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{dim.label}</Text>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* Description */}
      <Text style={styles.modalDesc}>{dim.description}</Text>

      {/* Tip */}
      <View style={styles.tipBox}>
        <Text style={styles.tipLabel}>Tip</Text>
        <Text style={styles.tipText}>{dim.tip}</Text>
      </View>

      {/* Reference scale */}
      <Text style={styles.refHeader}>Reference Scale</Text>
      <View style={styles.refList}>
        {dim.references.map((ref) => (
          <View key={ref.score} style={styles.refRow}>
            <View style={styles.refScoreBadge}>
              <Text style={styles.refScoreText}>{ref.score}</Text>
            </View>
            <Text style={styles.refExample}>{ref.example}</Text>
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
  infoGlyph: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.gold,
  },
  chartWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  sliders: {
    gap: 4,
  },
  dimRow: {
    marginBottom: Spacing.sm,
  },
  dimLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dimLabelText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  infoBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.goldPale,
    borderWidth: 0.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    color: Colors.gold,
    lineHeight: 13,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,23,16,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '82%',
    borderTopWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  modalContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.inkFaint,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 22,
    color: Colors.ink,
    flex: 1,
  },
  closeBtn: {
    paddingLeft: Spacing.md,
  },
  closeBtnText: {
    fontFamily: Fonts.dmSans,
    fontSize: 18,
    color: Colors.inkMuted,
  },
  modalDesc: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMid,
    lineHeight: 21,
    marginBottom: Spacing.lg,
  },
  tipBox: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    marginBottom: Spacing.lg,
    gap: 4,
  },
  tipLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  tipText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 13,
    color: Colors.inkMid,
    lineHeight: 19,
  },
  refHeader: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
  },
  refList: {
    gap: Spacing.md,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  refScoreBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  refScoreText: {
    fontFamily: Fonts.playfair,
    fontSize: 13,
    color: Colors.gold,
    lineHeight: 17,
  },
  refExample: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMid,
    flex: 1,
    lineHeight: 19,
    paddingTop: 4,
  },
});
