import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { TerriorSoil, TerriorClimate, TERROIR_SOIL_LABELS, TERROIR_CLIMATE_LABELS } from '@/types';

interface TerriorBadgeProps {
  soil: TerriorSoil[] | null;
  climate: TerriorClimate | null;
  visible: boolean;
}

const SOIL_ICON: Record<TerriorSoil, string> = {
  limestone: '🪨',
  chalk: '🪨',
  marl: '🪨',
  calcareous: '🪨',
  dolomite: '🪨',
  flint: '🪨',
  clay: '🌿',
  'terra-rossa': '🌿',
  'red-iron': '🌿',
  sand: '🏖️',
  gravel: '🏖️',
  galets: '🏖️',
  loam: '🏖️',
  silt: '🏖️',
  alluvial: '🏖️',
  volcanic: '🌋',
  'volcanic-ash': '🌋',
  tuff: '🌋',
  basalt: '🌋',
  granite: '⛰️',
  'decomposed-granite': '⛰️',
  slate: '⛰️',
  schist: '⛰️',
  shale: '⛰️',
};

export function TerriorBadge({ soil, climate, visible }: TerriorBadgeProps) {
  const soils = Array.isArray(soil) ? soil : soil ? [soil] : [];
  if (!visible || (soils.length === 0 && !climate)) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Terroir</Text>
      <View style={styles.row}>
        {soils.map((s) => (
          <View key={s} style={styles.pill}>
            <Text style={styles.pillIcon}>{SOIL_ICON[s]}</Text>
            <Text style={styles.pillText}>{TERROIR_SOIL_LABELS[s]}</Text>
          </View>
        ))}
        {climate && (
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>🌡️</Text>
            <Text style={styles.pillText}>{TERROIR_CLIMATE_LABELS[climate]} Climate</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    backgroundColor: '#EAF5EE',
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: '#A5D6B5',
  },
  title: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: Colors.green,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: '#A5D6B5',
  },
  pillIcon: {
    fontSize: 12,
  },
  pillText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.green,
  },
});
