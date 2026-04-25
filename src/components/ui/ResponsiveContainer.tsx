import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useResponsive, MAX_CONTENT_WIDTH } from '@/hooks/useResponsive';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
}

export function ResponsiveContainer({ children, style, maxWidth = MAX_CONTENT_WIDTH }: Props) {
  const { isWide } = useResponsive();

  return (
    <View
      style={[
        isWide && { maxWidth, alignSelf: 'center', width: '100%' },
        style,
      ]}
    >
      {children}
    </View>
  );
}
