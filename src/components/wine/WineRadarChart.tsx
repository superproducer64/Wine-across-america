import React from 'react';
import { View } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { Colors, Fonts } from '@/theme';

interface Props {
  sweetness: number;  // 1-10
  acidity: number;
  tannin: number;
  body: number;
  alcohol: number;
  intensity: number;
  finish_length: number;
  size?: number;
  color?: string;
}

// 7 axes evenly spaced starting at top (−90°), step = 360/7 ≈ 51.43°
const STEP = 360 / 7;
const AXES = [
  { label: 'Sweet',     key: 'sweetness',    angleDeg: -90 + STEP * 0 },
  { label: 'Acidity',   key: 'acidity',      angleDeg: -90 + STEP * 1 },
  { label: 'Tannin',    key: 'tannin',       angleDeg: -90 + STEP * 2 },
  { label: 'Body',      key: 'body',         angleDeg: -90 + STEP * 3 },
  { label: 'Alcohol',   key: 'alcohol',      angleDeg: -90 + STEP * 4 },
  { label: 'Intensity', key: 'intensity',    angleDeg: -90 + STEP * 5 },
  { label: 'Finish',    key: 'finish_length',angleDeg: -90 + STEP * 6 },
] as const;

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
  sweetness,
  acidity,
  tannin,
  body,
  alcohol,
  intensity,
  finish_length,
  size = 160,
  color = Colors.gold,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const labelR = size * 0.48;

  const valueMap: Record<string, number> = {
    sweetness,
    acidity,
    tannin,
    body,
    alcohol,
    intensity,
    finish_length,
  };

  const values = AXES.map((ax) => (valueMap[ax.key] - 1) / 9);

  // Grid rings
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
