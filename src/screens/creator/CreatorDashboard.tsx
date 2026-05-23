import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { MainStackParamList } from '@/navigation/types';
import { CreatorScore } from '@/types';
import { listMyCreatorScores, deleteCreatorScore } from '@/lib/supabase';

type Props = NativeStackScreenProps<MainStackParamList, 'CreatorDashboard'>;

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? Colors.gold : score >= 60 ? Colors.green : Colors.inkMuted;
  return (
    <View style={[badge.container, { borderColor: color }]}>
      <Text style={[badge.text, { color }]}>{score}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.playfair,
    fontSize: 16,
  },
});

export function CreatorDashboard({ navigation }: Props) {
  const [scores, setScores] = useState<CreatorScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const load = useCallback(async () => {
    const { data, error } = await listMyCreatorScores();
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setScores((data as CreatorScore[]) ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(`Delete "${name}"?`, 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCreatorScore(id);
          setScores((prev) => prev.filter((s) => s.id !== id));
        },
      },
    ]);
  };

  const filtered = scores.filter((s) => {
    if (filter === 'published') return s.is_published;
    if (filter === 'draft') return !s.is_published;
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Creator Studio</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreatorScore', {})}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </Pressable>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['all', 'published', 'draft'] as const).map((f) => (
          <Pressable
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={Colors.gold}
            />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>No scores yet</Text>
              <Text style={styles.emptyBody}>
                Tap "+ New" to create your first Signature Score.
              </Text>
            </View>
          ) : (
            filtered.map((score) => (
              <Pressable
                key={score.id}
                style={styles.card}
                onPress={() => navigation.navigate('CreatorScore', { scoreId: score.id })}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardName} numberOfLines={1}>{score.entry_name}</Text>
                    {!score.is_published && (
                      <View style={styles.draftBadge}>
                        <Text style={styles.draftText}>DRAFT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardProducer} numberOfLines={1}>
                    {score.producer || '—'}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {score.style}
                    {score.region ? ` · ${score.region}` : ''}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <ScoreBadge score={score.signature_score} />
                  <Pressable
                    hitSlop={12}
                    onPress={() => handleDelete(score.id, score.entry_name)}
                  >
                    <Text style={styles.deleteIcon}>🗑</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: { width: 60 },
  backText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.gold,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.ink,
  },
  addBtn: {
    width: 60,
    alignItems: 'flex-end',
  },
  addBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.gold,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  filterTabActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  filterTabText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  filterTabTextActive: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.ink,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: Spacing.xl,
    gap: Spacing.sm,
    paddingBottom: Spacing.huge,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardLeft: {
    flex: 1,
    gap: 3,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    fontFamily: Fonts.playfair,
    fontSize: 15,
    color: Colors.ink,
    flex: 1,
  },
  draftBadge: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: Colors.inkFaint,
  },
  draftText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 9,
    color: Colors.inkMuted,
    letterSpacing: 0.5,
  },
  cardProducer: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  cardMeta: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkFaint,
    textTransform: 'capitalize',
  },
  cardRight: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deleteIcon: {
    fontSize: 16,
    opacity: 0.4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.huge,
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 20,
    color: Colors.ink,
  },
  emptyBody: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
