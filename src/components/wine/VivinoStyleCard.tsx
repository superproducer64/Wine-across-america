import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { WineEntry, AROMA_CATEGORIES } from '@/types';
import { getFoodPairings } from '@/utils/foodPairings';

interface Props {
  entry: WineEntry;
}

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ score }: { score: number }) {
  // Convert 0-100 technical score to 0-5 stars
  const starValue = (score / 100) * 5;
  const rounded = Math.round(starValue * 2) / 2; // round to nearest 0.5
  const display = rounded.toFixed(1);
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={starStyles.row}>
      <Text style={starStyles.number}>{display}</Text>
      <View style={starStyles.stars}>
        {stars.map((s) => {
          const filled = rounded >= s;
          const half = !filled && rounded >= s - 0.5;
          return (
            <Text
              key={s}
              style={[
                starStyles.star,
                filled && starStyles.starFilled,
                half && starStyles.starHalf,
              ]}
            >
              {filled ? '★' : half ? '⯨' : '☆'}
            </Text>
          );
        })}
      </View>
      <Text style={starStyles.outOf}>/ 5.0</Text>
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  number: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 28,
    color: Colors.ink,
    lineHeight: 32,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    paddingTop: 2,
  },
  star: {
    fontSize: 18,
    color: Colors.border,
  },
  starFilled: {
    color: Colors.gold,
  },
  starHalf: {
    color: Colors.gold,
  },
  outOf: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    paddingTop: 4,
  },
});

// ─── Axis Slider ─────────────────────────────────────────────────────────────

function AxisSlider({
  left,
  right,
  value,
}: {
  left: string;
  right: string;
  value: number; // 0-1
}) {
  return (
    <View style={axisStyles.row}>
      <Text style={axisStyles.label}>{left}</Text>
      <View style={axisStyles.track}>
        <View style={[axisStyles.dot, { left: `${Math.min(Math.max(value * 100, 4), 96)}%` as any }]} />
      </View>
      <Text style={[axisStyles.label, axisStyles.labelRight]}>{right}</Text>
    </View>
  );
}

const axisStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
    width: 58,
  },
  labelRight: {
    textAlign: 'right',
  },
  track: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.gold,
    top: -4,
    marginLeft: -5,
  },
});

// ─── Flavor Bar ──────────────────────────────────────────────────────────────

function FlavorBar({
  emoji,
  label,
  fill,
}: {
  emoji: string;
  label: string;
  fill: number; // 0-1
}) {
  return (
    <View style={flavorStyles.row}>
      <Text style={flavorStyles.emoji}>{emoji}</Text>
      <View style={flavorStyles.barWrap}>
        <Text style={flavorStyles.label}>{label}</Text>
        <View style={flavorStyles.track}>
          <View style={[flavorStyles.fill, { width: `${fill * 100}%` as any }]} />
        </View>
      </View>
    </View>
  );
}

const flavorStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 15,
    width: 22,
    textAlign: 'center',
  },
  barWrap: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMid,
  },
  track: {
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
  },
});

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return <Text style={sectionStyles.label}>{label}</Text>;
}

const sectionStyles = StyleSheet.create({
  label: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 10,
  },
});

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return <View style={{ height: 0.5, backgroundColor: Colors.border, marginVertical: Spacing.lg }} />;
}

// ─── Main Card ───────────────────────────────────────────────────────────────

export function VivinoStyleCard({ entry }: Props) {
  const score = entry.technical_score ?? 0;

  // Aroma profile — top 5 categories by frequency
  const aromaCounts: Record<string, number> = {};
  entry.aromas_l1.forEach((id) => {
    aromaCounts[id] = (aromaCounts[id] ?? 0) + 1;
  });
  const sortedAromas = Object.entries(aromaCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const maxAromaCount = sortedAromas[0]?.[1] ?? 1;

  // Top subcategory notes (aromas_l2 pill tags)
  const topNotes = entry.aromas_l2.slice(0, 6);

  // Structure axes (convert 1-10 to 0-1)
  const norm = (v: number) => (v - 1) / 9;

  // Food pairings
  const pairings = getFoodPairings(entry);

  // Origin line
  const originParts = [entry.country, entry.region].filter(Boolean);
  const origin = originParts.join(' · ');

  return (
    <View style={styles.card}>
      {/* ── Decorative Header ── */}
      <View style={styles.header}>
        {/* Top grape/terroir color band */}
        <View style={styles.colorBand} />

        <View style={styles.headerContent}>
          {/* Origin + vintage row */}
          <View style={styles.originRow}>
            {origin ? (
              <Text style={styles.originText}>{origin.toUpperCase()}</Text>
            ) : null}
            {entry.vintage ? (
              <View style={styles.vintagePill}>
                <Text style={styles.vintageText}>{entry.vintage}</Text>
              </View>
            ) : null}
          </View>

          {/* Wine name */}
          <Text style={styles.wineName}>{entry.name || 'Untitled Wine'}</Text>

          {/* Producer */}
          {entry.producer ? (
            <Text style={styles.producer}>{entry.producer}</Text>
          ) : null}

          {/* Appellation */}
          {entry.appellation ? (
            <Text style={styles.appellation}>{entry.appellation}</Text>
          ) : null}

          {/* Star Rating */}
          {score > 0 && <StarRating score={score} />}

          {/* Technical score label */}
          {score > 0 && (
            <Text style={styles.scoreSub}>Technical Score {score}/100</Text>
          )}
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>

        {/* Flavor Profile */}
        {sortedAromas.length > 0 && (
          <View style={styles.section}>
            <SectionHeader label="Flavor Profile" />
            <View style={{ gap: 10 }}>
              {sortedAromas.map(([id, count]) => {
                const cat = AROMA_CATEGORIES.find((c) => c.id === id);
                if (!cat) return null;
                return (
                  <FlavorBar
                    key={id}
                    emoji={cat.emoji}
                    label={cat.label}
                    fill={count / maxAromaCount}
                  />
                );
              })}
            </View>

            {/* Top notes pills */}
            {topNotes.length > 0 && (
              <View style={styles.pillsRow}>
                {topNotes.map((note) => (
                  <View key={note} style={styles.pill}>
                    <Text style={styles.pillText}>{note}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <Divider />

        {/* Style Profile */}
        <View style={styles.section}>
          <SectionHeader label="Style" />
          <View style={{ gap: 12 }}>
            <AxisSlider left="Dry" right="Sweet" value={1 - norm(entry.acidity)} />
            <AxisSlider left="Light Body" right="Full Body" value={norm(entry.body)} />
            <AxisSlider left="Soft" right="Tannic" value={norm(entry.tannin)} />
            <AxisSlider left="Low Acid" right="High Acid" value={norm(entry.acidity)} />
            <AxisSlider left="Cool" right="Warming" value={norm(entry.alcohol)} />
          </View>
        </View>

        {/* Food Pairings */}
        {pairings.length > 0 && (
          <>
            <Divider />
            <View style={styles.section}>
              <SectionHeader label="Pairs With" />
              <View style={styles.pairingsGrid}>
                {pairings.map((p) => (
                  <View key={p.label} style={styles.pairingItem}>
                    <Text style={styles.pairingEmoji}>{p.emoji}</Text>
                    <Text style={styles.pairingLabel}>{p.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Grapes */}
        {entry.grapes.length > 0 && (
          <>
            <Divider />
            <View style={styles.section}>
              <SectionHeader label="Grape Varieties" />
              <View style={styles.pillsRow}>
                {entry.grapes.map((g) => (
                  <View key={g} style={styles.pill}>
                    <Text style={styles.pillText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Flags */}
        {(entry.want_another_glass || entry.want_to_buy) && (
          <>
            <Divider />
            <View style={[styles.section, styles.flagsRow]}>
              {entry.want_another_glass && (
                <View style={styles.flag}>
                  <Text style={styles.flagEmoji}>🥂</Text>
                  <Text style={styles.flagText}>Would have another glass</Text>
                </View>
              )}
              {entry.want_to_buy && (
                <View style={styles.flag}>
                  <Text style={styles.flagEmoji}>🛒</Text>
                  <Text style={styles.flagText}>Would buy a bottle</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Footer */}
        <Divider />
        <View style={styles.footer}>
          {entry.location_name ? (
            <Text style={styles.footerMeta}>📍 {entry.location_name}</Text>
          ) : null}
          <Text style={styles.footerMeta}>
            {new Date(entry.tasting_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.watermark}>Pour Across America</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
    ...Shadows.md,
  },

  // Header
  header: {
    backgroundColor: Colors.white,
  },
  colorBand: {
    height: 8,
    backgroundColor: Colors.gold,
  },
  headerContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: 4,
  },
  originRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  originText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.inkMuted,
    flex: 1,
  },
  vintagePill: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  vintageText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  wineName: {
    fontFamily: Fonts.playfair,
    fontSize: 26,
    color: Colors.ink,
    lineHeight: 32,
  },
  producer: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  appellation: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  scoreSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
  },

  // Body sections
  body: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 0,
  },

  // Pills
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  pill: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  pillText: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMid,
  },

  // Pairings
  pairingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  pairingItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
  },
  pairingEmoji: {
    fontSize: 26,
  },
  pairingLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkMuted,
    textAlign: 'center',
  },

  // Flags
  flagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  flag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  flagEmoji: { fontSize: 14 },
  flagText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
  },

  // Footer
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: 4,
    alignItems: 'center',
  },
  footerMeta: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  watermark: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 11,
    color: Colors.gold,
    letterSpacing: 0.5,
    marginTop: 6,
  },
});
