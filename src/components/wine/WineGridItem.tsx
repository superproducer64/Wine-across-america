import React from 'react';
import { Pressable, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { LABEL_PHOTO_PLACEHOLDER } from '@/utils/imagePlaceholder';
import { useLazyBlurhashBackfill } from '@/hooks/useLazyBlurhashBackfill';
import { WineEntry } from '@/types';

interface WineGridItemProps {
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

export const WineGridItem = React.memo(function WineGridItem({ entry, onPress, style }: WineGridItemProps) {
  useLazyBlurhashBackfill(entry);
  const flag = COUNTRY_FLAGS[entry.country] ?? '🍷';
  const scoreLabel =
    entry.technical_score >= 90 ? 'Exceptional' :
    entry.technical_score >= 85 ? 'Outstanding' :
    entry.technical_score >= 70 ? 'Very Good' : 'Good';

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}
      onPress={() => onPress(entry)}
    >
      {/* Cover image / flag */}
      <View style={styles.imageWrap}>
        {entry.label_photo_url ? (
          <Image
            source={{ uri: entry.label_photo_url }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            placeholder={entry.label_photo_blurhash ?? LABEL_PHOTO_PLACEHOLDER}
            placeholderContentFit="cover"
            transition={300}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.flagText}>{flag}</Text>
          </View>
        )}

        {/* Score badge overlaid on the image */}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeValue}>{entry.technical_score}</Text>
        </View>
      </View>

      {/* Info section */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {entry.name || 'Unnamed Wine'}
        </Text>

        {entry.producer ? (
          <Text style={styles.producer} numberOfLines={1}>
            {entry.producer}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          {entry.vintage ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{entry.vintage}</Text>
            </View>
          ) : null}
          {entry.region ? (
            <View style={styles.pill}>
              <Text style={styles.pillText} numberOfLines={1}>{entry.region}</Text>
            </View>
          ) : null}
        </View>

        {entry.grapes.length > 0 && (
          <Text style={styles.grapes} numberOfLines={1}>
            {entry.grapes.slice(0, 2).join(', ')}
            {entry.grapes.length > 2 ? ` +${entry.grapes.length - 2}` : ''}
          </Text>
        )}

        <Text style={styles.scoreLabel}>{scoreLabel}</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  pressed: {
    opacity: 0.82,
    backgroundColor: Colors.surfaceAlt,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 3 / 2,
    backgroundColor: Colors.surfaceAlt,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.goldPale,
  },
  flagText: {
    fontSize: 40,
  },
  scoreBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    minWidth: 36,
    alignItems: 'center',
  },
  scoreBadgeValue: {
    fontFamily: Fonts.playfair,
    fontSize: 15,
    color: Colors.gold,
    lineHeight: 20,
  },
  info: {
    padding: Spacing.md,
    gap: 4,
  },
  name: {
    fontFamily: Fonts.playfair,
    fontSize: 14,
    color: Colors.ink,
    lineHeight: 19,
  },
  producer: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  pill: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: Colors.border,
    maxWidth: 100,
  },
  pillText: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkMuted,
  },
  grapes: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkFaint,
    fontStyle: 'italic',
  },
  scoreLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    color: Colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
});
