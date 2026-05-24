import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { AROMA_CATEGORIES, AROMA_GROUPS } from '@/types';
import { Fonts } from '@/theme';

interface AromaDonutChartProps {
  aromasL1: string[];
  size?: number;
}

const GAP_DEG = 2.5;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const s1 = polarToCartesian(cx, cy, outerR, startAngle);
  const e1 = polarToCartesian(cx, cy, outerR, endAngle);
  const s2 = polarToCartesian(cx, cy, innerR, endAngle);
  const e2 = polarToCartesian(cx, cy, innerR, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${s1.x.toFixed(3)} ${s1.y.toFixed(3)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${e1.x.toFixed(3)} ${e1.y.toFixed(3)}`,
    `L ${s2.x.toFixed(3)} ${s2.y.toFixed(3)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${e2.x.toFixed(3)} ${e2.y.toFixed(3)}`,
    'Z',
  ].join(' ');
}

export function AromaDonutChart({ aromasL1, size = 180 }: AromaDonutChartProps) {
  if (!aromasL1.length) return null;

  // Map each category ID → its group
  const catToGroup: Record<string, typeof AROMA_GROUPS[0]> = {};
  AROMA_GROUPS.forEach((g) => {
    g.categoryIds.forEach((cid) => { catToGroup[cid] = g; });
  });

  // Count aromas per group
  const groupCounts: Record<string, number> = {};
  aromasL1.forEach((catId) => {
    const g = catToGroup[catId];
    if (g) groupCounts[g.id] = (groupCounts[g.id] ?? 0) + 1;
  });

  const activeGroups = AROMA_GROUPS.filter((g) => (groupCounts[g.id] ?? 0) > 0);
  const total = Object.values(groupCounts).reduce((a, b) => a + b, 0);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.55;

  // Build arc segments
  const gapTotal = GAP_DEG * activeGroups.length;
  const dataTotal = 360 - gapTotal;

  const segments: { path: string; color: string; group: typeof AROMA_GROUPS[0]; count: number }[] = [];
  let currentAngle = 0;

  activeGroups.forEach((g) => {
    const count = groupCounts[g.id] ?? 0;
    const sweep = (count / total) * dataTotal;
    const start = currentAngle;
    const end = currentAngle + sweep;
    segments.push({
      path: arcPath(cx, cy, outerR, innerR, start, end),
      color: g.color,
      group: g,
      count,
    });
    currentAngle = end + GAP_DEG;
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>
          {segments.map((seg) => (
            <Path key={seg.group.id} d={seg.path} fill={seg.color} />
          ))}
        </G>
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {segments.map((seg) => (
          <View key={seg.group.id} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: seg.color }]} />
            <Text style={styles.legendEmoji}>{seg.group.emoji}</Text>
            <Text style={styles.legendLabel}>{seg.group.label}</Text>
            <Text style={styles.legendCount}>×{seg.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  legend: {
    flex: 1,
    gap: 7,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendEmoji: {
    fontSize: 13,
  },
  legendLabel: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: '#4A3540',
    flex: 1,
  },
  legendCount: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: '#9A8590',
  },
});
