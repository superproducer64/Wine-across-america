import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { VictoryBar, VictoryChart, VictoryPie, VictoryAxis } from 'victory-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { useCheeseStore } from '@/stores/cheeseStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { MILK_TYPE_LABELS, CHEESE_STYLE_LABELS, technicalScoreTier } from '@/types';
import { MainStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<MainStackParamList>;

const MILK_COLORS = {
  cow: '#C9A84C',
  sheep: '#8B7355',
  goat: '#7A9E7E',
  buffalo: '#6B7FA0',
  mixed: '#A08060',
};

export function AnalyticsScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuthStore();
  const { analytics, analyticsLoading, loadAnalytics } = useCheeseStore();
  const { isSubscribed } = useSubscriptionStore();

  useEffect(() => {
    if (user) loadAnalytics(user.id);
  }, [user]);

  if (analyticsLoading || !analytics) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.gold} size="large" />
          <Text style={styles.loadingText}>Analysing your collection…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tier = analytics.avgScore != null ? technicalScoreTier(analytics.avgScore) : null;

  // VictoryBar data for score distribution
  const scoreBarData = analytics.scoreBuckets.map((b, i) => ({
    x: b.label, y: b.count, i,
  }));

  // VictoryPie data for milk type
  const pieData = analytics.milkTypeCounts.map((m) => ({
    x: MILK_TYPE_LABELS[m.milk_type as keyof typeof MILK_TYPE_LABELS] ?? m.milk_type,
    y: m.count,
    fill: MILK_COLORS[m.milk_type as keyof typeof MILK_COLORS] ?? Colors.gold,
  }));

  // VictoryBar data for style breakdown (horizontal)
  const styleBarData = analytics.styleCounts.map((s) => ({
    x: CHEESE_STYLE_LABELS[s.style as keyof typeof CHEESE_STYLE_LABELS] ?? s.style,
    y: s.count,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Analytics</Text>

        {/* Taste Fingerprint promo card */}
        <Pressable
          style={styles.fingerprintCard}
          onPress={() => navigation.navigate('TasteFingerprint')}
        >
          <View style={styles.fingerprintLeft}>
            <Text style={styles.fingerprintTitle}>Your Taste Fingerprint</Text>
            <Text style={styles.fingerprintSub}>
              {isSubscribed
                ? 'See your palate profile, recommendations & blind spot'
                : 'Pro · AI-powered palate analysis'}
            </Text>
          </View>
          <Text style={styles.fingerprintChevron}>›</Text>
        </Pressable>

        {/* Hero stats */}
        <View style={styles.heroRow}>
          <View style={styles.heroCard}>
            <Text style={styles.heroNumber}>{analytics.total}</Text>
            <Text style={styles.heroLabel}>Cheeses Logged</Text>
          </View>
          <View style={[styles.heroCard, { flex: 1.2 }]}>
            {analytics.avgScore != null ? (
              <>
                <Text style={[styles.heroNumber, { color: tier?.color ?? Colors.gold }]}>
                  {analytics.avgScore}
                </Text>
                <Text style={styles.heroLabel}>Avg Score</Text>
                <Text style={[styles.heroTier, { color: tier?.color ?? Colors.inkMuted }]}>
                  {tier?.label}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.heroNumber}>—</Text>
                <Text style={styles.heroLabel}>Avg Score</Text>
              </>
            )}
          </View>
          {analytics.buyAgainRate != null && (
            <View style={styles.heroCard}>
              <Text style={styles.heroNumber}>{analytics.buyAgainRate}%</Text>
              <Text style={styles.heroLabel}>Buy Again</Text>
              <Text style={styles.heroSub}>{analytics.buyAgainAnswered} rated</Text>
            </View>
          )}
        </View>

        {/* Score Distribution */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Score Distribution</Text>
          {scoreBarData.every((d) => d.y === 0) ? (
            <Text style={styles.noData}>No scored entries yet</Text>
          ) : (
            <VictoryChart
              width={340}
              height={200}
              padding={{ top: 10, bottom: 40, left: 40, right: 20 }}
              domainPadding={{ x: 16 }}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: Colors.border },
                  tickLabels: { fontFamily: Fonts.dmSans, fontSize: 10, fill: Colors.inkMuted },
                  grid: { stroke: 'none' },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: 'none' },
                  grid: { stroke: Colors.border, strokeWidth: 0.5 },
                  tickLabels: { fontFamily: Fonts.dmSans, fontSize: 9, fill: Colors.inkFaint },
                }}
              />
              <VictoryBar
                data={scoreBarData}
                style={{
                  data: { fill: Colors.gold, opacity: 0.85, borderRadius: 3 },
                }}
                animate={{ duration: 300 }}
                cornerRadius={{ top: 3 }}
              />
            </VictoryChart>
          )}
        </View>

        {/* Milk Type Donut */}
        {pieData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>By Milk Type</Text>
            <View style={styles.donutWrap}>
              <VictoryPie
                data={pieData}
                innerRadius={60}
                width={200}
                height={200}
                colorScale={pieData.map((d) => d.fill)}
                style={{
                  labels: { display: 'none' },
                }}
                animate={{ duration: 300 }}
              />
              <View style={styles.legend}>
                {pieData.map((d) => (
                  <View key={d.x} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: d.fill }]} />
                    <Text style={styles.legendLabel}>{d.x}</Text>
                    <Text style={styles.legendCount}>{d.y}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Style Breakdown */}
        {styleBarData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>By Style</Text>
            <VictoryChart
              horizontal
              width={340}
              height={Math.max(160, styleBarData.length * 36 + 40)}
              padding={{ top: 10, bottom: 30, left: 80, right: 30 }}
              domainPadding={{ x: 10 }}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: Colors.border },
                  tickLabels: { fontFamily: Fonts.dmSans, fontSize: 11, fill: Colors.inkMid },
                  grid: { stroke: 'none' },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: 'none' },
                  grid: { stroke: Colors.border, strokeWidth: 0.5 },
                  tickLabels: { fontFamily: Fonts.dmSans, fontSize: 9, fill: Colors.inkFaint },
                }}
              />
              <VictoryBar
                data={styleBarData}
                style={{ data: { fill: Colors.inkMid, opacity: 0.7 } }}
                animate={{ duration: 300 }}
                cornerRadius={{ top: 3 }}
              />
            </VictoryChart>
          </View>
        )}

        {/* Top Regions */}
        {analytics.topRegions.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Top Regions by Score</Text>
            <View style={styles.regionList}>
              {analytics.topRegions.map((r, i) => {
                const t = technicalScoreTier(r.avg);
                return (
                  <View key={r.region} style={styles.regionRow}>
                    <Text style={styles.regionRank}>#{i + 1}</Text>
                    <View style={styles.regionInfo}>
                      <Text style={styles.regionName}>{r.region}</Text>
                      <Text style={styles.regionCount}>{r.count} {r.count === 1 ? 'cheese' : 'cheeses'}</Text>
                    </View>
                    <View style={[styles.regionBadge, { backgroundColor: Colors.ink }]}>
                      <Text style={[styles.regionScore, { color: t.color }]}>{r.avg}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Buy again note */}
        {analytics.buyAgainRate == null && (
          <View style={styles.hintCard}>
            <Text style={styles.hintText}>
              Add "Would buy again?" answers when logging cheeses to see your repurchase rate.
            </Text>
          </View>
        )}

        <View style={{ height: Spacing.huge }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  content: { padding: Spacing.xl, paddingBottom: Spacing.huge },
  screenTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 28,
    color: Colors.ink,
    marginBottom: Spacing.xl,
  },
  fingerprintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  fingerprintLeft: { flex: 1, gap: 3 },
  fingerprintTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 16,
    color: Colors.ink,
  },
  fingerprintSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
  },
  fingerprintChevron: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 22,
    color: Colors.gold,
  },
  heroRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  heroCard: {
    flex: 1,
    backgroundColor: Colors.ink,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  heroNumber: {
    fontFamily: Fonts.playfair,
    fontSize: 32,
    color: Colors.gold,
    lineHeight: 38,
  },
  heroLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  heroTier: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 12,
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  chartTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 16,
    color: Colors.ink,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  noData: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 13,
    color: Colors.inkMuted,
    paddingVertical: Spacing.xl,
  },
  donutWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    width: '100%',
  },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMid,
    flex: 1,
  },
  legendCount: {
    fontFamily: Fonts.playfair,
    fontSize: 13,
    color: Colors.ink,
  },
  regionList: { width: '100%', gap: Spacing.md },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  regionRank: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkFaint,
    width: 28,
  },
  regionInfo: { flex: 1 },
  regionName: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  regionCount: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  regionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionScore: {
    fontFamily: Fonts.playfair,
    fontSize: 15,
    lineHeight: 19,
  },
  hintCard: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  hintText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMid,
    lineHeight: 19,
  },
});
