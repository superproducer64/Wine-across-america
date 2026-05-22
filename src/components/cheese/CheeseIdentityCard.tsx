import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { Badge } from '@/components/ui/Badge';
import {
  CheeseEntry,
  CHEESE_STYLE_LABELS,
  CHEESE_STYLE_EMOJI,
  CHEESE_STYLE_EXAMPLES,
  MILK_TYPE_LABELS,
  PASTEURIZATION_LABELS,
} from '@/types';

interface Props {
  entry: CheeseEntry;
}

export function CheeseIdentityCard({ entry }: Props) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{CHEESE_STYLE_EMOJI[entry.style] ?? '🧀'}</Text>
        <View style={styles.headerText}>
          <Text style={styles.name}>{entry.name}</Text>
          {entry.producer ? (
            <Text style={styles.producer}>{entry.producer}</Text>
          ) : null}
        </View>
      </View>

      {/* Badge row */}
      <View style={styles.badges}>
        <Badge label={CHEESE_STYLE_LABELS[entry.style]} variant="gold" />
        <Badge label={MILK_TYPE_LABELS[entry.milk_type]} variant="muted" />
        <Badge
          label={PASTEURIZATION_LABELS[entry.pasteurization]}
          variant={entry.pasteurization === 'raw' ? 'terroir' : 'muted'}
        />
      </View>

      {/* Style example */}
      <Text style={styles.examples}>
        e.g. {CHEESE_STYLE_EXAMPLES[entry.style]}
      </Text>

      {/* Region */}
      {entry.region ? (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Region</Text>
          <Text style={styles.rowValue}>{entry.region}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 32,
    lineHeight: 38,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Fonts.playfair,
    fontSize: 22,
    color: Colors.ink,
    lineHeight: 28,
  },
  producer: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMid,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  examples: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  rowLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    width: 60,
  },
  rowValue: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.ink,
  },
});
