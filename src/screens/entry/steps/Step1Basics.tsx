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
import { COUNTRIES_AND_REGIONS, GRAPE_VARIETIES, PriceEntry } from '@/types';

export function Step1Basics() {
  const { draft, setBasics } = useEntryDraftStore();

  const countries = Object.keys(COUNTRIES_AND_REGIONS).sort();
  const regions = draft.country ? Object.keys(COUNTRIES_AND_REGIONS[draft.country] ?? {}) : [];
  const appellations =
    draft.country && draft.region
      ? COUNTRIES_AND_REGIONS[draft.country]?.[draft.region] ?? []
      : [];

  const handleCountrySelect = (country: string) => {
    setBasics({ country, region: '', appellation: '' });
  };

  const handleRegionSelect = (region: string) => {
    setBasics({ region, appellation: '' });
  };

  const handleGrapeToggle = (grape: string) => {
    const current = draft.grapes;
    if (current.includes(grape)) {
      setBasics({ grapes: current.filter((g) => g !== grape) });
    } else {
      setBasics({ grapes: [...current, grape] });
    }
  };

  const handlePriceChange = (field: keyof PriceEntry, value: string) => {
    const existing = draft.price[0] ?? { amount: 0, currency: 'USD', date: '', location: '' };
    const updated: PriceEntry = {
      ...existing,
      [field]: field === 'amount' ? parseFloat(value) || 0 : value,
    };
    setBasics({ price: [updated] });
  };

  const topGrapes = GRAPE_VARIETIES.slice(0, 30);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Wine Basics</Text>

      <TextInput
        label="Wine Name"
        value={draft.name}
        onChangeText={(v) => setBasics({ name: v })}
        placeholder="e.g., Château Margaux"
      />

      <TextInput
        label="Producer / Winery"
        value={draft.producer}
        onChangeText={(v) => setBasics({ producer: v })}
        placeholder="e.g., Château Margaux"
      />

      <TextInput
        label="Vintage"
        value={draft.vintage ? String(draft.vintage) : ''}
        onChangeText={(v) => setBasics({ vintage: parseInt(v) || null })}
        keyboardType="number-pad"
        placeholder="e.g., 2019"
      />

      {/* Country Selector */}
      <Text style={styles.label}>Country</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {countries.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, draft.country === c && styles.chipSelected]}
              onPress={() => handleCountrySelect(c)}
            >
              <Text style={[styles.chipText, draft.country === c && styles.chipTextSelected]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Region Selector */}
      {regions.length > 0 && (
        <>
          <Text style={styles.label}>Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={styles.chipRow}>
              {regions.map((r) => (
                <Pressable
                  key={r}
                  style={[styles.chip, draft.region === r && styles.chipSelected]}
                  onPress={() => handleRegionSelect(r)}
                >
                  <Text style={[styles.chipText, draft.region === r && styles.chipTextSelected]}>
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {/* Appellation Selector */}
      {appellations.length > 0 && (
        <>
          <Text style={styles.label}>Appellation (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={styles.chipRow}>
              {appellations.map((a) => (
                <Pressable
                  key={a}
                  style={[styles.chip, draft.appellation === a && styles.chipSelected]}
                  onPress={() => setBasics({ appellation: a })}
                >
                  <Text style={[styles.chipText, draft.appellation === a && styles.chipTextSelected]}>
                    {a}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {/* Grape Selection */}
      <Text style={styles.label}>Grape Varieties</Text>
      {draft.grapes.length > 0 && (
        <View style={styles.selectedGrapes}>
          {draft.grapes.map((g) => (
            <Pressable
              key={g}
              style={styles.selectedChip}
              onPress={() => handleGrapeToggle(g)}
            >
              <Text style={styles.selectedChipText}>{g} ✕</Text>
            </Pressable>
          ))}
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {topGrapes.map((g) => (
            <Pressable
              key={g}
              style={[styles.chip, draft.grapes.includes(g) && styles.chipSelected]}
              onPress={() => handleGrapeToggle(g)}
            >
              <Text style={[styles.chipText, draft.grapes.includes(g) && styles.chipTextSelected]}>
                {g}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Price */}
      <Text style={styles.label}>Price (optional)</Text>
      <View style={styles.priceRow}>
        <TextInput
          label="Amount"
          value={draft.price[0] ? String(draft.price[0].amount || '') : ''}
          onChangeText={(v) => handlePriceChange('amount', v)}
          keyboardType="decimal-pad"
          placeholder="0.00"
          containerStyle={{ flex: 1 }}
        />
        <TextInput
          label="Currency"
          value={draft.price[0]?.currency ?? 'USD'}
          onChangeText={(v) => handlePriceChange('currency', v)}
          placeholder="USD"
          containerStyle={{ width: 70 }}
        />
      </View>

      {/* Tasting Date */}
      <TextInput
        label="Tasting Date"
        value={draft.tasting_date}
        onChangeText={(v) => setBasics({ tasting_date: v })}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />

      {/* Location */}
      <TextInput
        label="Location (restaurant, bar, etc.)"
        value={draft.location_name}
        onChangeText={(v) => setBasics({ location_name: v })}
        placeholder="e.g., Le Bernardin, NYC"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.xl,
    gap: 4,
    paddingBottom: Spacing.huge,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontSize: 12,
    color: Colors.inkMid,
  },
  chipTextSelected: {
    color: Colors.ink,
    fontFamily: Fonts.dmSansMedium,
  },
  selectedGrapes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  selectedChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.goldPale,
    borderWidth: 0.5,
    borderColor: Colors.gold,
  },
  selectedChipText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.inkMid,
  },
  priceRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-end',
  },
});
