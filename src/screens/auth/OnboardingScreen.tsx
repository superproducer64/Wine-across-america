import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '📝',
    title: 'Track Every Wheel',
    body: 'Capture cheese entries with a 5-category technical score, structure radar, and tasting notes — all in seconds.',
    accent: '#C9A84C',
  },
  {
    emoji: '📊',
    title: 'Discover Your Palate',
    body: 'Uncover your taste fingerprint with analytics across regions, styles, milk types, and score breakdowns.',
    accent: '#2E6B45',
  },
  {
    emoji: '⭐',
    title: 'Curated by Experts',
    body: 'Pro subscribers unlock creator-curated lists, monthly picks, and the Signature Score database.',
    accent: '#2E4E8B',
  },
];

export function OnboardingScreen({ navigation }: Props) {
  const [page, setPage] = useState(0);
  const slide = SLIDES[page];
  const isLast = page === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Skip */}
      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      {/* Slide content */}
      <View style={styles.slide}>
        <Text style={[styles.emoji, { shadowColor: slide.accent }]}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === page ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      <View style={styles.footer}>
        {page > 0 ? (
          <Pressable style={styles.backBtn} onPress={() => setPage((p) => p - 1)}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}

        <Pressable
          style={styles.nextBtn}
          onPress={() => {
            if (isLast) {
              navigation.navigate('Signup');
            } else {
              setPage((p) => p + 1);
            }
          }}
        >
          <Text style={styles.nextText}>{isLast ? 'Create Account' : 'Next'}</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => navigation.navigate('Login')} style={styles.signinLink}>
        <Text style={styles.signinText}>
          Already have an account? <Text style={styles.signinHighlight}>Sign in</Text>
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  topRow: {
    alignItems: 'flex-end',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  skip: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 28,
    color: Colors.gold,
    textAlign: 'center',
    lineHeight: 36,
  },
  body: {
    fontFamily: Fonts.dmSans,
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 23,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.xxl,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.gold,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
  },
  nextBtn: {
    flex: 2,
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: Colors.ink,
  },
  signinLink: {
    alignItems: 'center',
  },
  signinText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },
  signinHighlight: {
    color: Colors.gold,
    fontFamily: Fonts.dmSansRegular,
  },
});
