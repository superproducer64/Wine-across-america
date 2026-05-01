import React from 'react';
import { Pressable, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Fonts, Radius, Spacing, Shadows } from '@/theme';
import { LABEL_PHOTO_PLACEHOLDER } from '@/utils/imagePlaceholder';
import { WineEntry } from '@/types';

interface WineListItemProps {
  entry: WineEntry;
  onPress: (entry: WineEntry) => void;
  style?: ViewStyle;
}

const COUNTRY_FLAGS: Record<string, string> = {
  France: '🇫🇷',
  Italy: '🇮🇹',
  Spain: '🇪🇸',
  'United States': '🇺🇸',
  Germany: '🇩🇪',
  Portugal: '🇵🇹',
  Argentina: '🇦🇷',
  Chile: '🇨🇱',
  Australia: '🇦🇺',
  'New Zealand': '🇳🇿',
  Austria: '🇦🇹',
};

export const WineListItem = React.memo(function WineListItem({ entry, onPress, style }: WineListItemProps) {
  const flag = COUNTRY_FLAGS[entry.country] ?? '🍷';
  const scoreLabel = entry.technical_score >= 85 ? 'Outstanding' : entry.technical_score >= 70 ? 'Very Good' : 'Good';

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}
      onPress={() => onPress(entry)}
    >
      <View style={styles.flagCol}>
        {entry.label_photo_url ? (
          <Image
            source={{ uri: entry.label_photo_url }}
            style={styles.thumbnail}
            contentFit="cover"
            cachePolicy="memory-disk"
            placeholder={entry.label_photo_blurhash ?? LABEL_PHOTO_PLACEHOLDER}
            placeholderContentFit="cover"
            transition={300}
          />
        ) : (
          <Text style={styles.flag}>{flag}</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {entry.name || 'Unnamed Wine'}
        </Text>
        <Text style={styles.producer} numberOfLines={1}>
          {entry.producer ? `${entry.producer} · ` : ''}{entry.vintage ?? '—'}
          {entry.region ? ` · ${entry.region}` : ''}
        </Text>
        {entry.grapes.length > 0 && (
          <Text style={styles.grapes} numberOfLines={1}>
            {entry.grapes.slice(0, 2).join(', ')}
            {entry.grapes.length > 2 ? ` +${entry.grapes.length - 2}` : ''}
          </Text>
        )}
      </View>
      <View style={styles.scoreCol}>
        <Text style={styles.score}>{entry.technical_score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
      </View>
    </Pressable>
  );
});

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
  flagCol: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnail: {
    width: 36,
    height: 36,
    backgroundColor: Colors.surfaceAlt,
  },
  flag: {
    fontSize: 20,
  },
  info: {
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
  grapes: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkFaint,
    fontStyle: 'italic',
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  score: {
    fontFamily: Fonts.playfair,
    fontSize: 22,
    color: Colors.gold,
    lineHeight: 26,
  },
  scoreMax: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkFaint,
  },
});
