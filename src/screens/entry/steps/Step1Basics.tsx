import React, { useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { detectLocation } from '@/utils/detectLocation';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { TextInput } from '@/components/ui/TextInput';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { useAuthStore } from '@/stores/authStore';
import { COUNTRIES_AND_REGIONS, PriceEntry } from '@/types';
import { LabelScannerModal } from '@/components/wine/LabelScannerModal';
import { USStateSearchPicker } from '@/components/wine/USStateSearchPicker';
import { CountrySearchPicker } from '@/components/wine/CountrySearchPicker';
import { GrapeBlendInput } from '@/components/wine/GrapeBlendInput';
import { DatePickerInput } from '@/components/ui/DatePickerInput';
import { WineLabelData } from '@/utils/wineOcr';
import { useResponsive } from '@/hooks/useResponsive';

export function Step1Basics() {
  const { draft, setBasics, setLabelPhoto, setGrapeBlends } = useEntryDraftStore();
  const { user } = useAuthStore();
  const { isWide } = useResponsive();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [priceMode, setPriceMode] = useState<'glass' | 'bottle'>('glass');
  const [toggleWidth, setToggleWidth] = useState(0);
  const priceAnim = useRef(new Animated.Value(0)).current;
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleGeoTag = async () => {
    setGeoLoading(true);
    setGeoError(null);
    try {
      const { name } = await detectLocation();
      setBasics({ location_name: name });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not get location';
      setGeoError(msg);
      setTimeout(() => setGeoError(null), 4000);
    } finally {
      setGeoLoading(false);
    }
  };

  const handlePriceMode = (mode: 'glass' | 'bottle') => {
    setPriceMode(mode);
    Animated.spring(priceAnim, {
      toValue: mode === 'glass' ? 0 : 1,
      useNativeDriver: true,
      tension: 280,
      friction: 28,
    }).start();
  };

  const regions = draft.country ? Object.keys(COUNTRIES_AND_REGIONS[draft.country] ?? {}) : [];
  const subregions =
    draft.country && draft.region
      ? COUNTRIES_AND_REGIONS[draft.country]?.[draft.region] ?? []
      : [];

  const handleCountrySelect = (country: string) => {
    setBasics({ country, region: '', subregion: '', appellation: '' });
  };

  const handleRegionSelect = (region: string) => {
    setBasics({ region, subregion: '', appellation: '' });
  };

  const handleScanApply = (data: Partial<WineLabelData> & { photoUrl?: string; photoBlurHash?: string; backPhotoUrl?: string }) => {
    const updates: Parameters<typeof setBasics>[0] = {};
    if (data.name) updates.name = data.name;
    if (data.producer) updates.producer = data.producer;
    if (data.vintage !== undefined) updates.vintage = data.vintage;
    if (data.country) updates.country = data.country;
    if (data.region) updates.region = data.region;
    if (data.appellation) updates.appellation = data.appellation;
    if (Object.keys(updates).length > 0) setBasics(updates);
    if (data.photoUrl) setLabelPhoto(data.photoUrl, data.photoBlurHash ?? null, data.backPhotoUrl ?? null);
    if (data.grapes && data.grapes.length > 0) {
      setGrapeBlends(data.grapes.map((g) => ({ name: g, percentage: 100 })));
    }
  };

  const getPriceEntry = (type: 'glass' | 'bottle'): PriceEntry | undefined => {
    const typed = draft.price.find((p) => p.type === type);
    if (typed) return typed;
    if (type === 'bottle') return draft.price.find((p) => !p.type);
    return undefined;
  };

  const handlePriceChange = (type: 'glass' | 'bottle', field: 'amount' | 'currency', value: string) => {
    const withoutType = draft.price.filter((p) => {
      if (p.type === type) return false;
      if (type === 'bottle' && !p.type) return false;
      return true;
    });
    const existing = getPriceEntry(type);

    if (field === 'amount') {
      if (!value.trim()) {
        setBasics({ price: withoutType });
        return;
      }
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        setBasics({ price: withoutType });
        return;
      }
      const updated: PriceEntry = {
        amount: parsed,
        currency: existing?.currency ?? 'USD',
        date: existing?.date ?? '',
        location: existing?.location ?? '',
        type,
      };
      setBasics({ price: [...withoutType, updated] });
    } else {
      if (!existing) return;
      const updated: PriceEntry = { ...existing, currency: value, type };
      setBasics({ price: [...withoutType, updated] });
    }
  };

  const leftColumn = (
    <View style={[styles.column, isWide && styles.columnWide]}>
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
          <Pressable onPress={() => setLabelPhoto(null, null)} style={styles.photoRemove}>
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
    </View>
  );

  const rightColumn = (
    <View style={[styles.column, isWide && styles.columnWide]}>
      {/* Country Selector */}
      <Text style={styles.label}>Country</Text>
      <CountrySearchPicker
        selected={draft.country}
        onSelect={handleCountrySelect}
      />

      {/* Region Selector */}
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

      {/* Subregion Selector */}
      {subregions.length > 0 && (
        <>
          <Text style={styles.label}>Subregion (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={styles.chipRow}>
              {subregions.map((s) => (
                <Pressable
                  key={s}
                  style={[styles.chip, draft.subregion === s && styles.chipSelected]}
                  onPress={() => setBasics({ subregion: s })}
                >
                  <Text style={[styles.chipText, draft.subregion === s && styles.chipTextSelected]}>
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {/* Appellation */}
      <TextInput
        label="Appellation / AOC / DOC (optional)"
        value={draft.appellation}
        onChangeText={(v) => setBasics({ appellation: v })}
        placeholder="e.g., Pomerol AOC, Barolo DOCG"
      />

      {/* Grape Varieties */}
      <Text style={styles.label}>Grape Varieties</Text>
      <GrapeBlendInput
        value={(draft.grape_blends ?? draft.grapes.map((n) => ({ name: n, percentage: null }))).map(
          (e) => ({ ...e, percentage: e.percentage ?? 100 })
        )}
        onChange={setGrapeBlends}
      />

      {/* Price */}
      <Text style={styles.label}>Price (optional)</Text>
      <View style={styles.priceToggleWrapper}>
        <View
          style={styles.priceTogglePill}
          onLayout={(e) => setToggleWidth(e.nativeEvent.layout.width)}
        >
          {toggleWidth > 0 && (
            <Animated.View
              style={[
                styles.priceToggleIndicator,
                {
                  width: (toggleWidth - 4) / 2,
                  transform: [{
                    translateX: priceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, (toggleWidth - 4) / 2 + 2],
                    }),
                  }],
                },
              ]}
            />
          )}
          <Pressable style={styles.priceToggleOption} onPress={() => handlePriceMode('glass')}>
            <Text style={[styles.priceToggleText, priceMode === 'glass' && styles.priceToggleTextActive]}>
              Glass
            </Text>
          </Pressable>
          <Pressable style={styles.priceToggleOption} onPress={() => handlePriceMode('bottle')}>
            <Text style={[styles.priceToggleText, priceMode === 'bottle' && styles.priceToggleTextActive]}>
              Bottle
            </Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.priceRow}>
        <TextInput
          label="Amount"
          value={getPriceEntry(priceMode) ? String(getPriceEntry(priceMode)!.amount || '') : ''}
          onChangeText={(v) => handlePriceChange(priceMode, 'amount', v)}
          keyboardType="decimal-pad"
          placeholder="0.00"
          containerStyle={{ flex: 1 }}
        />
        <TextInput
          label="Currency"
          value={getPriceEntry(priceMode)?.currency ?? 'USD'}
          onChangeText={(v) => handlePriceChange(priceMode, 'currency', v)}
          placeholder="USD"
          containerStyle={{ width: 70 }}
        />
      </View>

      {/* Tasting Date */}
      <DatePickerInput
        label="Tasting Date"
        value={draft.tasting_date}
        onChange={(v) => setBasics({ tasting_date: v })}
      />

      {/* Location */}
      <View style={styles.locationLabelRow}>
        <Text style={styles.label}>Location</Text>
        <Pressable
          style={[styles.geoBtn, geoLoading && styles.geoBtnDisabled]}
          onPress={handleGeoTag}
          disabled={geoLoading}
        >
          {geoLoading ? (
            <ActivityIndicator size={12} color={Colors.gold} />
          ) : (
            <Text style={styles.geoBtnIcon}>📍</Text>
          )}
          <Text style={styles.geoBtnText}>
            {geoLoading ? 'Locating…' : 'Use my location'}
          </Text>
        </Pressable>
      </View>
      <TextInput
        value={draft.location_name}
        onChangeText={(v) => setBasics({ location_name: v })}
        placeholder="e.g., Le Bernardin, NYC"
      />
      {geoError ? (
        <Text style={styles.geoError}>{geoError}</Text>
      ) : null}
    </View>
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.stepTitle}>Wine Basics</Text>

        {isWide ? (
          <View style={styles.twoColRow}>
            {leftColumn}
            {rightColumn}
          </View>
        ) : (
          <>
            {leftColumn}
            {rightColumn}
          </>
        )}
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
  contentWide: {
    padding: Spacing.xxl,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    alignItems: 'flex-start',
  },
  column: {},
  columnWide: {
    flex: 1,
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
  priceToggleWrapper: {
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  priceTogglePill: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 2,
    position: 'relative',
    alignSelf: 'flex-start',
    minWidth: 160,
  },
  priceToggleIndicator: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.gold,
  },
  priceToggleOption: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 18,
    alignItems: 'center',
    zIndex: 1,
  },
  priceToggleText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  priceToggleTextActive: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.ink,
  },
  locationLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  geoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.goldPale,
    borderWidth: 0.5,
    borderColor: Colors.gold,
  },
  geoBtnDisabled: {
    opacity: 0.6,
  },
  geoBtnIcon: {
    fontSize: 11,
  },
  geoBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.gold,
  },
  geoError: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 11,
    color: Colors.red,
    marginTop: 4,
  },
});
