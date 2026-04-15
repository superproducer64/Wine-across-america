import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { TextInput } from '@/components/ui/TextInput';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { useAuthStore } from '@/stores/authStore';
import { COUNTRIES_AND_REGIONS, PriceEntry } from '@/types';
import { LabelScannerModal } from '@/components/wine/LabelScannerModal';
import { USStateSearchPicker } from '@/components/wine/USStateSearchPicker';
import { GrapeBlendInput } from '@/components/wine/GrapeBlendInput';
import { WineLabelData } from '@/utils/wineOcr';

export function Step1Basics() {
  const { draft, setBasics, setLabelPhoto, setGrapeBlends } = useEntryDraftStore();
  const { user } = useAuthStore();
  const [scannerVisible, setScannerVisible] = useState(false);

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

  const handleScanApply = (data: Partial<WineLabelData> & { photoUrl?: string }) => {
    const updates: Parameters<typeof setBasics>[0] = {};
    if (data.name) updates.name = data.name;
    if (data.producer) updates.producer = data.producer;
    if (data.vintage !== undefined) updates.vintage = data.vintage;
    if (data.country) updates.country = data.country;
    if (data.region) updates.region = data.region;
    if (data.appellation) updates.appellation = data.appellation;
    if (Object.keys(updates).length > 0) setBasics(updates);
    if (data.photoUrl) setLabelPhoto(data.photoUrl);
  };

  const handlePriceChange = (field: keyof PriceEntry, value: string) => {
    const existing = draft.price[0] ?? { amount: 0, currency: 'USD', date: '', location: '' };
    const updated: PriceEntry = {
      ...existing,
      [field]: field === 'amount' ? parseFloat(value) || 0 : value,
    };
    setBasics({ price: [updated] });
  };

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Wine Basics</Text>

      {/* Scan Label button */}
      <Pressable style={styles.scanBtn} onPress={() => setScannerVisible(true)}>
        <Text style={styles.scanBtnIcon}>📷</Text>
        <View style={styles.scanBtnText}>
          <Text style={styles.scanBtnLabel}>Scan Wine Label</Text>
          <Text style={styles.scanBtnSub}>Auto-fill from photo · OCR powered</Text>
        </View>
        <Text style={styles.scanBtnArrow}>›</Text>
      </Pressable>

      {/* Label photo preview (if scanned) */}
      {draft.label_photo_url ? (
        <View style={styles.photoPreview}>
          <Image source={{ uri: draft.label_photo_url }} style={styles.photoImg} />
          <Pressable onPress={() => setLabelPhoto(null)} style={styles.photoRemove}>
            <Text style={styles.photoRemoveText}>Remove photo</Text>
          </Pressable>
        </View>
      ) : null}

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

      {/* Region Selector — searchable list for US, chips for everything else */}
      {draft.country === 'United States' ? (
        <>
          <Text style={styles.label}>State</Text>
          <USStateSearchPicker
            selected={draft.region}
            onSelect={handleRegionSelect}
          />
        </>
      ) : regions.length > 0 ? (
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
      ) : null}

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

      {/* Grape Varieties */}
      <Text style={styles.label}>Grape Varieties</Text>
      <GrapeBlendInput
        value={draft.grape_blends ?? draft.grapes.map((n) => ({ name: n, percentage: null }))}
        onChange={setGrapeBlends}
      />

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
    <LabelScannerModal
      visible={scannerVisible}
      onClose={() => setScannerVisible(false)}
      onApply={handleScanApply}
      userId={user?.id ?? ''}
    />
    </>
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
  // Scan label button
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  scanBtnIcon: { fontSize: 24 },
  scanBtnText: { flex: 1 },
  scanBtnLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  scanBtnSub: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 1,
  },
  scanBtnArrow: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 20,
    color: Colors.gold,
  },

  // Photo preview
  photoPreview: {
    marginBottom: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  photoImg: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  photoRemove: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  photoRemoveText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.red,
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
  priceRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-end',
  },
});
