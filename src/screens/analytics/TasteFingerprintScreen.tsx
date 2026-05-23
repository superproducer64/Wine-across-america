import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { VictoryChart, VictoryPolarAxis, VictoryArea, VictoryLabel } from 'victory-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { Button } from '@/components/ui/Button';
import { generateFingerprint, getCachedFingerprint, TasteFingerprint } from '@/lib/aiService';

const RADAR_AXES = [
  { key: 'aroma',            label: 'Aroma' },
  { key: 'texture',          label: 'Texture' },
  { key: 'flavor_intensity', label: 'Flavor' },
  { key: 'complexity',       label: 'Complexity' },
  { key: 'finish',           label: 'Finish' },
  { key: 'typicity',         label: 'Typicity' },
];

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function daysUntilRefresh(generatedAt: string): number {
  const age = Date.now() - new Date(generatedAt).getTime();
  return Math.max(0, Math.ceil((SEVEN_DAYS_MS - age) / (24 * 60 * 60 * 1000)));
}

export function TasteFingerprintScreen() {
  const navigation = useNavigation();
  const [fingerprint, setFingerprint] = useState<TasteFingerprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const cached = await getCachedFingerprint();
    setFingerprint(cached as TasteFingerprint | null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async (force = false) => {
    setGenerating(true);
    try {
      const result = await generateFingerprint(force);
      setFingerprint(result as unknown as TasteFingerprint);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      if (msg.includes('Not enough entries')) {
        Alert.alert('Need more entries', 'Log at least 3 cheeses with scores to generate your taste fingerprint.');
      } else if (msg.includes('Rate limited') || msg.includes('429')) {
        Alert.alert('Refreshes weekly', 'Your fingerprint was generated recently. Check back next week for a fresh analysis.');
      } else if (msg.includes('Pro subscription')) {
        Alert.alert('Pro feature', 'Upgrade to Intelligence to unlock your Taste Fingerprint.');
      } else {
        Alert.alert('Error', 'Could not generate fingerprint. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  // Build radar data
  const radarData = fingerprint?.avg_scores
    ? RADAR_AXES.map((a) => ({ x: a.label, y: (fingerprint.avg_scores[a.key] ?? 0) }))
    : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.gold} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const canRefresh = fingerprint
    ? daysUntilRefresh(fingerprint.generated_at) === 0
    : true;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav */}
      <View style={styles.navbar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>Taste Fingerprint</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {fingerprint ? (
          <>
            {/* Radar chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Your Structure Profile</Text>
              <Text style={styles.chartSub}>Average across {fingerprint.entry_count} entries</Text>
              <View style={styles.chartWrap}>
                <VictoryChart polar domain={{ y: [0, 10] }} height={240} padding={50}>
                  {RADAR_AXES.map((a) => (
                    <VictoryPolarAxis
                      key={a.key}
                      dependentAxis
                      style={{
                        axisLabel: { fill: Colors.inkMuted, fontFamily: Fonts.dmSans, fontSize: 10 },
                        axis: { stroke: Colors.border, opacity: 0.6 },
                        grid: { stroke: Colors.border, opacity: 0.3 },
                        tickLabels: { fill: 'transparent' },
                      }}
                      labelPlacement="perpendicular"
                      axisValue={a.label}
                      label={a.label}
                      tickValues={[2, 4, 6, 8, 10]}
                    />
                  ))}
                  <VictoryArea
                    data={radarData ?? []}
                    style={{
                      data: { fill: 'rgba(201,168,76,0.18)', stroke: Colors.gold, strokeWidth: 1.5 },
                    }}
                  />
                </VictoryChart>
              </View>
            </View>

            {/* Personality */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View>
                <Text style={styles.sectionTitle}>Your Palate Profile</Text>
              </View>
              <Text style={styles.descText}>{fingerprint.description}</Text>
            </View>

            {/* Recommendations */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>You Might Love</Text>
              </View>
              {fingerprint.recommendations.map((rec, i) => (
                <View key={i} style={styles.recRow}>
                  <View style={styles.recBullet}>
                    <Text style={styles.recBulletText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </View>

            {/* Blind spot */}
            <View style={styles.blindSpotCard}>
              <Text style={styles.blindSpotLabel}>Your Blind Spot</Text>
              <Text style={styles.blindSpotText}>{fingerprint.blind_spot}</Text>
            </View>

            {/* Refresh */}
            <View style={styles.refreshBlock}>
              {canRefresh ? (
                <Button
                  label={generating ? 'Analysing…' : 'Refresh Analysis'}
                  onPress={() => handleGenerate(true)}
                  loading={generating}
                  variant="secondary"
                  size="md"
                />
              ) : (
                <Text style={styles.refreshHint}>
                  Refreshes in {daysUntilRefresh(fingerprint.generated_at)} day
                  {daysUntilRefresh(fingerprint.generated_at) !== 1 ? 's' : ''} ·{' '}
                  Generated {new Date(fingerprint.generated_at).toLocaleDateString()}
                </Text>
              )}
            </View>
          </>
        ) : (
          /* Empty state */
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🧀</Text>
            <Text style={styles.emptyTitle}>Discover Your Palate</Text>
            <Text style={styles.emptyDesc}>
              Claude analyses your scored entries to reveal your tasting personality, what you'd love next, and where you have a blind spot.
            </Text>
            <Button
              label={generating ? 'Analysing your collection…' : 'Generate My Fingerprint'}
              onPress={() => handleGenerate(false)}
              loading={generating}
              size="lg"
              style={styles.generateBtn}
            />
            <Text style={styles.emptyHint}>Requires at least 3 scored entries · Refreshes weekly</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  navBtn: { width: 60 },
  navBtnText: { fontFamily: Fonts.dmSansRegular, fontSize: 16, color: Colors.gold },
  navTitle: { fontFamily: Fonts.playfair, fontSize: 17, color: Colors.ink },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: Spacing.xl,
  },
  chartCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  chartTitle: { fontFamily: Fonts.playfair, fontSize: 16, color: Colors.ink },
  chartSub: { fontFamily: Fonts.dmSans, fontSize: 12, color: Colors.inkMuted, marginTop: 2 },
  chartWrap: { width: '100%' },
  section: { gap: Spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  aiBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  aiBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 9,
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  descText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 15,
    color: Colors.inkMid,
    lineHeight: 24,
  },
  recRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  recBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.goldPale,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  recBulletText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.gold,
  },
  recText: {
    flex: 1,
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMid,
    lineHeight: 21,
  },
  blindSpotCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: 8,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  blindSpotLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  blindSpotText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 14,
    color: Colors.gold,
    lineHeight: 22,
  },
  refreshBlock: { alignItems: 'center' },
  refreshHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.huge,
    gap: Spacing.lg,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 24,
    color: Colors.ink,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMuted,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
  generateBtn: { width: '100%', marginTop: Spacing.md },
  emptyHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
});
