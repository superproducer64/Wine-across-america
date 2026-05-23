import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import {
  TECHNICAL_CATEGORIES,
  TechnicalScores,
  computeTechnicalScore,
  technicalScoreTier,
  PastureSoil, Climate, MilkSeason,
  PASTURE_SOIL_OPTIONS, CLIMATE_OPTIONS, MILK_SEASON_OPTIONS,
  PASTURE_SOIL_LABELS, CLIMATE_LABELS, MILK_SEASON_LABELS,
  CheeseTerroirDraft,
} from '@/types';

export function Step3TechnicalScore() {
  const { scores, setScore, terroir, terroirEnabled, setTerroirField, setTerroirEnabled } = useEntryDraftStore();
  const total = computeTechnicalScore(scores);
  const tier = technicalScoreTier(total);
  const progress = total / 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Technical Score</Text>
      <Text style={styles.intro}>
        Score each category 0–20. The total out of 100 updates live.
      </Text>

      {/* Running total card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreCardLeft}>
          <Text style={styles.scoreTotalLabel}>Total Score</Text>
          <Text style={[styles.scoreTierLabel, { color: tier.color }]}>{tier.label}</Text>
        </View>
        <View style={styles.scoreCardRight}>
          <Text style={styles.scoreTotalNumber}>{total}</Text>
          <Text style={styles.scoreTotalMax}>/100</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: tier.color }]} />
      </View>
      <View style={styles.progressLabels}>
        <Text style={styles.progressTick}>0</Text>
        <Text style={styles.progressTick}>25</Text>
        <Text style={styles.progressTick}>50</Text>
        <Text style={styles.progressTick}>75</Text>
        <Text style={styles.progressTick}>100</Text>
      </View>

      {/* Category sliders */}
      <View style={styles.sliders}>
        {TECHNICAL_CATEGORIES.map((cat) => (
          <View key={cat.key} style={styles.catRow}>
            <View style={styles.catHeader}>
              <Text style={styles.catLabel}>{cat.label}</Text>
              <View style={styles.catScoreBadge}>
                <Text style={styles.catScoreText}>
                  {scores[cat.key as keyof TechnicalScores]}
                </Text>
              </View>
            </View>
            <Text style={styles.catDesc}>{cat.description}</Text>
            <ScoreSlider
              label=""
              value={scores[cat.key as keyof TechnicalScores]}
              min={0}
              max={20}
              step={1}
              onChange={(v) => setScore({ [cat.key]: v })}
              accentColor={Colors.gold}
            />
          </View>
        ))}
      </View>

        {/* ── Terroir Layer ── */}
        <View style={terroirStyles.section}>
          <View style={terroirStyles.toggleRow}>
            <View style={terroirStyles.toggleLeft}>
              <Text style={terroirStyles.toggleTitle}>Terroir Layer</Text>
              <Text style={terroirStyles.toggleSub}>
                Record pasture, climate, and milk season
              </Text>
            </View>
            <Switch
              value={terroirEnabled}
              onValueChange={setTerroirEnabled}
              trackColor={{ false: Colors.border, true: Colors.gold }}
              thumbColor={terroirEnabled ? Colors.ink : Colors.inkFaint}
            />
          </View>

          {terroirEnabled && (
            <View style={terroirStyles.fields}>
              {/* Pasture / Soil */}
              <Text style={terroirStyles.fieldLabel}>Pasture / Soil Type</Text>
              <View style={terroirStyles.chipRow}>
                {PASTURE_SOIL_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    style={[
                      terroirStyles.chip,
                      terroir.pasture_soil === opt && terroirStyles.chipActive,
                    ]}
                    onPress={() =>
                      setTerroirField({
                        pasture_soil: terroir.pasture_soil === opt ? null : opt,
                      })
                    }
                  >
                    <Text
                      style={[
                        terroirStyles.chipText,
                        terroir.pasture_soil === opt && terroirStyles.chipTextActive,
                      ]}
                    >
                      {PASTURE_SOIL_LABELS[opt]}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Climate */}
              <Text style={terroirStyles.fieldLabel}>Climate</Text>
              <View style={terroirStyles.chipRow}>
                {CLIMATE_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    style={[
                      terroirStyles.chip,
                      terroir.climate === opt && terroirStyles.chipActive,
                    ]}
                    onPress={() =>
                      setTerroirField({
                        climate: terroir.climate === opt ? null : opt,
                      })
                    }
                  >
                    <Text
                      style={[
                        terroirStyles.chipText,
                        terroir.climate === opt && terroirStyles.chipTextActive,
                      ]}
                    >
                      {CLIMATE_LABELS[opt]}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Milk Season */}
              <Text style={terroirStyles.fieldLabel}>Milk Season</Text>
              <View style={terroirStyles.chipRow}>
                {MILK_SEASON_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt}
                    style={[
                      terroirStyles.chip,
                      terroir.milk_season === opt && terroirStyles.chipActive,
                    ]}
                    onPress={() =>
                      setTerroirField({
                        milk_season: terroir.milk_season === opt ? null : opt,
                      })
                    }
                  >
                    <Text
                      style={[
                        terroirStyles.chipText,
                        terroir.milk_season === opt && terroirStyles.chipTextActive,
                      ]}
                    >
                      {MILK_SEASON_LABELS[opt]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
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
    marginBottom: 6,
  },
  intro: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    marginBottom: Spacing.lg,
    lineHeight: 19,
  },
  scoreCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  scoreCardLeft: {
    gap: 4,
  },
  scoreCardRight: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  scoreTotalLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  scoreTierLabel: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 16,
  },
  scoreTotalNumber: {
    fontFamily: Fonts.playfair,
    fontSize: 52,
    color: Colors.gold,
    lineHeight: 56,
  },
  scoreTotalMax: {
    fontFamily: Fonts.dmSans,
    fontSize: 18,
    color: 'rgba(255,255,255,0.4)',
    paddingBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  progressTick: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkFaint,
  },
  sliders: {
    gap: Spacing.sm,
  },
  catRow: {
    marginBottom: Spacing.md,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  catScoreBadge: {
    minWidth: 32,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.goldPale,
    borderWidth: 0.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  catScoreText: {
    fontFamily: Fonts.playfair,
    fontSize: 12,
    color: Colors.gold,
    lineHeight: 16,
  },
  catDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
    marginBottom: 8,
  },
});

const terroirStyles = StyleSheet.create({
  section: {
    marginTop: Spacing.xl,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  toggleLeft: { flex: 1 },
  toggleTitle: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: Colors.ink,
  },
  toggleSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
  },
  fields: {
    marginTop: Spacing.lg,
    gap: 4,
  },
  fieldLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  chipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  chipText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMid,
  },
  chipTextActive: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.ink,
  },
});
