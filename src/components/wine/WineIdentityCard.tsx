import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { WineEntry } from '@/types';
import { RadarChart } from '@/components/charts/RadarChart';
import { AromaDonutChart } from '@/components/charts/AromaDonutChart';
import { StyleSummaryBar } from '@/components/wine/StyleSummaryBar';
import { TerriorBadge } from '@/components/wine/TerriorBadge';
import { TechnicalScoreDisplay } from '@/components/wine/TechnicalScoreDisplay';
import { generateProfileText } from '@/utils/profileText';
import { Badge } from '@/components/ui/Badge';

interface WineIdentityCardProps {
  entry: WineEntry;
  showSignatureScore?: boolean;
  compact?: boolean;
}

export function WineIdentityCard({
  entry,
  showSignatureScore = false,
  compact = false,
}: WineIdentityCardProps) {
  const profileText = generateProfileText(entry);

  const scores = {
    acidity: entry.acidity,
    tannin: entry.tannin,
    body: entry.body,
    alcohol: entry.alcohol,
    intensity: entry.intensity,
    finish_length: entry.finish_length,
  };

  return (
    <View style={[styles.card, Shadows.md]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerMeta}>
          <Text style={styles.metaLabel}>
            {entry.country}{entry.region ? ` · ${entry.region}` : ''}
          </Text>
          {entry.vintage ? (
            <Badge label={String(entry.vintage)} variant="gold" />
          ) : null}
        </View>
        <Text style={styles.wineName}>{entry.name || 'Untitled Wine'}</Text>
        {entry.producer ? (
          <Text style={styles.producer}>{entry.producer}</Text>
        ) : null}
        {entry.appellation ? (
          <Text style={styles.appellation}>{entry.appellation}</Text>
        ) : null}
      </View>

      {/* Radar Chart */}
      <View style={styles.section}>
        <RadarChart scores={scores} size={compact ? 180 : 220} />
      </View>

      {/* Style Summary */}
      <View style={styles.section}>
        <StyleSummaryBar entry={entry} />
      </View>

      {/* Aroma Profile */}
      {entry.aromas_l1.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Aroma Profile</Text>
          <AromaDonutChart aromasL1={entry.aromas_l1} aromasL2={entry.aromas_l2} size={160} />
        </View>
      )}

      {/* Profile Text */}
      {profileText ? (
        <View style={styles.section}>
          <Text style={styles.profileText}>{profileText}</Text>
        </View>
      ) : null}

      {/* Technical Score */}
      <View style={styles.section}>
        <TechnicalScoreDisplay entry={entry} />
      </View>

      {/* Dual Score (if signature exists) */}
      {showSignatureScore && entry.signature_score != null && (
        <View style={styles.dualScore}>
          <Text style={styles.dualScoreText}>
            Technical: {entry.technical_score} | Signature: {entry.signature_score}
          </Text>
        </View>
      )}

      {/* Terroir Badge */}
      <View style={styles.section}>
        <TerriorBadge
          soil={entry.terroir_soil}
          climate={entry.terroir_climate}
          visible={entry.terroir_visible}
        />
      </View>

      {/* Quick flags */}
      <View style={styles.flags}>
        {entry.want_another_glass && (
          <View style={styles.flag}>
            <Text style={styles.flagEmoji}>🥂</Text>
            <Text style={styles.flagText}>Want another glass</Text>
          </View>
        )}
        {entry.want_to_buy && (
          <View style={styles.flag}>
            <Text style={styles.flagEmoji}>🛒</Text>
            <Text style={styles.flagText}>Would buy a bottle</Text>
          </View>
        )}
      </View>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <View style={styles.tags}>
          {entry.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Watermark */}
      <Text style={styles.watermark}>Pour Across America</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: Colors.ink,
    padding: Spacing.xl,
    gap: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  wineName: {
    fontFamily: Fonts.playfair,
    fontSize: 22,
    color: Colors.white,
    lineHeight: 28,
  },
  producer: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  appellation: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  sectionLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: Spacing.sm,
  },
  profileText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 13,
    color: Colors.inkMid,
    lineHeight: 20,
  },
  dualScore: {
    backgroundColor: Colors.goldPale,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  dualScoreText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.inkMid,
    letterSpacing: 0.3,
  },
  flags: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  flag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  flagEmoji: {
    fontSize: 14,
  },
  flagText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  tags: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  tagText: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  watermark: {
    textAlign: 'center',
    fontFamily: Fonts.playfairItalic,
    fontSize: 10,
    color: Colors.inkFaint,
    paddingVertical: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    letterSpacing: 0.5,
  },
});
