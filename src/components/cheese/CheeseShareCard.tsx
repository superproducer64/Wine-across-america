import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Polygon, Line, Circle, Text as SvgText,
} from 'react-native-svg';
import { StyleSummaryBar } from './StyleSummaryBar';
import { CheeseEntry, CheeseScore, CheeseTerroirRecord } from '@/types';

// Card dimensions — 4:5 at 360pt wide
const CARD_W = 360;
const CARD_H = 450;

// Warm near-black background
const BG       = '#1A1710';
const CREAM    = '#F0EBD8';
const GOLD     = '#C9A84C';
const MUTED    = 'rgba(240,235,216,0.38)';
const VERY_DIM = 'rgba(240,235,216,0.18)';

interface Props {
  entry: CheeseEntry;
  scores: CheeseScore | null;
  terroir?: CheeseTerroirRecord | null;
}

// ─── SVG Radar ────────────────────────────────────────────────────────────────

const RADAR_SIZE  = 160;
const RADAR_CX    = RADAR_SIZE / 2;
const RADAR_CY    = RADAR_SIZE / 2;
const RADAR_R     = RADAR_SIZE / 2 - 24;
const N_AXES      = 6;
const AXIS_LABELS = ['Aroma','Texture','Intensity','Complexity','Finish','Typicity'];

function axisAngle(i: number) {
  return -Math.PI / 2 + (i * 2 * Math.PI) / N_AXES;
}

function radarPoint(score: number, i: number) {
  const angle = axisAngle(i);
  const norm  = Math.max(0.05, score / 10);
  return {
    x: RADAR_CX + norm * RADAR_R * Math.cos(angle),
    y: RADAR_CY + norm * RADAR_R * Math.sin(angle),
  };
}

function gridPolygon(frac: number) {
  return Array.from({ length: N_AXES }, (_, i) => {
    const a = axisAngle(i);
    return `${RADAR_CX + frac * RADAR_R * Math.cos(a)},${RADAR_CY + frac * RADAR_R * Math.sin(a)}`;
  }).join(' ');
}

function SvgRadar({ scores }: { scores: CheeseScore }) {
  const scoreValues = [
    scores.aroma, scores.texture, scores.flavor_intensity,
    scores.complexity, scores.finish, scores.typicity,
  ];

  const dataPolygon = scoreValues
    .map((s, i) => {
      const pt = radarPoint(s, i);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  return (
    <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1.0].map((frac) => (
        <Polygon
          key={frac}
          points={gridPolygon(frac)}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={0.75}
        />
      ))}

      {/* Axis spokes */}
      {AXIS_LABELS.map((_, i) => {
        const a = axisAngle(i);
        return (
          <Line
            key={i}
            x1={RADAR_CX}
            y1={RADAR_CY}
            x2={RADAR_CX + RADAR_R * Math.cos(a)}
            y2={RADAR_CY + RADAR_R * Math.sin(a)}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.75}
          />
        );
      })}

      {/* Score polygon */}
      <Polygon
        points={dataPolygon}
        fill="rgba(201,168,76,0.2)"
        stroke={GOLD}
        strokeWidth={1.5}
      />

      {/* Score dots */}
      {scoreValues.map((s, i) => {
        const pt = radarPoint(s, i);
        return <Circle key={i} cx={pt.x} cy={pt.y} r={3} fill={GOLD} />;
      })}

      {/* Axis labels */}
      {AXIS_LABELS.map((label, i) => {
        const a   = axisAngle(i);
        const lx  = RADAR_CX + (RADAR_R + 13) * Math.cos(a);
        const ly  = RADAR_CY + (RADAR_R + 13) * Math.sin(a);
        return (
          <SvgText
            key={i}
            x={lx}
            y={ly + 3}
            textAnchor="middle"
            fill={MUTED}
            fontSize={7}
          >
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// ─── Top 3 score tags ─────────────────────────────────────────────────────────

function getTopTags(scores: CheeseScore): Array<{ label: string; score: number }> {
  return [
    { label: 'Aroma',      score: scores.aroma },
    { label: 'Texture',    score: scores.texture },
    { label: 'Intensity',  score: scores.flavor_intensity },
    { label: 'Complexity', score: scores.complexity },
    { label: 'Finish',     score: scores.finish },
    { label: 'Typicity',   score: scores.typicity },
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// ─── Score tier color ─────────────────────────────────────────────────────────

function tierColor(n: number): string {
  if (n >= 75) return '#C9A84C';
  if (n >= 50) return '#9A9280';
  return '#8B5E5E';
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function CheeseShareCard({ entry, scores, terroir }: Props) {
  const hasTerroirData =
    terroir && (terroir.pasture_soil || terroir.climate || terroir.milk_season);

  const tastingDate = new Date(entry.tasting_date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const topTags = scores ? getTopTags(scores) : [];
  const scoreColor = scores ? tierColor(scores.technical_score) : MUTED;

  return (
    <View style={card.wrap}>
      {/* ── Header: name + score circle ────────────────────────────────── */}
      <View style={card.header}>
        <View style={card.nameBlock}>
          <Text style={card.name} numberOfLines={2}>{entry.name}</Text>
          {entry.producer ? (
            <Text style={card.producer}>{entry.producer}</Text>
          ) : null}
          <Text style={card.subtitle}>
            {['cow','sheep','goat','buffalo','mixed'].includes(entry.milk_type)
              ? ({ cow:'Cow',sheep:'Sheep',goat:'Goat',buffalo:'Buffalo',mixed:'Mixed' })[entry.milk_type]
              : entry.milk_type}
            {' · '}
            {({ bloomy:'Bloomy',washed:'Washed',alpine:'Alpine',blue:'Blue',fresh:'Fresh',pressed:'Pressed',hard:'Hard' })[entry.style] ?? entry.style}
            {entry.region ? ` · ${entry.region}` : ''}
          </Text>
        </View>

        {scores ? (
          <View style={card.scoreBadge}>
            <Text style={[card.scoreNum, { color: scoreColor }]}>
              {scores.technical_score}
            </Text>
            <Text style={card.scoreMax}>/100</Text>
          </View>
        ) : null}
      </View>

      {/* ── Radar + tags ───────────────────────────────────────────────── */}
      {scores ? (
        <View style={card.radarSection}>
          <View style={card.radarWrap}>
            <SvgRadar scores={scores} />
          </View>
          <View style={card.tagsRow}>
            {topTags.map((t) => (
              <View key={t.label} style={card.tag}>
                <Text style={card.tagText}>{t.label}</Text>
                <Text style={card.tagScore}> {t.score}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={card.noScoresPlaceholder}>
          <Text style={card.noScoresText}>No scores recorded</Text>
        </View>
      )}

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <View style={card.divider} />

      {/* ── Style Summary bars ──────────────────────────────────────────── */}
      {scores ? (
        <View style={card.barsSection}>
          <StyleSummaryBar scores={scores} dark />
        </View>
      ) : null}

      {/* ── Terroir strip ───────────────────────────────────────────────── */}
      {hasTerroirData ? (
        <>
          <View style={card.divider} />
          <View style={card.terroirStrip}>
            {terroir!.pasture_soil ? (
              <View style={card.terroirItem}>
                <Text style={card.terroirIcon}>
                  {({ limestone:'🪨',volcanic:'🌋',granite:'⛰️',clay_loam:'🌿',sandy_coastal:'🏖️' })[terroir!.pasture_soil as keyof typeof PASTURE_SOIL_LOOKUP] ?? '🌱'}
                </Text>
                <Text style={card.terroirLabel}>
                  {({ limestone:'Limestone',volcanic:'Volcanic',granite:'Granite',clay_loam:'Clay/Loam',sandy_coastal:'Sandy Coastal' })[terroir!.pasture_soil as keyof typeof PASTURE_SOIL_LOOKUP] ?? terroir!.pasture_soil}
                </Text>
              </View>
            ) : null}
            {terroir!.climate ? (
              <View style={card.terroirItem}>
                <Text style={card.terroirIcon}>
                  {({ alpine:'🏔️',temperate:'🌤️',maritime:'🌊',arid:'☀️' })[terroir!.climate as keyof typeof CLIMATE_LOOKUP] ?? '🌍'}
                </Text>
                <Text style={card.terroirLabel}>
                  {({ alpine:'Alpine',temperate:'Temperate',maritime:'Maritime',arid:'Arid' })[terroir!.climate as keyof typeof CLIMATE_LOOKUP] ?? terroir!.climate}
                </Text>
              </View>
            ) : null}
            {terroir!.milk_season ? (
              <View style={card.terroirItem}>
                <Text style={card.terroirIcon}>
                  {({ spring:'🌸',summer:'☀️',fall:'🍂',winter:'❄️' })[terroir!.milk_season as keyof typeof SEASON_LOOKUP] ?? '📅'}
                </Text>
                <Text style={card.terroirLabel}>
                  {terroir!.milk_season.charAt(0).toUpperCase() + terroir!.milk_season.slice(1)} milk
                </Text>
              </View>
            ) : null}
          </View>
        </>
      ) : null}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <View style={card.divider} />
      <View style={card.footer}>
        <Text style={card.wordmark}>CHEESE ACROSS AMERICA</Text>
        <Text style={card.footerDate}>{tastingDate}</Text>
      </View>
    </View>
  );
}

// Dummy lookup type keys (inline objects are used above)
const PASTURE_SOIL_LOOKUP = {} as const;
const CLIMATE_LOOKUP      = {} as const;
const SEASON_LOOKUP       = {} as const;

const card = StyleSheet.create({
  wrap: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: BG,
    borderRadius: 20,
    padding: 20,
    gap: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  nameBlock: { flex: 1, gap: 3 },
  name: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 26,
    color: CREAM,
    lineHeight: 32,
  },
  producer: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: GOLD,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: MUTED,
    letterSpacing: 0.3,
  },
  scoreBadge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.1)',
    flexShrink: 0,
  },
  scoreNum: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 24,
    lineHeight: 28,
  },
  scoreMax: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    color: MUTED,
  },
  radarSection: {
    alignItems: 'center',
    gap: 8,
  },
  radarWrap: {
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: GOLD,
    backgroundColor: 'rgba(201,168,76,0.12)',
  },
  tagText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: GOLD,
  },
  tagScore: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 10,
    color: GOLD,
  },
  noScoresPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noScoresText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: MUTED,
  },
  divider: {
    height: 0.5,
    backgroundColor: VERY_DIM,
  },
  barsSection: {
    paddingHorizontal: 2,
  },
  terroirStrip: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  terroirItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  terroirIcon: { fontSize: 13 },
  terroirLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: MUTED,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 9,
    color: VERY_DIM,
    letterSpacing: 1.5,
  },
  footerDate: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    color: VERY_DIM,
  },
});
