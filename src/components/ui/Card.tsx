import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  dark?: boolean;
}

export function Card({ children, style, elevated = false, dark = false }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        dark ? styles.dark : styles.light,
        elevated && Shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
  },
  light: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  dark: {
    backgroundColor: Colors.ink,
    borderColor: 'rgba(201,168,76,0.2)',
  },
});
