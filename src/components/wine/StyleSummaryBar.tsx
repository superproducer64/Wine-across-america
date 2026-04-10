import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { getStyleSummary, WineEntry } from '@/types';

interface StyleSummaryBarProps {
  entry: Partial<WineEntry>;
}

interface AxisProps {
  leftLabel: string;
  rightLabel: string;
  value: number; // 0-1
}

function Axis({ leftLabel, rightLabel, value }: AxisProps) {
  return (
    <View style={styles.axisRow}>
      <Text style={styles.axisLabel}>{leftLabel}</Text>
      <View style={styles.track}>
        <View style={[styles.indicator, { left: `${value * 100}%` }]} />
      </View>
      <Text style={[styles.axisLabel, styles.rightLabel]}>{rightLabel}</Text>
    </View>
  );
}

export function StyleSummaryBar({ entry }: StyleSummaryBarProps) {
  const summary = getStyleSummary(entry);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Style Profile</Text>
      <Axis leftLabel="Dry" rightLabel="Sweet" value={1 - summary.dryness} />
      <Axis leftLabel="Light" rightLabel="Full" value={summary.fullness} />
      <Axis leftLabel="Low Acid" rightLabel="High Acid" value={summary.acidity} />
      <Axis leftLabel="Soft" rightLabel="Tannic" value={summary.tannin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  heading: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 2,
  },
  axisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  axisLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkMuted,
    width: 52,
  },
  rightLabel: {
    textAlign: 'right',
  },
  track: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.gold,
    top: -4,
    marginLeft: -6,
  },
});
