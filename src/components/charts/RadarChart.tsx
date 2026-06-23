import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Polygon,
  Line,
  Circle,
  Text as SvgText,
  Rect,
  G,
} from 'react-native-svg';
import { Colors, Fonts } from '@/theme';

interface RadarChartProps {
  scores: {
    sweetness: number;
    acidity: number;
    tannin: number;
    body: number;
    alcohol: number;
    intensity: number;
    finish_length: number;
  };
  size?: number;
  maxValue?: number;
}

const DIMENSIONS = [
  { key: 'sweetness', label: 'Sweet' },
  { key: 'acidity', label: 'Acidity' },
  { key: 'tannin', label: 'Tannin' },
  { key: 'body', label: 'Body' },
  { key: 'alcohol', label: 'Alcohol' },
  { key: 'intensity', label: 'Intensity' },
  { key: 'finish_length', label: 'Finish' },
] as const;

type DimKey = (typeof DIMENSIONS)[number]['key'];

function polarToCartesian(angle: number, radius: number, cx: number, cy: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const TOOLTIP_W = 68;
const TOOLTIP_H = 36;
const TOOLTIP_MARGIN = 6;

export function RadarChart({ scores, size = 220, maxValue = 10 }: RadarChartProps) {
  const [selected, setSelected] = useState<DimKey | null>(null);

  const labelPad = 22;
  const totalSize = size + labelPad * 2;
  const cx = totalSize / 2;
  const cy = totalSize / 2;
  const radius = size * 0.36;
  const labelRadius = size * 0.47;
  const n = DIMENSIONS.length;
  const levels = [0.25, 0.5, 0.75, 1.0];

  const gridPolygons = levels.map((level) => {
    const pts = DIMENSIONS.map((_, i) => {
      const angle = (i * 360) / n;
      const { x, y } = polarToCartesian(angle, radius * level, cx, cy);
      return `${x},${y}`;
    });
    return pts.join(' ');
  });

  const scorePoints = DIMENSIONS.map((dim, i) => {
    const angle = (i * 360) / n;
    const val = scores[dim.key] ?? 0;
    const r = (val / maxValue) * radius;
    const { x, y } = polarToCartesian(angle, r, cx, cy);
    return `${x},${y}`;
  });

  const handleSpokePress = (key: DimKey) => {
    setSelected((prev) => (prev === key ? null : key));
  };

  const selectedIndex = selected ? DIMENSIONS.findIndex((d) => d.key === selected) : -1;
  let tooltip: {
    x: number;
    y: number;
    label: string;
    value: number;
  } | null = null;

  if (selected !== null && selectedIndex >= 0) {
    const angle = (selectedIndex * 360) / n;
    const val = scores[selected] ?? 0;
    const r = (val / maxValue) * radius;
    const { x: dx, y: dy } = polarToCartesian(angle, r, cx, cy);

    const raw = { x: dx - TOOLTIP_W / 2, y: dy - TOOLTIP_H - TOOLTIP_MARGIN };
    tooltip = {
      x: clamp(raw.x, 2, totalSize - TOOLTIP_W - 2),
      y: clamp(raw.y, 2, totalSize - TOOLTIP_H - 2),
      label: DIMENSIONS[selectedIndex].label,
      value: val,
    };
  }

  return (
    <View style={{ width: totalSize, height: totalSize, alignSelf: 'center' }}>
      <Svg width={totalSize} height={totalSize}>
        {/* Grid rings */}
        {gridPolygons.map((pts, i) => (
          <Polygon
            key={i}
            points={pts}
            fill="none"
            stroke={Colors.border}
            strokeWidth={0.5}
          />
        ))}

        {/* Axis lines */}
        {DIMENSIONS.map((dim, i) => {
          const angle = (i * 360) / n;
          const { x, y } = polarToCartesian(angle, radius, cx, cy);
          const isActive = selected === dim.key;
          return (
            <Line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={isActive ? Colors.gold : Colors.border}
              strokeWidth={isActive ? 1.2 : 0.5}
            />
          );
        })}

        {/* Score polygon fill */}
        <Polygon
          points={scorePoints.join(' ')}
          fill={Colors.gold + '28'}
          stroke={Colors.gold}
          strokeWidth={1.5}
        />

        {/* Score dots + invisible tap targets */}
        {DIMENSIONS.map((dim, i) => {
          const angle = (i * 360) / n;
          const val = scores[dim.key] ?? 0;
          const r = (val / maxValue) * radius;
          const { x, y } = polarToCartesian(angle, r, cx, cy);
          const isActive = selected === dim.key;
          return (
            <G key={i} onPress={() => handleSpokePress(dim.key)}>
              {/* Invisible large hit target */}
              <Circle cx={x} cy={y} r={16} fill="transparent" />
              {/* Highlight ring */}
              {isActive && (
                <Circle
                  cx={x}
                  cy={y}
                  r={9}
                  fill={Colors.gold + '30'}
                  stroke={Colors.gold}
                  strokeWidth={1}
                />
              )}
              {/* Score dot */}
              <Circle
                cx={x}
                cy={y}
                r={isActive ? 5 : 3.5}
                fill={isActive ? Colors.gold : Colors.gold}
                stroke={Colors.surface}
                strokeWidth={1.5}
              />
            </G>
          );
        })}

        {/* Labels */}
        {DIMENSIONS.map((dim, i) => {
          const angle = (i * 360) / n;
          const { x, y } = polarToCartesian(angle, labelRadius, cx, cy);
          const textAnchor =
            x < cx - 5 ? 'end' : x > cx + 5 ? 'start' : 'middle';
          const isActive = selected === dim.key;
          return (
            <SvgText
              key={i}
              x={x}
              y={y + 4}
              textAnchor={textAnchor}
              fontSize={isActive ? 10.5 : 9.5}
              fill={isActive ? Colors.gold : Colors.inkMuted}
              fontFamily={isActive ? Fonts.dmSansMedium : Fonts.dmSansMedium}
              fontWeight={isActive ? 'bold' : 'normal'}
            >
              {dim.label}
            </SvgText>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <G>
            <Rect
              x={tooltip.x}
              y={tooltip.y}
              width={TOOLTIP_W}
              height={TOOLTIP_H}
              rx={7}
              ry={7}
              fill={Colors.ink}
              opacity={0.88}
            />
            <SvgText
              x={tooltip.x + TOOLTIP_W / 2}
              y={tooltip.y + 13}
              textAnchor="middle"
              fontSize={10}
              fill="#FFFFFF"
              fontFamily={Fonts.dmSans}
              opacity={0.8}
            >
              {tooltip.label}
            </SvgText>
            <SvgText
              x={tooltip.x + TOOLTIP_W / 2}
              y={tooltip.y + 27}
              textAnchor="middle"
              fontSize={13}
              fill={Colors.goldLight}
              fontFamily={Fonts.dmSansMedium}
              fontWeight="bold"
            >
              {tooltip.value.toFixed(1)} / {maxValue}
            </SvgText>
          </G>
        )}
      </Svg>
    </View>
  );
}
