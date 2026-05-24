import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { AROMA_CATEGORIES, AROMA_GROUPS } from '@/types';
import { Fonts } from '@/theme';

interface AromaDonutChartProps {
  aromasL1: string[];
  size?: number;
  showLegend?: boolean;
}

const GAP = 2;

function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${[r, g, b]
    .map((c) => Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0'))
    .join('')}`;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  start: number, end: number,
): string {
  const s1 = polar(cx, cy, outerR, start);
  const e1 = polar(cx, cy, outerR, end);
  const s2 = polar(cx, cy, innerR, end);
  const e2 = polar(cx, cy, innerR, start);
  const large = end - start > 180 ? 1 : 0;
  return [
    `M ${s1.x.toFixed(2)} ${s1.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${e1.x.toFixed(2)} ${e1.y.toFixed(2)}`,
    `L ${s2.x.toFixed(2)} ${s2.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${e2.x.toFixed(2)} ${e2.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

export function AromaDonutChart({ aromasL1, size = 220, showLegend = true }: AromaDonutChartProps) {
  if (!aromasL1.length) return null;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const midR   = outerR * 0.66;
  const holeR  = outerR * 0.36;

  // Map category ID → group
  const catToGroup: Record<string, typeof AROMA_GROUPS[0]> = {};
  AROMA_GROUPS.forEach((g) => g.categoryIds.forEach((cid) => { catToGroup[cid] = g; }));

  // Deduplicate and group selected categories
  const unique = [...new Set(aromasL1)];
  const groupSelectedCats: Record<string, string[]> = {};
  unique.forEach((catId) => {
    const g = catToGroup[catId];
    if (!g) return;
    if (!groupSelectedCats[g.id]) groupSelectedCats[g.id] = [];
    groupSelectedCats[g.id].push(catId);
  });

  const activeGroups = AROMA_GROUPS.filter((g) => (groupSelectedCats[g.id]?.length ?? 0) > 0);
  const total = activeGroups.reduce((s, g) => s + (groupSelectedCats[g.id]?.length ?? 0), 0);

  const totalGap = GAP * activeGroups.length;
  const dataSpan = 360 - totalGap;

  type InnerSeg = { path: string; color: string; midAngle: number; emoji: string; groupId: string };
  type OuterSeg = { path: string; color: string };

  const innerSegs: InnerSeg[] = [];
  const outerSegs: OuterSeg[] = [];

  let angle = 0;
  activeGroups.forEach((g) => {
    const cats = groupSelectedCats[g.id] ?? [];
    const groupSweep = (cats.length / total) * dataSpan;
    const groupStart = angle;
    const groupEnd   = angle + groupSweep;

    innerSegs.push({
      path: arcPath(cx, cy, midR - 1, holeR, groupStart, groupEnd),
      color: g.color,
      midAngle: (groupStart + groupEnd) / 2,
      emoji: g.emoji,
      groupId: g.id,
    });

    // Subdivide outer ring for each selected category in this group
    const catGapTotal = GAP * cats.length;
    const catSpan = groupSweep - catGapTotal;
    const perCat = cats.length > 0 ? catSpan / cats.length : 0;
    let catAngle = groupStart;

    cats.forEach((_, i) => {
      const shade = i % 2 === 0 ? lightenHex(g.color, 0.42) : lightenHex(g.color, 0.22);
      outerSegs.push({
        path: arcPath(cx, cy, outerR, midR + 1, catAngle, catAngle + perCat),
        color: shade,
      });
      catAngle += perCat + GAP;
    });

    angle = groupEnd + GAP;
  });

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        {outerSegs.map((s, i) => <Path key={`o${i}`} d={s.path} fill={s.color} />)}
        {innerSegs.map((s) => <Path key={`i${s.groupId}`} d={s.path} fill={s.color} />)}

        {/* Center hole */}
        <Circle cx={cx} cy={cy} r={holeR - 2} fill="#FDF8F4" />
        <SvgText
          x={cx} y={cy - 4}
          textAnchor="middle"
          fontSize={22}
          fill="#1F1518"
        >
          🍷
        </SvgText>
        <SvgText
          x={cx} y={cy + 13}
          textAnchor="middle"
          fontSize={9}
          fill="#9A8590"
        >
          {total} aroma{total !== 1 ? 's' : ''}
        </SvgText>

        {/* Group emoji labels on inner ring */}
        {innerSegs.map((s) => {
          const pos = polar(cx, cy, (midR - 1 + holeR) / 2, s.midAngle);
          return (
            <SvgText
              key={`lbl${s.groupId}`}
              x={pos.x} y={pos.y + 5}
              textAnchor="middle"
              fontSize={11}
              fill="white"
            >
              {s.emoji}
            </SvgText>
          );
        })}
      </Svg>

      {showLegend && (
        <View style={styles.legend}>
          {activeGroups.map((g) => {
            const cats = groupSelectedCats[g.id] ?? [];
            return (
              <View key={g.id} style={styles.legendGroup}>
                <View style={styles.legendHeader}>
                  <View style={[styles.dot, { backgroundColor: g.color }]} />
                  <Text style={styles.legendGroupLabel}>{g.emoji} {g.label}</Text>
                </View>
                <View style={styles.catPills}>
                  {cats.map((catId) => {
                    const cat = AROMA_CATEGORIES.find((c) => c.id === catId);
                    if (!cat) return null;
                    return (
                      <View key={catId} style={[styles.pill, { borderColor: g.color + '55' }]}>
                        <Text style={styles.pillText}>{cat.emoji} {cat.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 12,
  },
  legend: {
    width: '100%',
    gap: 8,
  },
  legendGroup: {
    gap: 4,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendGroupLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: '#4A3540',
    letterSpacing: 0.2,
  },
  catPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    paddingLeft: 14,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FDF8F4',
  },
  pillText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 11,
    color: '#4A3540',
  },
});
