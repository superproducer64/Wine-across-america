import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { useResponsive } from '@/hooks/useResponsive';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: Colors.gold,
      borderWidth: 0,
    },
    text: {
      color: Colors.ink,
    },
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: Colors.gold,
    },
    text: {
      color: Colors.gold,
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    text: {
      color: Colors.gold,
    },
  },
  destructive: {
    container: {
      backgroundColor: Colors.red,
      borderWidth: 0,
    },
    text: {
      color: Colors.white,
    },
  },
};

const sizeStyles: Record<Size, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingVertical: 8, paddingHorizontal: 14 },
    text: { fontSize: 13 },
  },
  md: {
    container: { paddingVertical: 12, paddingHorizontal: 20 },
    text: { fontSize: 15 },
  },
  lg: {
    container: { paddingVertical: 16, paddingHorizontal: 28 },
    text: { fontSize: 16 },
  },
};

const wideSizeExtra: Record<Size, ViewStyle> = {
  sm: { paddingVertical: 10, paddingHorizontal: 18 },
  md: { paddingVertical: 14, paddingHorizontal: 24 },
  lg: { paddingVertical: 18, paddingHorizontal: 32 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const { isWide } = useResponsive();
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        vs.container,
        ss.container,
        isWide && wideSizeExtra[size],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.ink : Colors.gold}
        />
      ) : (
        <Text style={[styles.text, vs.text, ss.text]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontFamily: Fonts.dmSansMedium,
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.45,
  },
});
