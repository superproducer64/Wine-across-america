import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { Colors, Fonts } from '@/theme';

interface RadarChartProps {
  scores: {
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
  { key: 'acidity', label: 'Acidity' },
  { key: 'tannin', label: 'Tannin' },
  { key: 'body', label: 'Body' },
  { key: 'alcohol', label: 'Alcohol' },
  { key: 'intensity', label: 'Intensity' },
  { key: 'finish_length', label: 'Finish' },
] as const;

function polarToCartesian(angle: number, radius: number, cx: number, cy: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export function RadarChart({ scores, size = 220, maxValue = 10 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const labelRadius = size * 0.47;
  const n = DIMENSIONS.length;
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Grid polygon points at each level
  const gridPolygons = levels.map((level) => {
    const pts = DIMENSIONS.map((_, i) => {
      const angle = (i * 360) / n;
      const { x, y } = polarToCartesian(angle, radius * level, cx, cy);
      return `${x},${y}`;
    });
    return pts.join(' ');
  });

  // Score polygon
  const scorePoints = DIMENSIONS.map((dim, i) => {
    const angle = (i * 360) / n;
    const val = scores[dim.key] ?? 0;
    const r = (val / maxValue) * radius;
    const { x, y } = polarToCartesian(angle, r, cx, cy);
    return `${x},${y}`;
  });

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size}>
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
        {DIMENSIONS.map((_, i) => {
          const angle = (i * 360) / n;
          const { x, y } = polarToCartesian(angle, radius, cx, cy);
          return (
            <Line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={Colors.border}
              strokeWidth={0.5}
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

        {/* Score dots */}
        {DIMENSIONS.map((dim, i) => {
          const angle = (i * 360) / n;
          const val = scores[dim.key] ?? 0;
          const r = (val / maxValue) * radius;
          const { x, y } = polarToCartesian(angle, r, cx, cy);
          return (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={3.5}
              fill={Colors.gold}
              stroke={Colors.surface}
              strokeWidth={1.5}
            />
          );
        })}

        {/* Labels */}
        {DIMENSIONS.map((dim, i) => {
          const angle = (i * 360) / n;
          const { x, y } = polarToCartesian(angle, labelRadius, cx, cy);
          const textAnchor =
            x < cx - 5 ? 'end' : x > cx + 5 ? 'start' : 'middle';
          return (
            <SvgText
              key={i}
              x={x}
              y={y + 4}
              textAnchor={textAnchor}
              fontSize={9.5}
              fill={Colors.inkMuted}
              fontFamily={Fonts.dmSansMedium}
            >
              {dim.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
