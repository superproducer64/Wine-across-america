import React from 'react';
import { View } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { Colors, Fonts } from '@/theme';

interface Props {
  acidity: number;   // 1-10
  body: number;
  alcohol: number;
  tannin: number;
  intensity: number;
  size?: number;
  color?: string;
}

const AXES = [
  { label: 'Acidity',   key: 'acidity',   angleDeg: -90 },
  { label: 'Body',      key: 'body',       angleDeg: -18 },
  { label: 'Alcohol',   key: 'alcohol',    angleDeg:  54 },
  { label: 'Tannin',    key: 'tannin',     angleDeg: 126 },
  { label: 'Intensity', key: 'intensity',  angleDeg: 198 },
];

const RINGS = 4;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function point(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = toRad(angleDeg);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function polygonPoints(pts: { x: number; y: number }[]) {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

export function WineRadarChart({
  acidity,
  body,
  alcohol,
  tannin,
  intensity,
  size = 160,
  color = Colors.gold,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const labelR = size * 0.48;

  const values = [
    (acidity - 1) / 9,
    (body - 1) / 9,
    (alcohol - 1) / 9,
    (tannin - 1) / 9,
    (intensity - 1) / 9,
  ];

  // Outer pentagon grid rings
  const rings = Array.from({ length: RINGS }, (_, i) => {
    const r = (maxR * (i + 1)) / RINGS;
    return AXES.map((ax) => point(cx, cy, r, ax.angleDeg));
  });

  // Data polygon
  const dataPoints = AXES.map((ax, i) => {
    const v = Math.max(0.05, values[i]);
    return point(cx, cy, v * maxR, ax.angleDeg);
  });

  return (
    <View>
      <Svg width={size} height={size}>
        {/* Grid rings */}
        {rings.map((ring, ri) => (
          <Polygon
            key={ri}
            points={polygonPoints(ring)}
            fill="none"
            stroke={Colors.border}
            strokeWidth={0.8}
          />
        ))}

        {/* Axis lines */}
        {AXES.map((ax) => {
          const outer = point(cx, cy, maxR, ax.angleDeg);
          return (
            <Line
              key={ax.key}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke={Colors.border}
              strokeWidth={0.8}
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={polygonPoints(dataPoints)}
          fill={`${color}30`}
          stroke={color}
          strokeWidth={1.5}
        />

        {/* Data vertices */}
        {dataPoints.map((pt, i) => (
          <Circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={3}
            fill={color}
          />
        ))}

        {/* Axis labels */}
        {AXES.map((ax) => {
          const lp = point(cx, cy, labelR, ax.angleDeg);
          const textAnchor =
            lp.x < cx - 4 ? 'end' :
            lp.x > cx + 4 ? 'start' :
            'middle';
          const dy = lp.y < cy - 4 ? -4 : lp.y > cy + 4 ? 10 : 4;
          return (
            <SvgText
              key={ax.key}
              x={lp.x}
              y={lp.y + dy}
              fontSize={9}
              fontFamily={Fonts.dmSansMedium}
              fill={Colors.inkMid}
              textAnchor={textAnchor}
            >
              {ax.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
