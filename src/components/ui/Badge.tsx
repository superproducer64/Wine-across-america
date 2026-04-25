import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts, Radius } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';

type BadgeVariant = 'gold' | 'muted' | 'terroir' | 'pro' | 'score';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantMap: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  gold: { bg: Colors.goldPale, text: Colors.inkMid, border: Colors.borderStrong },
  muted: { bg: Colors.surfaceAlt, text: Colors.inkMuted, border: Colors.border },
  terroir: { bg: '#EAF5EE', text: Colors.green, border: '#A5D6B5' },
  pro: { bg: Colors.ink, text: Colors.gold, border: 'rgba(201,168,76,0.3)' },
  score: { bg: Colors.ink, text: Colors.goldLight, border: 'rgba(201,168,76,0.2)' },
};

export function Badge({ label, variant = 'gold', style }: BadgeProps) {
  const { isWide } = useResponsive();
  const v = variantMap[variant];
  return (
    <View
      style={[
        styles.base,
        isWide && styles.baseWide,
        { backgroundColor: v.bg, borderColor: v.border },
        style,
      ]}
    >
      <Text style={[styles.text, isWide && styles.textWide, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 0.5,
  },
  baseWide: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  text: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  textWide: {
    fontSize: 12,
  },
});
