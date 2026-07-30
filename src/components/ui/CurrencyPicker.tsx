import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { SUPPORTED_CURRENCIES } from '@/utils/currency';

interface Props {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  containerStyle?: ViewStyle;
}

export function CurrencyPicker({ value, onChange, label = 'Currency', containerStyle }: Props) {
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {SUPPORTED_CURRENCIES.map(({ code, symbol }) => (
          <Pressable
            key={code}
            style={[styles.btn, value === code && styles.btnActive]}
            onPress={() => onChange(code)}
            hitSlop={4}
          >
            <Text style={[styles.btnText, value === code && styles.btnTextActive]}>{symbol}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  btnActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(196,132,122,0.12)',
  },
  btnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.inkMuted,
  },
  btnTextActive: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.gold,
  },
});
