import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';


export interface PickerOption {
  label: string;
  sublabel?: string;
  hint?: string;
  value: number;
}

interface SegmentedPickerProps {
  label: string;
  tip?: string;
  options: PickerOption[];
  value: number;
  onChange: (value: number) => void;
  accentColor?: string;
  onInfo?: () => void;
}

/** Finds the option whose value is closest to `current`. */
function closestOption(options: PickerOption[], current: number): number {
  return options.reduce((best, opt) =>
    Math.abs(opt.value - current) < Math.abs(best.value - current) ? opt : best
  ).value;
}

export function SegmentedPicker({
  label,
  tip,
  options,
  value,
  onChange,
  accentColor = Colors.gold,
  onInfo,
}: SegmentedPickerProps) {
  const activeValue = closestOption(options, value);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {onInfo && (
            <Pressable onPress={onInfo} hitSlop={10} style={styles.infoBtn}>
              <Text style={styles.infoBtnText}>ⓘ</Text>
            </Pressable>
          )}
        </View>
        <View style={[styles.valueBadge, { backgroundColor: accentColor + '22', borderColor: accentColor + '66' }]}>
          <Text style={[styles.valueText, { color: accentColor }]}>{activeValue}</Text>
        </View>
      </View>

      {tip ? <Text style={styles.tip}>{tip}</Text> : null}

      <View style={styles.pillRow}>
        {options.map((opt) => {
          const isActive = opt.value === activeValue;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[
                styles.pill,
                isActive && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
            >
              <Text style={[styles.pillLabel, isActive && styles.pillLabelActive]}>
                {opt.label}
              </Text>
              {opt.sublabel ? (
                <Text style={[styles.pillSub, isActive && styles.pillSubActive]}>
                  {opt.sublabel}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {(() => {
        const activeOpt = options.find((o) => o.value === activeValue);
        return activeOpt?.hint ? (
          <Text style={styles.selectionHint}>{activeOpt.hint}</Text>
        ) : null;
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  label: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  infoBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBtnText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkFaint,
  },
  valueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  valueText: {
    fontFamily: Fonts.playfair,
    fontSize: 15,
    fontWeight: '600',
  },
  tip: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    flex: 1,
    minWidth: 60,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    gap: 2,
  },
  pillLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.inkMid,
    textAlign: 'center',
  },
  pillLabelActive: {
    color: Colors.surface,
  },
  pillSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkFaint,
    textAlign: 'center',
  },
  pillSubActive: {
    color: Colors.surface,
    opacity: 0.8,
  },
  selectionHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 17,
  },
});
