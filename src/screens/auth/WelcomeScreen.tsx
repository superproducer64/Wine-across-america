import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1A1710', '#0E0C08', '#1A1710']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safe}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.emoji}>🧀</Text>
            <Text style={styles.title}>Cheese Across{'\n'}America</Text>
            <Text style={styles.tagline}>The Artisan Cheese Journal</Text>

            <View style={styles.decorRow}>
              <View style={styles.decorLine} />
              <Text style={styles.decorText}>EST. 2024</Text>
              <View style={styles.decorLine} />
            </View>
          </View>

          {/* Feature pills */}
          <View style={styles.pills}>
            {['Score & Track', 'Discover Your Palate', 'Creator Picks'].map((f) => (
              <View key={f} style={styles.pill}>
                <Text style={styles.pillText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* CTAs */}
          <View style={styles.ctas}>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Onboarding')}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.secondaryBtnText}>Sign In</Text>
            </Pressable>
          </View>

          <Text style={styles.legal}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 36,
    color: Colors.gold,
    textAlign: 'center',
    lineHeight: 44,
  },
  tagline: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  decorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  decorLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'rgba(201,168,76,0.3)',
  },
  decorText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(201,168,76,0.4)',
  },
  pills: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.xl,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: 'rgba(201,168,76,0.3)',
  },
  pillText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  ctas: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  primaryBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 16,
    color: Colors.ink,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(201,168,76,0.35)',
  },
  secondaryBtnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  legal: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 15,
  },
});
