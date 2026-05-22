import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { TextInput } from '@/components/ui/TextInput';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import {
  MilkType,
  Pasteurization,
  CheeseStyle,
  MILK_TYPE_LABELS,
  PASTEURIZATION_LABELS,
  CHEESE_STYLE_LABELS,
  CHEESE_STYLE_EXAMPLES,
  CHEESE_STYLE_EMOJI,
  US_REGIONS,
} from '@/types';

const MILK_TYPES: MilkType[] = ['cow', 'sheep', 'goat', 'buffalo', 'mixed'];
const PASTEURIZATION_OPTIONS: Pasteurization[] = ['raw', 'pasteurized', 'thermized'];
const STYLE_OPTIONS: CheeseStyle[] = ['bloomy', 'washed', 'alpine', 'blue', 'fresh', 'pressed', 'hard'];

export function Step1Basics() {
  const { draft, setField } = useEntryDraftStore();

  const priceStr = draft.price != null ? String(draft.price) : '';

  const handlePriceChange = (v: string) => {
    const parsed = parseFloat(v);
    setField({ price: v === '' ? null : isNaN(parsed) ? null : parsed });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Cheese Details</Text>

      {/* Name */}
      <TextInput
        label="Cheese Name *"
        value={draft.name}
        onChangeText={(v) => setField({ name: v })}
        placeholder="e.g., Humboldt Fog"
        autoCapitalize="words"
      />

      {/* Producer */}
      <TextInput
        label="Producer / Creamery"
        value={draft.producer}
        onChangeText={(v) => setField({ producer: v })}
        placeholder="e.g., Cypress Grove"
        autoCapitalize="words"
      />

      {/* Milk Type */}
      <Text style={styles.label}>Milk Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {MILK_TYPES.map((mt) => (
            <Pressable
              key={mt}
              style={[styles.chip, draft.milk_type === mt && styles.chipSelected]}
              onPress={() => setField({ milk_type: mt })}
            >
              <Text style={[styles.chipText, draft.milk_type === mt && styles.chipTextSelected]}>
                {MILK_TYPE_LABELS[mt]}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Pasteurization */}
      <Text style={styles.label}>Pasteurization</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {PASTEURIZATION_OPTIONS.map((p) => (
            <Pressable
              key={p}
              style={[styles.chip, draft.pasteurization === p && styles.chipSelected]}
              onPress={() => setField({ pasteurization: p })}
            >
              <Text style={[styles.chipText, draft.pasteurization === p && styles.chipTextSelected]}>
                {PASTEURIZATION_LABELS[p]}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Style — 2-column card grid */}
      <Text style={styles.label}>Style</Text>
      <View style={styles.styleGrid}>
        {STYLE_OPTIONS.map((s) => {
          const selected = draft.style === s;
          return (
            <Pressable
              key={s}
              style={[styles.styleCard, selected && styles.styleCardSelected]}
              onPress={() => setField({ style: s })}
            >
              <Text style={styles.styleEmoji}>{CHEESE_STYLE_EMOJI[s]}</Text>
              <Text style={[styles.styleName, selected && styles.styleNameSelected]}>
                {CHEESE_STYLE_LABELS[s]}
              </Text>
              <Text style={styles.styleExample} numberOfLines={2}>
                {CHEESE_STYLE_EXAMPLES[s]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Region */}
      <Text style={styles.label}>State / Region</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {US_REGIONS.map((r) => (
            <Pressable
              key={r}
              style={[styles.chip, draft.region === r && styles.chipSelected]}
              onPress={() => setField({ region: draft.region === r ? '' : r })}
            >
              <Text style={[styles.chipText, draft.region === r && styles.chipTextSelected]}>
                {r}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      {draft.region ? (
        <Text style={styles.selectedRegion}>Selected: {draft.region}</Text>
      ) : null}

      {/* Tasting Date */}
      <TextInput
        label="Tasting Date"
        value={draft.tasting_date}
        onChangeText={(v) => setField({ tasting_date: v })}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />

      {/* Price */}
      <TextInput
        label="Price (optional)"
        value={priceStr}
        onChangeText={handlePriceChange}
        placeholder="e.g., 28.00"
        keyboardType="decimal-pad"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: 4,
  },
  stepTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 22,
    color: Colors.ink,
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  chipScroll: {
    marginBottom: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: Spacing.xl,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  chipSelected: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  chipText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.inkMid,
  },
  chipTextSelected: {
    color: Colors.ink,
    fontFamily: Fonts.dmSansMedium,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  styleCard: {
    width: '47.5%',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    gap: 3,
  },
  styleCardSelected: {
    backgroundColor: Colors.goldPale,
    borderColor: Colors.gold,
  },
  styleEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  styleName: {
    fontFamily: Fonts.playfair,
    fontSize: 14,
    color: Colors.ink,
    lineHeight: 18,
  },
  styleNameSelected: {
    color: Colors.inkMid,
  },
  styleExample: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkMuted,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  selectedRegion: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.gold,
    marginBottom: Spacing.sm,
    marginTop: -Spacing.sm,
  },
});
