import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { getStyleSummary, WineEntry } from '@/types';
import { InfoPopover } from '@/components/ui/InfoPopover';

interface StyleSummaryBarProps {
  entry: Partial<WineEntry>;
}

interface AxisInfo {
  leftLabel: string;
  rightLabel: string;
  description: string;
}

const AXIS_INFO: AxisInfo[] = [
  {
    leftLabel: 'Dry',
    rightLabel: 'Sweet',
    description:
      'Perceived sweetness from residual sugar or very ripe fruit. A dry wine has little to no sugar; a sweet wine has noticeable sweetness on the finish.',
  },
  {
    leftLabel: 'Light',
    rightLabel: 'Full',
    description:
      'Body is the weight and richness of the wine on your palate — think of it like the difference between skim milk (light) and whole milk (full). Driven by alcohol, extract, and ripeness.',
  },
  {
    leftLabel: 'Low Acid',
    rightLabel: 'High Acid',
    description:
      'Acidity gives wine its crispness, freshness, and structure. High-acid wines taste lively and pair well with food; low-acid wines feel rounder and softer.',
  },
  {
    leftLabel: 'Soft',
    rightLabel: 'Tannic',
    description:
      'Tannins are polyphenols from grape skins, seeds, and oak that create a drying, grippy sensation. Higher tannin = more structure and aging potential — more common in red wines.',
  },
];

interface AxisProps {
  info: AxisInfo;
  value: number;
  onPress: () => void;
}

function Axis({ info, value, onPress }: AxisProps) {
  return (
    <TouchableOpacity style={styles.axisRow} onPress={onPress} activeOpacity={0.6}>
      <Text style={styles.axisLabel}>{info.leftLabel}</Text>
      <View style={styles.track}>
        <View style={[styles.indicator, { left: `${value * 100}%` }]} />
      </View>
      <Text style={[styles.axisLabel, styles.rightLabel]}>{info.rightLabel}</Text>
      <View style={styles.infoBtn}>
        <Text style={styles.infoBtnText}>i</Text>
      </View>
    </TouchableOpacity>
  );
}

export function StyleSummaryBar({ entry }: StyleSummaryBarProps) {
  const summary = getStyleSummary(entry);
  const [active, setActive] = useState<AxisInfo | null>(null);

  const values = [1 - summary.dryness, summary.fullness, summary.acidity, summary.tannin];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Style Profile</Text>
      {AXIS_INFO.map((info, i) => (
        <Axis
          key={info.leftLabel}
          info={info}
          value={values[i]}
          onPress={() => setActive(info)}
        />
      ))}

      <InfoPopover
        visible={active !== null}
        onClose={() => setActive(null)}
        title={`${active?.leftLabel} → ${active?.rightLabel}`}
      >
        <Text style={popoverStyles.description}>{active?.description}</Text>
      </InfoPopover>
    </View>
  );
}

const popoverStyles = StyleSheet.create({
  description: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMid,
    lineHeight: 21,
  },
});

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
  infoBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    color: Colors.inkMid,
    lineHeight: 14,
  },
});
