import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LABEL_PHOTO_PLACEHOLDER } from '@/utils/imagePlaceholder';
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { WineEntry, AROMA_CATEGORIES } from '@/types';
import { WineRadarChart } from './WineRadarChart';

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

// ─── Aroma Bar ────────────────────────────────────────────────────────────────

function AromaBar({
  emoji,
  label,
  notes,
  fill,
  compact,
}: {
  emoji: string;
  label: string;
  notes: string;
  fill: number;
  compact?: boolean;
}) {
  return (
    <View style={aromaStyles.row}>
      <Text style={aromaStyles.emoji}>{emoji}</Text>
      <View style={aromaStyles.content}>
        <Text style={[aromaStyles.label, compact && aromaStyles.labelCompact]}>
          {label}
          {notes ? <Text style={aromaStyles.notes}>, {notes}</Text> : null}
        </Text>
        <View style={aromaStyles.track}>
          <View style={[aromaStyles.fill, { width: `${fill * 100}%` as any }]} />
        </View>
      </View>
    </View>
  );
}

const aromaStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  emoji: { fontSize: 13, width: 18 },
  content: { flex: 1, gap: 2 },
  label: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.ink,
    lineHeight: 14,
  },
  labelCompact: { fontSize: 9 },
  notes: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 10,
    color: Colors.inkMuted,
  },
  track: {
    height: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
  },
});

// ─── Main Card ────────────────────────────────────────────────────────────────

export function ProWineCard({ entry, compact = false }: Props) {
  const score = entry.technical_score ?? 0;
  const radarSize = compact ? 130 : 170;

  // Aromas — top 5 categories by frequency
  const aromaCounts: Record<string, { count: number; notes: string[] }> = {};
  entry.aromas_l1.forEach((id) => {
    if (!aromaCounts[id]) aromaCounts[id] = { count: 0, notes: [] };
    aromaCounts[id].count += 1;
  });
  entry.aromas_l2.forEach((note) => {
    const cat = AROMA_CATEGORIES.find((c) => c.subcategories.some((s) => s === note));
    if (cat && aromaCounts[cat.id]) aromaCounts[cat.id].notes.push(note.toLowerCase());
  });
  const sortedAromas = Object.entries(aromaCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, compact ? 4 : 5);
  const maxAromaCount = sortedAromas[0]?.[1].count ?? 1;

  const origin = [entry.region, entry.country].filter(Boolean).join(', ');
  const wineTitle = [entry.name, entry.vintage].filter(Boolean).join(' ');

  const isBestValue = entry.want_to_buy && score >= 80;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        {entry.label_photo_url ? (
          <Image
            source={{ uri: entry.label_photo_url }}
            style={[styles.headerThumbnail, compact && styles.headerThumbnailCompact]}
            contentFit="cover"
            cachePolicy="memory-disk"
            placeholder={{ uri: LABEL_PHOTO_PLACEHOLDER }}
            transition={200}
          />
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

      {/* ── Body ── */}
      <View style={styles.body}>
        {/* Left: Radar + Profile */}
        <View style={styles.leftCol}>
          <WineRadarChart
            acidity={entry.acidity}
            body={entry.body}
            alcohol={entry.alcohol}
            tannin={entry.tannin}
            intensity={entry.intensity}
            size={radarSize}
            color={Colors.ink}
          />

          {entry.free_notes ? (
            <View style={styles.profileBlock}>
              <Text style={[styles.profileLabel, compact && styles.smallLabel]}>Profile</Text>
              <Text
                style={[styles.profileText, compact && styles.profileTextCompact]}
                numberOfLines={compact ? 3 : 5}
              >
                {entry.free_notes}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Right: Aromas + Score */}
        <View style={styles.rightCol}>
          <Text style={[styles.aromaHeader, compact && styles.smallLabel]}>Aroma Profile</Text>
          <View style={styles.aromaList}>
            {sortedAromas.map(([id, { count, notes }]) => {
              const cat = AROMA_CATEGORIES.find((c) => c.id === id);
              if (!cat) return null;
              return (
                <AromaBar
                  key={id}
                  emoji={cat.emoji}
                  label={cat.label}
                  notes={notes.slice(0, 2).join(', ')}
                  fill={count / maxAromaCount}
                  compact={compact}
                />
              );
            })}
          </View>

          {/* Score */}
          {score > 0 && (
            <View style={styles.scoreBlock}>
              <ScoreCircle score={score} compact={compact} />
              {isBestValue && (
                <View style={styles.bestValueBadge}>
                  <Text style={[styles.bestValueText, compact && styles.bestValueTextCompact]}>
                    Best Value ✓
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Text style={[styles.buyAgain, compact && styles.buyAgainCompact]}>
          Would I buy again?{' '}
          <Text style={entry.want_to_buy ? styles.yesText : styles.noText}>
            {entry.want_to_buy ? '✓ YES' : '✗ NO'}
          </Text>
        </Text>
      </View>
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
  headerThumbnail: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    marginBottom: 4,
  },
  headerThumbnailCompact: {
    width: 40,
    height: 40,
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
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  leftCol: {
    flex: 1.1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rightCol: {
    flex: 1,
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },

  // Profile text
  profileBlock: { width: '100%', gap: 3 },
  profileLabel: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 12,
    color: Colors.ink,
  },
  profileText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 11,
    color: Colors.inkMid,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  profileTextCompact: { fontSize: 9, lineHeight: 13 },

  // Aromas
  aromaHeader: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 12,
    color: Colors.ink,
  },
  aromaList: { gap: 7 },

  // Score
  scoreBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
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

  // Footer
  footer: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyAgain: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMid,
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

  // Shared small label
  smallLabel: { fontSize: 10 },
});
