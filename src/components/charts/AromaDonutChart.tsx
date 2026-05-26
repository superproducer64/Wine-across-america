import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Modal, Pressable, ScrollView, Platform } from 'react-native';
import Svg, { Path, Circle, Text as SvgText, G } from 'react-native-svg';
import { AROMA_CATEGORIES, AROMA_GROUPS } from '@/types';
import { Colors, Fonts, Spacing, Radius } from '@/theme';

export interface AromaDonutChartProps {
  aromasL1: string[];
  aromasL2?: string[];
  size?: number;
  showLegend?: boolean;
  pinchable?: boolean;
}

const GAP = 1.5;

// Module-level note→category lookup (built once)
const NOTE_TO_CATEGORY: Record<string, string> = {};
AROMA_CATEGORIES.forEach(cat => {
  [...cat.subcategories, ...(cat.sommelierSubcategories ?? [])].forEach(note => {
    NOTE_TO_CATEGORY[note.toLowerCase()] = cat.id;
  });
});

function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${[r, g, b]
    .map(c => Math.round(c + (255 - c) * amount).toString(16).padStart(2, '0'))
    .join('')}`;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  start: number, end: number,
): string {
  if (end - start < 0.1) return '';
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

function labelRotation(midAngle: number) {
  // Flip text in the bottom half (90°–270°) so it never renders upside-down
  if (midAngle > 90 && midAngle <= 270) {
    return midAngle - 180;
  }
  return midAngle;
}

type SelectedInfo = {
  color: string;
  title: string;
  subtitle?: string;
  items: string[];
} | null;

export function AromaDonutChart({
  aromasL1,
  aromasL2 = [],
  size = 220,
  showLegend = true,
  pinchable = false,
}: AromaDonutChartProps) {
  if (!aromasL1.length) return null;

  const [selected, setSelected] = useState<SelectedInfo>(null);
  const [scale, setScale] = useState(1);
  const lastDistRef = useRef<number | null>(null);
  const scaleRef = useRef(1);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;

  // Determine valid L2 notes (must match a selected L1 category)
  const noteToCat: Record<string, string> = {};
  aromasL2.forEach(note => {
    const catId = NOTE_TO_CATEGORY[note.toLowerCase()];
    if (catId && aromasL1.includes(catId)) noteToCat[note] = catId;
  });
  const hasNotes = Object.keys(noteToCat).length > 0;
  const show3 = hasNotes && size >= 180;

  // Ring boundary radii
  const holeR     = outerR * (show3 ? 0.27 : 0.34);
  const innerEdge = outerR * (show3 ? 0.47 : 0.63);
  const midEdge   = show3 ? outerR * 0.72 : outerR;

  // Map category → group
  const catToGroup: Record<string, typeof AROMA_GROUPS[0]> = {};
  AROMA_GROUPS.forEach(g => g.categoryIds.forEach(cid => { catToGroup[cid] = g; }));

  // Build: groupId → { group, cats: [{ cat, notes[] }] }
  type GroupData = { group: typeof AROMA_GROUPS[0]; cats: { cat: typeof AROMA_CATEGORIES[0]; notes: string[] }[] };
  const groupMap: Record<string, GroupData> = {};
  [...new Set(aromasL1)].forEach(catId => {
    const g = catToGroup[catId];
    const cat = AROMA_CATEGORIES.find(c => c.id === catId);
    if (!g || !cat) return;
    if (!groupMap[g.id]) groupMap[g.id] = { group: g, cats: [] };
    const notes = aromasL2.filter(n => noteToCat[n] === catId);
    groupMap[g.id].cats.push({ cat, notes });
  });

  const activeGroups = AROMA_GROUPS.filter(g => groupMap[g.id]);
  const totalCats = activeGroups.reduce((s, g) => s + groupMap[g.id].cats.length, 0);
  const dataSpan = 360 - GAP * activeGroups.length;

  // Segment types
  type InnerSeg = { path: string; color: string; mid: number; sweep: number; groupId: string; label: string; emoji: string };
  type MidSeg   = { path: string; color: string; mid: number; sweep: number; catId: string; groupId: string; label: string; emoji: string; notes: string[] };
  type OuterSeg = { path: string; color: string; mid: number; sweep: number; note: string; catId: string; groupId: string };

  const innerSegs: InnerSeg[] = [];
  const midSegs: MidSeg[] = [];
  const outerSegs: OuterSeg[] = [];

  let angle = 0;
  activeGroups.forEach(g => {
    const gd = groupMap[g.id];
    const numCats = gd.cats.length;
    const groupSweep = (numCats / totalCats) * dataSpan;
    const gStart = angle;

    innerSegs.push({
      path: arcPath(cx, cy, innerEdge, holeR, gStart, gStart + groupSweep),
      color: g.color,
      mid: gStart + groupSweep / 2,
      sweep: groupSweep,
      groupId: g.id,
      label: g.label,
      emoji: g.emoji,
    });

    const catSpan = groupSweep - GAP * numCats;
    const perCat = numCats > 0 ? catSpan / numCats : 0;
    let cAngle = gStart;

    gd.cats.forEach((cd, ci) => {
      const cStart = cAngle;
      const cEnd = cStart + perCat;
      const shade = ci % 2 === 0 ? lightenHex(g.color, 0.30) : lightenHex(g.color, 0.13);

      midSegs.push({
        path: arcPath(cx, cy, show3 ? midEdge : outerR, innerEdge + 1, cStart, cEnd),
        color: shade,
        mid: cStart + perCat / 2,
        sweep: perCat,
        catId: cd.cat.id,
        groupId: g.id,
        label: cd.cat.label,
        emoji: cd.cat.emoji,
        notes: cd.notes,
      });

      if (show3 && cd.notes.length > 0) {
        const noteSpan = perCat - GAP * cd.notes.length;
        const perNote = cd.notes.length > 0 ? noteSpan / cd.notes.length : 0;
        let nAngle = cStart;
        cd.notes.forEach((note, ni) => {
          outerSegs.push({
            path: arcPath(cx, cy, outerR, midEdge + 1, nAngle, nAngle + perNote),
            color: ni % 2 === 0 ? lightenHex(g.color, 0.55) : lightenHex(g.color, 0.40),
            mid: nAngle + perNote / 2,
            sweep: perNote,
            note,
            catId: cd.cat.id,
            groupId: g.id,
          });
          nAngle += perNote + GAP;
        });
      }

      cAngle += perCat + GAP;
    });

    angle = gStart + groupSweep + GAP;
  });

  const innerFontSize = Math.max(7, Math.min(11, size * 0.042));
  const midFontSize   = Math.max(6, Math.min(9,  size * 0.032));
  const centerLabel   = `${totalCats} aroma${totalCats !== 1 ? 's' : ''}`;

  // Pinch-to-zoom (native only)
  const panResponder = pinchable ? PanResponder.create({
    onStartShouldSetPanResponder: e => e.nativeEvent.touches.length === 2,
    onMoveShouldSetPanResponder:  e => e.nativeEvent.touches.length === 2,
    onPanResponderMove: e => {
      const t = e.nativeEvent.touches;
      if (t.length === 2) {
        const dx = t[0].pageX - t[1].pageX;
        const dy = t[0].pageY - t[1].pageY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastDistRef.current !== null) {
          scaleRef.current = Math.min(Math.max(scaleRef.current * (dist / lastDistRef.current), 0.7), 3.5);
          setScale(scaleRef.current);
        }
        lastDistRef.current = dist;
      }
    },
    onPanResponderRelease: () => { lastDistRef.current = null; },
  }) : { panHandlers: {} };

  return (
    <View style={styles.wrapper}>
      {/* ── Wheel ── */}
      <View
        {...(pinchable ? panResponder.panHandlers : {})}
        style={{ transform: [{ scale }] }}
      >
        <Svg width={size} height={size}>
          {/* Outer ring — specific notes (L2) */}
          {outerSegs.map((s, i) => (
            <Path
              key={`n${i}`}
              d={s.path}
              fill={s.color}
              onPress={() => {
                const g   = AROMA_GROUPS.find(x => x.id === s.groupId);
                const cat = AROMA_CATEGORIES.find(x => x.id === s.catId);
                setSelected({
                  color: g?.color ?? s.color,
                  title: `${cat?.emoji ?? ''} ${cat?.label ?? ''}`,
                  subtitle: `${g?.emoji ?? ''} ${g?.label ?? ''}`,
                  items: [s.note],
                });
              }}
            />
          ))}

          {/* Middle ring — categories (L1) */}
          {midSegs.map((s, i) => (
            <Path
              key={`m${i}`}
              d={s.path}
              fill={s.color}
              onPress={() => {
                const g = AROMA_GROUPS.find(x => x.id === s.groupId);
                const defaultItems = AROMA_CATEGORIES.find(c => c.id === s.catId)?.subcategories ?? [];
                setSelected({
                  color: g?.color ?? s.color,
                  title: `${s.emoji} ${s.label}`,
                  subtitle: `${g?.emoji ?? ''} ${g?.label ?? ''}`,
                  items: s.notes.length > 0 ? s.notes : defaultItems,
                });
              }}
            />
          ))}

          {/* Inner ring — groups */}
          {innerSegs.map((s, i) => (
            <Path
              key={`g${i}`}
              d={s.path}
              fill={s.color}
              onPress={() => {
                const gd = groupMap[s.groupId];
                setSelected({
                  color: s.color,
                  title: `${s.emoji} ${s.label}`,
                  items: gd.cats.map(c => `${c.cat.emoji} ${c.cat.label}`),
                });
              }}
            />
          ))}

          {/* Center hole */}
          <Circle cx={cx} cy={cy} r={holeR - 2} fill="white" />
          <SvgText
            x={cx} y={cy - holeR * 0.06}
            textAnchor="middle"
            fontSize={holeR * 0.62}
            fill="#1F1518"
          >
            🍷
          </SvgText>
          <SvgText
            x={cx} y={cy + holeR * 0.44}
            textAnchor="middle"
            fontSize={Math.max(6, holeR * 0.26)}
            fontFamily={Fonts.dmSans}
            fill="#9A8590"
          >
            {centerLabel}
          </SvgText>

          {/* Inner ring text labels (group names) */}
          {innerSegs.map((s, i) => {
            if (s.sweep < 24) return null;
            const tr = (holeR + innerEdge) / 2;
            const pos = polar(cx, cy, tr, s.mid);
            const rot = labelRotation(s.mid);
            return (
              <G key={`il${i}`} transform={`translate(${pos.x.toFixed(1)},${pos.y.toFixed(1)}) rotate(${rot})`}>
                <SvgText
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize={innerFontSize}
                  fontFamily={Fonts.dmSansMedium}
                  fill="white"
                  fillOpacity={0.95}
                >
                  {s.label}
                </SvgText>
              </G>
            );
          })}

          {/* Middle ring text labels (category names) */}
          {midSegs.map((s, i) => {
            if (s.sweep < 15) return null;
            const tr = show3
              ? (innerEdge + midEdge) / 2
              : (innerEdge + outerR) / 2;
            const pos = polar(cx, cy, tr, s.mid);
            const rot = labelRotation(s.mid);
            return (
              <G key={`ml${i}`} transform={`translate(${pos.x.toFixed(1)},${pos.y.toFixed(1)}) rotate(${rot})`}>
                <SvgText
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize={midFontSize}
                  fontFamily={Fonts.dmSans}
                  fill="#1F1518"
                  fillOpacity={0.82}
                >
                  {s.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      {/* ── Segment Detail Popover ── */}
      {selected && Platform.OS === 'web' ? (
        /* Web: fixed-position overlay (Modal doesn't float on web) */
        <View style={styles.webBackdrop} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setSelected(null)} />
          <View style={styles.popover}>
            <View style={[styles.accentBar, { backgroundColor: selected.color }]} />
            <View style={styles.popoverHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.popoverTitle}>{selected.title}</Text>
                {selected.subtitle ? <Text style={styles.popoverSub}>{selected.subtitle}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.popoverClose} hitSlop={8}>
                <Text style={styles.popoverCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.popoverDivider, { backgroundColor: selected.color + '30' }]} />
            {selected.items.length > 0 && (
              <ScrollView style={styles.popoverScroll} showsVerticalScrollIndicator={false} bounces={false}>
                <View style={styles.popoverPills}>
                  {selected.items.map((item, i) => (
                    <View key={i} style={[styles.popoverPill, { backgroundColor: selected.color + '18' }]}>
                      <Text style={styles.popoverPillText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
            <Text style={styles.popoverHint}>Tap outside to close</Text>
          </View>
        </View>
      ) : (
        /* Native: true Modal overlay */
        <Modal
          visible={selected !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelected(null)}
        >
          <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
            <Pressable style={styles.popover} onPress={() => {}}>
              <View style={[styles.accentBar, { backgroundColor: selected?.color ?? Colors.gold }]} />
              <View style={styles.popoverHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.popoverTitle}>{selected?.title}</Text>
                  {selected?.subtitle ? <Text style={styles.popoverSub}>{selected.subtitle}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => setSelected(null)} style={styles.popoverClose} hitSlop={8}>
                  <Text style={styles.popoverCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.popoverDivider, { backgroundColor: selected?.color ? selected.color + '30' : Colors.border }]} />
              {(selected?.items ?? []).length > 0 && (
                <ScrollView style={styles.popoverScroll} showsVerticalScrollIndicator={false} bounces={false}>
                  <View style={styles.popoverPills}>
                    {(selected?.items ?? []).map((item, i) => (
                      <View key={i} style={[styles.popoverPill, { backgroundColor: selected?.color ? selected.color + '18' : Colors.goldPale }]}>
                        <Text style={styles.popoverPillText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
              <Text style={styles.popoverHint}>Tap outside to close</Text>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* ── Legend ── */}
      {showLegend && (
        <View style={styles.legend}>
          {activeGroups.map(g => {
            const gd = groupMap[g.id];
            return (
              <View key={g.id} style={styles.legendGroup}>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: g.color }]} />
                  <Text style={styles.legendGroupLabel}>{g.emoji} {g.label}</Text>
                </View>
                <View style={styles.catPills}>
                  {gd.cats.map(cd => (
                    <View key={cd.cat.id} style={[styles.pill, { borderColor: g.color + '55' }]}>
                      <Text style={styles.pillText}>{cd.cat.emoji} {cd.cat.label}</Text>
                    </View>
                  ))}
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

  // Segment detail popover
  webBackdrop: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(31,21,24,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    zIndex: 9999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31,21,24,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  popover: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  accentBar: {
    height: 5,
    width: '100%',
  },
  popoverHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: 10,
  },
  popoverTitle: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 20,
    color: Colors.ink,
    lineHeight: 26,
  },
  popoverSub: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.inkMuted,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  popoverClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  popoverCloseText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  popoverDivider: {
    height: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  popoverScroll: {
    maxHeight: 220,
    paddingHorizontal: Spacing.lg,
  },
  popoverPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: Spacing.md,
  },
  popoverPill: {
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  popoverPillText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
    letterSpacing: 0.1,
  },
  popoverHint: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 11,
    color: Colors.inkFaint,
    textAlign: 'center',
    paddingBottom: Spacing.md,
    paddingTop: 2,
  },

  // Legend
  legend: {
    width: '100%',
    gap: 8,
  },
  legendGroup: { gap: 4 },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendGroupLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.inkMid,
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
    color: Colors.inkMid,
  },
});
