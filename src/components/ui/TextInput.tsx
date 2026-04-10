import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
}

export function TextInput({ label, error, hint, containerStyle, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <RNTextInput
        {...props}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          props.multiline && styles.multiline,
          style,
        ]}
        placeholderTextColor={Colors.inkFaint}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 6,
  },
  input: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
  },
  inputFocused: {
    borderColor: Colors.gold,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.red,
  },
  multiline: {
    height: 96,
    textAlignVertical: 'top',
    paddingTop: 11,
  },
  error: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.red,
    marginTop: 4,
  },
  hint: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 4,
  },
});
