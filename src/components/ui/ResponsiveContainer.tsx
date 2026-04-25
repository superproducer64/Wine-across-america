import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useResponsive, MAX_CONTENT_WIDTH } from '@/hooks/useResponsive';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
}

export function ResponsiveContainer({ children, style, maxWidth = MAX_CONTENT_WIDTH }: Props) {
  const { isWide } = useResponsive();

  if (!isWide) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.wrapper, { maxWidth }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignSelf: 'center',
  },
});
