import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { ScoreSlider, SliderZone } from '@/components/ui/ScoreSlider';
import { ImageInfoSheet } from '@/components/ui/ImageInfoSheet';
import { PARAMETER_INFO } from '@/data/parameterInfo';
import { SPEC_CAROUSEL_PAGES, PARAMETER_CAROUSEL_INDEX, PARAMETER_AUTO_SCROLL } from '@/data/parameterImages';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { TECHNICAL_CATEGORIES, TechnicalCategory, computeTechnicalScore } from '@/types';
import { useResponsive } from '@/hooks/useResponsive';

// ─── Zone definitions (0–20 scale) ────────────────────────────────────────────
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

function getActiveZone(zones: SliderZone[], value: number): SliderZone | null {
  return zones.find((z) => value >= z.min && value <= z.max) ?? null;
}

// ─── Individual score dimension card ──────────────────────────────────────────
// Tap the header to collapse/expand the slider. Default: expanded.
interface ScoreDimCardProps {
  cat: TechnicalCategory;
  value: number;
  isAutoFilled?: boolean;
  onChange: (v: number) => void;
  onInfo?: () => void;
}

function ScoreDimCard({ cat, value, isAutoFilled, onChange, onInfo }: ScoreDimCardProps) {
  const [expanded, setExpanded] = useState(true);
  const zones = SCORE_ZONES[cat.key] ?? [];
  const zone = getActiveZone(zones, value);

  return (
    <View style={styles.dimCard}>
      {/* Tappable header: tap to collapse / expand */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded((e) => !e)}
        style={styles.dimHeader}
      >
        <View style={styles.dimLabelRow}>
          <Text style={styles.dimLabel}>{cat.label}</Text>
          {isAutoFilled && (
            <View style={styles.autoBadge}>
              <Text style={styles.autoBadgeText}>Auto</Text>
            </View>
          )}
          {zone && (
            <View style={[styles.zonePill, { backgroundColor: zone.color + '28', borderColor: zone.color + '90' }]}>
              <View style={[styles.zoneDot, { backgroundColor: zone.color }]} />
              <Text style={[styles.zoneText, { color: zone.color }]}>{zone.label}</Text>
            </View>
          )}
        </View>
        <View style={styles.dimRightRow}>
          <Text style={styles.dimValue}>
            {value}<Text style={styles.dimValueMax}>/20</Text>
          </Text>
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {/* Expandable body */}
      {expanded && (
        <>
          <Text style={styles.dimDesc}>{cat.description}</Text>
          <ScoreSlider
            label={cat.label}
            value={value}
            min={0}
            max={20}
            step={1}
            zones={zones}
            onChange={onChange}
            onInfo={onInfo}
          />
        </>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export function Step4TechnicalScore() {
  const { draft, setTechnicalScore } = useEntryDraftStore();
  const { isWide } = useResponsive();
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  useEffect(() => {
    const autofilled = Math.min(20, Math.round(draft.intensity * 2));
    setTechnicalScore({ score_intensity: autofilled });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = computeTechnicalScore(draft);
  const pct = (total / 100) * 100;
  const tierColor = total >= 85 ? Colors.green : total >= 70 ? Colors.gold : Colors.inkMuted;
  const tierLabel =
    total >= 90 ? 'Outstanding' :
    total >= 80 ? 'Excellent' :
    total >= 70 ? 'Very Good' :
    total >= 60 ? 'Good' : 'Fair';

  const autofilledValue = Math.min(20, Math.round(draft.intensity * 2));

  const totalCard = (
    <View style={[styles.totalCard, isWide && styles.totalCardWide]}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Score</Text>
        <Text style={[styles.totalScore, { color: tierColor }]}>{total}</Text>
      </View>
      <Text style={styles.tierLabel}>{tierLabel}</Text>
      <View style={styles.totalTrack}>
        <View style={[styles.totalFill, { width: `${pct}%`, backgroundColor: tierColor }]} />
      </View>
    </View>
  );

  const dimCards = TECHNICAL_CATEGORIES.map((cat) => (
    <ScoreDimCard
      key={cat.key}
      cat={cat}
      value={draft[cat.key] ?? 10}
      isAutoFilled={cat.key === 'score_intensity' && draft.score_intensity === autofilledValue}
      onChange={(v) => setTechnicalScore({ [cat.key]: v })}
      onInfo={PARAMETER_INFO[cat.key] ? () => setOpenInfo(cat.key) : undefined}
    />
  ));

  const infoSheet = openInfo && PARAMETER_CAROUSEL_INDEX[openInfo] !== undefined ? (
    <ImageInfoSheet
      visible
      onClose={() => setOpenInfo(null)}
      title={PARAMETER_INFO[openInfo]?.title ?? openInfo}
      sources={SPEC_CAROUSEL_PAGES}
      initialIndex={PARAMETER_CAROUSEL_INDEX[openInfo]}
      autoScrollFraction={PARAMETER_AUTO_SCROLL[openInfo] ?? 0}
    />
  ) : null;

  if (isWide) {
    return (
      <>
        <View style={styles.wideContainer}>
          <View style={styles.wideHeader}>
            <Text style={styles.stepTitle}>Technical Score</Text>
            <Text style={styles.intro}>Rate each quality dimension from 0–20. Pinch any card to zoom.</Text>
          </View>
          <View style={styles.wideTwoCol}>
            <View style={styles.widePinnedCol}>{totalCard}</View>
            <ScrollView
              style={styles.wideScrollCol}
              contentContainerStyle={styles.wideScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {dimCards}
            </ScrollView>
          </View>
        </View>
        {infoSheet}
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>Technical Score</Text>
        <Text style={styles.intro}>Rate each quality dimension from 0–20. Pinch any card to zoom.</Text>
        {totalCard}
        {dimCards}
      </ScrollView>
      {infoSheet}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
    flexDirection: 'column',
    gap: Spacing.md,
  },
  // ─── Wide layout ──────────────────────────────────────────────────────────
  wideContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
  },
  wideHeader: { marginBottom: Spacing.md },
  wideTwoCol: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xxl,
  },
  widePinnedCol: { flex: 5, minWidth: 200 },
  wideScrollCol: { flex: 7 },
  wideScrollContent: {
    paddingBottom: Spacing.huge,
    flexDirection: 'column',
    gap: Spacing.md,
  },
  // ─── Header text ──────────────────────────────────────────────────────────
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
  // ─── Total score card ─────────────────────────────────────────────────────
  totalCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: 6,
  },
  totalCardWide: { marginBottom: 0 },
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
  // ─── Individual dimension card ─────────────────────────────────────────────
  dimCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    width: '100%',
    alignSelf: 'stretch',
  },
  dimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  dimLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  dimRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevron: {
    fontSize: 10,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  dimLabel: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.ink,
  },
  dimValue: {
    fontFamily: Fonts.playfair,
    fontSize: 22,
    color: Colors.ink,
  },
  dimValueMax: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 5,
    marginBottom: Spacing.xs,
  },
  zoneDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  zoneText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  dimDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: 'italic',
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  // ─── Auto badge ────────────────────────────────────────────────────────────
  autoBadge: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.gold,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  autoBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 9,
    color: Colors.inkMid,
    letterSpacing: 0.3,
  },
});
