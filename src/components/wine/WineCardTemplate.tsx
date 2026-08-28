import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { WineEntry } from '@/types';
import { buildWineCardData } from './wineCardData';

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;

const CardColors = {
  paper: '#F6F1E7',
  ink: '#2B2420',
  heroAccent: '#B5502E',
  secondaryAccent: '#6B7156',
};

const CardFonts = {
  fraunces: 'Fraunces_900Black',
  workSansRegular: 'WorkSans_400Regular',
  workSansMedium: 'WorkSans_500Medium',
  workSansSemiBold: 'WorkSans_600SemiBold',
};

interface Props {
  entry: WineEntry;
  /**
   * Called once the card has "settled" and is safe to capture — immediately
   * on mount when there's no photo to wait for, otherwise after the photo
   * image has either loaded or failed to load. Optional: callers that don't
   * need a capture-readiness signal can omit it entirely.
   */
  onReady?: () => void;
}

export function WineCardTemplate({ entry, onReady }: Props) {
  const card = buildWineCardData(entry);
  const readyFired = useRef(false);

  const fireReady = () => {
    if (readyFired.current) return;
    readyFired.current = true;
    onReady?.();
  };

  useEffect(() => {
    if (!card.photoUrl) fireReady();
    // Only run this settling check for the initial mount / photo presence —
    // onReady itself is intentionally excluded so identity changes don't re-fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.photoUrl]);

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Tasting Note</Text>

      <View style={styles.gap40} />

      <Text style={styles.wineName} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.75}>
        {card.wineName}
      </Text>

      {card.producerVintage ? (
        <>
          <View style={styles.gap28} />
          <Text style={styles.producerVintage} numberOfLines={1}>
            {card.producerVintage}
          </Text>
        </>
      ) : null}

      {card.photoUrl ? (
        <>
          <View style={styles.gap40} />
          <Image
            source={{ uri: card.photoUrl }}
            style={styles.photo}
            contentFit="cover"
            cachePolicy="memory-disk"
            onLoad={fireReady}
            onError={fireReady}
          />
        </>
      ) : null}

      <View style={styles.gap56} />
      <View style={styles.divider} />
      <View style={styles.gap56} />

      {card.paaScore != null && (
        <View style={styles.scoreRow}>
          <Text style={styles.scoreNumber}>{card.paaScore}</Text>
          <View style={styles.scoreLabelCol}>
            <Text style={styles.scoreOutOf}>/ 100</Text>
            <View style={styles.gap10} />
            <Text style={styles.scoreLabel}>PAA Score</Text>
          </View>
        </View>
      )}

      <View style={styles.gap56} />
      <View style={styles.divider} />
      <View style={styles.gap56} />

      {card.region ? (
        <>
          <Text style={styles.fieldLabel}>Region</Text>
          <View style={styles.gap12} />
          <Text style={styles.fieldValue} numberOfLines={1}>{card.region}</Text>
          <View style={styles.gap48} />
        </>
      ) : null}

      {card.descriptors.length > 0 ? (
        <>
          <Text style={styles.fieldLabel}>Notes</Text>
          <View style={styles.gap16} />
          <View style={styles.pillRow}>
            {card.descriptors.map((d) => (
              <View key={d} style={styles.pill}>
                <Text style={styles.pillText}>{d}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.spacer} />

      <View style={styles.tier3Row}>
        {[card.grapeBlend, card.tastingDate, card.location]
          .filter((v): v is string => Boolean(v))
          .map((val, i, arr) => (
            <React.Fragment key={val}>
              <Text style={styles.tier3Text}>{val}</Text>
              {i < arr.length - 1 ? <View style={styles.tier3Dot} /> : null}
            </React.Fragment>
          ))}
      </View>

      <View style={styles.gap48} />
      <View style={styles.footerDivider} />
      <View style={styles.gap32} />

      <View style={styles.footerRow}>
        <Text style={styles.footerWordmark}>Pour Across America</Text>
        <Text style={styles.footerLine}>Download on the App Store</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: CardColors.paper,
    paddingTop: 96,
    paddingBottom: 64,
    paddingHorizontal: 88,
  },
  gap10: { height: 10 },
  gap12: { height: 12 },
  gap16: { height: 16 },
  gap28: { height: 28 },
  gap32: { height: 32 },
  gap40: { height: 40 },
  gap48: { height: 48 },
  gap56: { height: 56 },
  eyebrow: {
    fontFamily: CardFonts.workSansSemiBold,
    fontSize: 24,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: CardColors.secondaryAccent,
  },
  wineName: {
    fontFamily: CardFonts.fraunces,
    fontSize: 88,
    lineHeight: 92,
    color: CardColors.ink,
  },
  producerVintage: {
    fontFamily: CardFonts.workSansMedium,
    fontSize: 36,
    color: CardColors.ink,
    opacity: 0.72,
  },
  photo: {
    width: '100%',
    height: 480,
    borderRadius: 12,
    backgroundColor: '#00000010',
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: CardColors.secondaryAccent,
    opacity: 0.28,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
  },
  scoreNumber: {
    fontFamily: CardFonts.fraunces,
    fontSize: 260,
    lineHeight: 213,
    color: CardColors.heroAccent,
  },
  scoreLabelCol: {
    paddingBottom: 30,
  },
  scoreOutOf: {
    fontFamily: CardFonts.workSansSemiBold,
    fontSize: 32,
    color: CardColors.heroAccent,
    opacity: 0.85,
  },
  scoreLabel: {
    fontFamily: CardFonts.workSansSemiBold,
    fontSize: 22,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: CardColors.secondaryAccent,
  },
  fieldLabel: {
    fontFamily: CardFonts.workSansSemiBold,
    fontSize: 22,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: CardColors.secondaryAccent,
  },
  fieldValue: {
    fontFamily: CardFonts.workSansMedium,
    fontSize: 34,
    color: CardColors.ink,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  pill: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: CardColors.secondaryAccent,
    borderRadius: 999,
  },
  pillText: {
    fontFamily: CardFonts.workSansMedium,
    fontSize: 26,
    color: CardColors.ink,
  },
  spacer: { flex: 1 },
  tier3Row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 24,
  },
  tier3Text: {
    fontFamily: CardFonts.workSansRegular,
    fontSize: 24,
    color: CardColors.ink,
    opacity: 0.55,
  },
  tier3Dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CardColors.ink,
    opacity: 0.4,
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: CardColors.ink,
    opacity: 0.15,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerWordmark: {
    fontFamily: CardFonts.fraunces,
    fontSize: 28,
    color: CardColors.ink,
    opacity: 0.35,
    letterSpacing: 1,
  },
  footerLine: {
    fontFamily: CardFonts.workSansMedium,
    fontSize: 22,
    color: CardColors.ink,
    opacity: 0.35,
  },
});
