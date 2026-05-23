import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CheeseShareCard } from './CheeseShareCard';
import { CheeseEntry, CheeseScore, CheeseTerroirRecord } from '@/types';

interface Props {
  entry: CheeseEntry;
  scores?: CheeseScore | null;
  terroir?: CheeseTerroirRecord | null;
}

export function CheeseIdentityCard({ entry, scores, terroir }: Props) {
  return (
    <View style={styles.wrap}>
      <CheeseShareCard entry={entry} scores={scores ?? null} terroir={terroir} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
});
