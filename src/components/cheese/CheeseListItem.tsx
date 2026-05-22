import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import {
  CheeseEntry,
  CHEESE_STYLE_LABELS,
  CHEESE_STYLE_EMOJI,
  MILK_TYPE_LABELS,
  PASTEURIZATION_LABELS,
} from '@/types';

const STYLE_BG: Record<string, string> = {
  bloomy:  '#FDF6F0',
  washed:  '#FEF0EC',
  alpine:  '#F0F7F0',
  blue:    '#F0F0FA',
  fresh:   '#F0F8FD',
  pressed: '#FDFAF0',
  hard:    '#F5F0EC',
};

interface Props {
  entry: CheeseEntry;
  onPress: (entry: CheeseEntry) => void;
}

export function CheeseListItem({ entry, onPress }: Props) {
  const bg = STYLE_BG[entry.style] ?? Colors.surfaceAlt;
  const date = new Date(entry.tasting_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(entry)}
    >
      {/* Style icon */}
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Text style={styles.icon}>{CHEESE_STYLE_EMOJI[entry.style] ?? '🧀'}</Text>
      </View>

      {/* Main info */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.name || 'Unnamed Cheese'}
        </Text>
        <Text style={styles.producer} numberOfLines={1}>
          {entry.producer || 'Unknown creamery'}
        </Text>
        <View style={styles.tags}>
          <Text style={styles.tag}>{CHEESE_STYLE_LABELS[entry.style]}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.tag}>{MILK_TYPE_LABELS[entry.milk_type]}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.tag}>{PASTEURIZATION_LABELS[entry.pasteurization]}</Text>
        </View>
      </View>

      {/* Right side */}
      <View style={styles.right}>
        {entry.region ? (
          <Text style={styles.region} numberOfLines={1}>{entry.region}</Text>
        ) : null}
        <Text style={styles.date}>{date}</Text>
        {entry.price != null ? (
          <Text style={styles.price}>${entry.price.toFixed(0)}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: Colors.surfaceAlt,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Fonts.playfair,
    fontSize: 15,
    color: Colors.ink,
    lineHeight: 20,
  },
  producer: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  tag: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkFaint,
  },
  dot: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkFaint,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  region: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.gold,
    maxWidth: 80,
    textAlign: 'right',
  },
  date: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkFaint,
  },
  price: {
    fontFamily: Fonts.playfair,
    fontSize: 14,
    color: Colors.ink,
  },
});
