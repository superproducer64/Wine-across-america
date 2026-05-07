import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { TextInput } from '@/components/ui/TextInput';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { TerriorSoil, TerriorClimate, TERROIR_SOIL_LABELS, TERROIR_CLIMATE_LABELS } from '@/types';

const SOILS: TerriorSoil[] = ['limestone', 'volcanic', 'granite', 'clay', 'sand'];
const CLIMATES: TerriorClimate[] = ['cool', 'moderate', 'warm'];

const SOIL_ICONS: Record<TerriorSoil, string> = {
  limestone: '🪨',
  volcanic: '🌋',
  granite: '⛰️',
  clay: '🌿',
  sand: '🏖️',
};

import { detectLocation } from '@/utils/detectLocation';

interface Props {
  isSommelier?: boolean;
}

export function Step5NotesAndTerroir({ isSommelier }: Props) {
  const { draft, setBasics, setNotesAndTerroir } = useEntryDraftStore();
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [tagText, setTagText] = useState(draft.tags.join(', '));

  const handleDetectLocation = async () => {
    setLocLoading(true);
    setLocError('');
    try {
      const { name, lat, lng } = await detectLocation();
      setBasics({ location_name: name, location_geo: { lat, lng } });
    } catch (err: unknown) {
      setLocError(err instanceof Error ? err.message : 'Could not detect location.');
    } finally {
      setLocLoading(false);
    }
  };

  const handleTagInput = (text: string) => {
    setTagText(text);
    const tags = text
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setNotesAndTerroir({ tags });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Notes & Finishing Touches</Text>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Where are you tasting?</Text>
        <View style={styles.locationRow}>
          <View style={styles.locationNameBox}>
            {draft.location_name ? (
              <>
                <Text style={styles.locationEmoji}>📍</Text>
                <Text style={styles.locationName} numberOfLines={1}>
                  {draft.location_name}
                </Text>
                <Pressable onPress={() => setBasics({ location_name: '', location_geo: null })}>
                  <Text style={styles.locationClear}>✕</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.locationPlaceholder}>No location set</Text>
            )}
          </View>
          <Pressable
            style={[styles.locationBtn, locLoading && styles.locationBtnDisabled]}
            onPress={handleDetectLocation}
            disabled={locLoading}
          >
            {locLoading ? (
              <ActivityIndicator size="small" color={Colors.surface} />
            ) : (
              <Text style={styles.locationBtnText}>📍 Detect</Text>
            )}
          </Pressable>
        </View>
        {locError ? <Text style={styles.locError}>{locError}</Text> : null}
        <TextInput
          label="Or type a location"
          value={draft.location_name}
          onChangeText={(v) => setBasics({ location_name: v, location_geo: null })}
          placeholder="Restaurant, city, venue…"
        />
      </View>

      {/* Quick Questions */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Quick Questions</Text>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleEmoji}>🥂</Text>
            <View>
              <Text style={styles.toggleTitle}>Want another glass?</Text>
              <Text style={styles.toggleSub}>Would you order it again right now?</Text>
            </View>
          </View>
          <Switch
            value={draft.want_another_glass}
            onValueChange={(v) => setNotesAndTerroir({ want_another_glass: v })}
            thumbColor={Colors.surface}
            trackColor={{ false: Colors.surfaceAlt, true: Colors.gold }}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleEmoji}>🛒</Text>
            <View>
              <Text style={styles.toggleTitle}>Want to buy a bottle?</Text>
              <Text style={styles.toggleSub}>Worth seeking out?</Text>
            </View>
          </View>
          <Switch
            value={draft.want_to_buy}
            onValueChange={(v) => setNotesAndTerroir({ want_to_buy: v })}
            thumbColor={Colors.surface}
            trackColor={{ false: Colors.surfaceAlt, true: Colors.gold }}
          />
        </View>
      </View>

      {/* Terroir Toggle — Sommelier only */}
      {isSommelier ? (
      <View style={styles.section}>
        <View style={styles.terriorHeaderRow}>
          <View>
            <Text style={styles.sectionLabel}>Terroir Layer</Text>
            <Text style={styles.terriorSub}>Add soil & climate context</Text>
          </View>
          <Switch
            value={draft.terroir_visible}
            onValueChange={(v) => setNotesAndTerroir({ terroir_visible: v })}
            thumbColor={Colors.surface}
            trackColor={{ false: Colors.surfaceAlt, true: Colors.green }}
          />
        </View>

        {draft.terroir_visible && (
          <View style={styles.terriorExpanded}>
            <Text style={styles.miniLabel}>Soil Type</Text>
            <View style={styles.chipRow}>
              {SOILS.map((soil) => (
                <Pressable
                  key={soil}
                  style={[
                    styles.terriorChip,
                    draft.terroir_soil === soil && styles.terriorChipSelected,
                  ]}
                  onPress={() => setNotesAndTerroir({ terroir_soil: soil })}
                >
                  <Text style={styles.terriorChipIcon}>{SOIL_ICONS[soil]}</Text>
                  <Text
                    style={[
                      styles.terriorChipText,
                      draft.terroir_soil === soil && styles.terriorChipTextSelected,
                    ]}
                  >
                    {TERROIR_SOIL_LABELS[soil]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.miniLabel, { marginTop: Spacing.md }]}>Climate</Text>
            <View style={styles.chipRow}>
              {CLIMATES.map((climate) => (
                <Pressable
                  key={climate}
                  style={[
                    styles.terriorChip,
                    draft.terroir_climate === climate && styles.terriorChipSelected,
                  ]}
                  onPress={() => setNotesAndTerroir({ terroir_climate: climate })}
                >
                  <Text
                    style={[
                      styles.terriorChipText,
                      draft.terroir_climate === climate && styles.terriorChipTextSelected,
                    ]}
                  >
                    {TERROIR_CLIMATE_LABELS[climate]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
      ) : null}

      {/* Tags */}
      <View style={styles.section}>
        <TextInput
          label="Tags (comma-separated)"
          value={tagText}
          onChangeText={handleTagInput}
          placeholder="mineral, volcanic, value, cellar"
          hint="Tags help you find wines with compound search"
        />
      </View>

      {/* Free Notes */}
      <View style={styles.section}>
        <TextInput
          label="Tasting Notes (optional)"
          value={draft.free_notes}
          onChangeText={(v) => setNotesAndTerroir({ free_notes: v })}
          multiline
          placeholder="Any additional observations, food pairing ideas, or context..."
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  stepTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 22,
    color: Colors.ink,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  locationNameBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: 6,
    minHeight: 42,
  },
  locationEmoji: { fontSize: 14 },
  locationName: {
    flex: 1,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.ink,
  },
  locationClear: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    paddingLeft: 4,
  },
  locationPlaceholder: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkFaint,
  },
  locationBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  locationBtnDisabled: { opacity: 0.6 },
  locationBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.surface,
  },
  locError: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.red,
    marginBottom: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  toggleEmoji: { fontSize: 22 },
  toggleTitle: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.ink,
  },
  toggleSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  terriorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  terriorSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  terriorExpanded: {
    backgroundColor: '#EAF5EE',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: '#A5D6B5',
  },
  miniLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.green,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  terriorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: '#A5D6B5',
  },
  terriorChipSelected: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  terriorChipIcon: { fontSize: 12 },
  terriorChipText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.green,
  },
  terriorChipTextSelected: {
    color: Colors.white,
    fontFamily: Fonts.dmSansMedium,
  },
});
