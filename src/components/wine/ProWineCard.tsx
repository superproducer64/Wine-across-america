import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LABEL_PHOTO_PLACEHOLDER } from '@/utils/imagePlaceholder';
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { WineEntry } from '@/types';
import { WineRadarChart } from './WineRadarChart';
import { AromaDonutChart } from '@/components/charts/AromaDonutChart';

interface Props {
  entry: WineEntry;
  compact?: boolean;
}

// ─── Score Circle ─────────────────────────────────────────────────────────────

function ScoreCircle({ score, compact }: { score: number; compact?: boolean }) {
  const size = compact ? 52 : 68;
  const fontSize = compact ? 20 : 28;
  return (
    <View style={[scoreStyles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[scoreStyles.number, { fontSize }]}>{score}</Text>
      <Text style={scoreStyles.stars}>★★★</Text>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  circle: {
    borderWidth: 2,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  number: {
    fontFamily: Fonts.playfairSemiBold,
    color: Colors.ink,
    lineHeight: undefined,
  },
  stars: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 7,
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
});

// ─── Main Card ────────────────────────────────────────────────────────────────

export function ProWineCard({ entry, compact = false }: Props) {
  const score = entry.technical_score ?? 0;
  const colSize = compact ? 130 : 150;
  const [wheelOpen, setWheelOpen] = useState(false);
  const { width: screenW, height: screenH } = useWindowDimensions();
  const popoverSize = Math.min(screenW, screenH) * 0.78;

  const origin = [entry.subregion, entry.region, entry.country].filter(Boolean).join(', ');
  const wineTitle = [entry.name, entry.vintage].filter(Boolean).join(' ');

  const isBestValue = entry.want_to_buy && score >= 80;
  const hasAromas = entry.aromas_l1.length > 0;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        {(entry.label_photo_url || entry.back_label_photo_url) ? (
          <View style={styles.photoRow}>
            {entry.label_photo_url ? (
              <Image
                source={{ uri: entry.label_photo_url }}
                style={[
                  styles.headerThumbnail,
                  compact && styles.headerThumbnailCompact,
                  entry.back_label_photo_url ? styles.headerThumbnailDuo : undefined,
                ]}
                contentFit="cover"
                cachePolicy="memory-disk"
                placeholder={entry.label_photo_blurhash ?? LABEL_PHOTO_PLACEHOLDER}
                placeholderContentFit="cover"
                transition={300}
              />
            ) : null}
            {entry.back_label_photo_url ? (
              <Image
                source={{ uri: entry.back_label_photo_url }}
                style={[
                  styles.headerThumbnail,
                  compact && styles.headerThumbnailCompact,
                  styles.headerThumbnailDuo,
                ]}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={300}
              />
            ) : null}
          </View>
        ) : null}
        <Text style={[styles.producer, compact && styles.producerCompact]} numberOfLines={2}>
          {entry.producer || entry.name || 'Unknown Producer'}
        </Text>
        <Text style={[styles.wineName, compact && styles.wineNameCompact]} numberOfLines={2}>
          {entry.producer ? wineTitle : ''}
        </Text>
        <View style={styles.divider} />
        {origin ? (
          <Text style={[styles.origin, compact && styles.originCompact]}>{origin}</Text>
        ) : null}
        <View style={styles.divider} />
      </View>

      {/* ── Body: Radar (left) + Flavor Wheel (right) ── */}
      <View style={styles.body}>
        {/* Left: PROFILE label + Radar + notes */}
        <View style={styles.leftCol}>
          <Text style={[styles.colLabel, compact && styles.smallLabel]}>Profile</Text>
          <WineRadarChart
            sweetness={entry.sweetness ?? 5}
            acidity={entry.acidity}
            body={entry.body}
            alcohol={entry.alcohol}
            tannin={entry.tannin}
            intensity={entry.intensity}
            finish_length={entry.finish_length ?? 5}
            size={colSize}
            color={Colors.ink}
          />
          {entry.free_notes ? (
            <Text
              style={[styles.profileText, compact && styles.profileTextCompact]}
              numberOfLines={compact ? 2 : 4}
            >
              {entry.free_notes}
            </Text>
          ) : null}
        </View>

        {/* Right: AROMA PROFILE label + Flavor Wheel (tap to expand) */}
        <View style={styles.rightCol}>
          {hasAromas ? (
            <TouchableOpacity
              onPress={() => setWheelOpen(true)}
              activeOpacity={0.75}
              style={styles.wheelTouchable}
            >
              <Text style={[styles.colLabel, compact && styles.smallLabel]}>Aroma Profile</Text>
              <AromaDonutChart
                aromasL1={entry.aromas_l1}
                size={colSize}
                showLegend={false}
              />
              <Text style={styles.tapHint}>tap to expand ↗</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Score + Footer row ── */}
      <View style={styles.footer}>
        {score > 0 && <ScoreCircle score={score} compact={compact} />}
        {isBestValue && (
          <View style={styles.bestValueBadge}>
            <Text style={[styles.bestValueText, compact && styles.bestValueTextCompact]}>
              Best Value ✓
            </Text>
          </View>
        )}
        <Text style={[styles.buyAgain, compact && styles.buyAgainCompact]}>
          Would I buy again?{' '}
          <Text style={entry.want_to_buy ? styles.yesText : styles.noText}>
            {entry.want_to_buy ? '✓ YES' : '✗ NO'}
          </Text>
        </Text>
      </View>

      {/* ── Aroma Wheel Popover ── */}
      {hasAromas && (
        <Modal
          visible={wheelOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setWheelOpen(false)}
          statusBarTranslucent
        >
          <Pressable style={styles.overlay} onPress={() => setWheelOpen(false)}>
            <Pressable style={styles.popover} onPress={() => {}}>
              {/* Title row */}
              <View style={styles.popoverHeader}>
                <Text style={styles.popoverTitle}>Aroma Profile</Text>
                <TouchableOpacity onPress={() => setWheelOpen(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Wine name sub-label */}
              <Text style={styles.popoverSubtitle} numberOfLines={1}>
                {entry.producer || entry.name || ''}
                {entry.vintage ? `  ·  ${entry.vintage}` : ''}
              </Text>

              {/* Large wheel with legend */}
              <AromaDonutChart
                aromasL1={entry.aromas_l1}
                size={popoverSize}
                showLegend
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardCompact: {
    borderRadius: Radius.md,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 4,
  },
  headerThumbnail: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  headerThumbnailCompact: {
    width: 40,
    height: 40,
  },
  headerThumbnailDuo: {
    width: 48,
    height: 48,
  },
  producer: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
    lineHeight: 28,
  },
  producerCompact: { fontSize: 14, lineHeight: 18 },
  wineName: {
    fontFamily: Fonts.playfair,
    fontSize: 14,
    color: Colors.inkMid,
    textAlign: 'center',
    lineHeight: 20,
  },
  wineNameCompact: { fontSize: 10, lineHeight: 14 },
  divider: {
    height: 0.5,
    width: '60%',
    backgroundColor: Colors.inkMuted,
    opacity: 0.4,
    marginVertical: 2,
  },
  origin: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMid,
    textAlign: 'center',
  },
  originCompact: { fontSize: 9 },

  // Body
  body: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs ?? 4,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  rightCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },

  // Column section label (PROFILE / AROMA PROFILE)
  colLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    alignSelf: 'center',
  },

  // Profile free-text note under radar
  profileText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 10,
    color: Colors.inkMid,
    lineHeight: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  profileTextCompact: { fontSize: 8, lineHeight: 12 },

  // Score + Best Value badge
  bestValueBadge: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestValueText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  bestValueTextCompact: { fontSize: 8 },

  // Footer row: score + best value + "Would I buy again?"
  footer: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  buyAgain: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMid,
    flex: 1,
    textAlign: 'right',
  },
  buyAgainCompact: { fontSize: 9 },
  yesText: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.ink,
  },
  noText: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.inkMuted,
  },

  // Wheel touchable + tap hint
  wheelTouchable: {
    alignItems: 'center',
    gap: 4,
  },
  tapHint: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 9,
    color: Colors.inkMuted,
    letterSpacing: 0.3,
    marginTop: 2,
  },

  // Popover modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 10, 12, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popover: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.lg,
    maxWidth: 420,
    width: '90%',
  },
  popoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  popoverTitle: {
    flex: 1,
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 18,
    color: Colors.ink,
  },
  popoverSubtitle: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMid,
    alignSelf: 'flex-start',
    fontStyle: 'italic',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.inkMid,
  },

  // Shared small label
  smallLabel: { fontSize: 9 },
});
