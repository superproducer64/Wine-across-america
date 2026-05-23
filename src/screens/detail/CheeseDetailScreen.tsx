import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { CheeseIdentityCard } from '@/components/cheese/CheeseIdentityCard';
import { CheeseShareCard } from '@/components/cheese/CheeseShareCard';
import { Button } from '@/components/ui/Button';
import { getCheeseEntry } from '@/lib/supabase';
import { useCheeseStore } from '@/stores/cheeseStore';
import { CheeseEntry, CheeseScore, CheeseTerroirRecord, PASTEURIZATION_LABELS } from '@/types';
import { MainStackParamList } from '@/navigation/types';
import { captureRef } from 'expo-view-shot';
import * as Sharing from 'expo-sharing';

type Props = NativeStackScreenProps<MainStackParamList, 'CheeseDetail'>;

export function CheeseDetailScreen({ route, navigation }: Props) {
  const { entryId } = route.params;
  const [entry, setEntry] = useState<CheeseEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<CheeseScore | null>(null);
  const [terroir, setTerroir] = useState<CheeseTerroirRecord | null>(null);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<View>(null);
  const { removeEntry, fetchScore, fetchTerroirRecord } = useCheeseStore();

  useEffect(() => {
    (async () => {
      const { data, error } = await getCheeseEntry(entryId);
      if (!error && data) setEntry(data as CheeseEntry);
        const [scoreRes, terroirRes] = await Promise.all([
          fetchScore(entryId),
          fetchTerroirRecord(entryId),
        ]);
        setScores(scoreRes);
        setTerroir(terroirRes);
      setLoading(false);
    })();
  }, [entryId]);

  const handleShare = async () => {
    if (!cardRef.current || !entry) return;
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `${entry.name} — Cheese Across America`,
      });
    } catch {
      Alert.alert('Share failed', 'Could not generate card image.');
    } finally {
      setSharing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete this cheese?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeEntry(entryId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.gold} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Cheese not found.</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const tastingDate = new Date(entry.tasting_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav bar */}
      <View style={styles.navbar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹ Back</Text>
        </Pressable>
        <Pressable onPress={handleDelete} style={styles.navBtn}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{tastingDate}</Text>
          {entry.pasteurization === 'raw' && (
            <View style={styles.rawBadge}>
              <Text style={styles.rawBadgeText}>Raw Milk</Text>
            </View>
          )}
        </View>

        {/* Identity card */}
        <CheeseIdentityCard entry={entry} scores={scores} terroir={terroir} />

        {/* Share button */}
        <Pressable
          style={[styles.shareBtn, sharing && styles.shareBtnDisabled]}
          onPress={handleShare}
          disabled={sharing}
        >
          <Text style={styles.shareBtnText}>
            {sharing ? 'Generating…' : '↑ Share Card'}
          </Text>
        </Pressable>

        {/* Price */}
        {entry.price != null && (
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Price Paid</Text>
            <Text style={styles.detailValue}>${entry.price.toFixed(2)}</Text>
          </View>
        )}

        {/* Typicity description (AI-generated) */}
        {entry.typicity_description ? (
          <View style={styles.typlicityBlock}>
            <View style={styles.aiBadgeRow}>
              <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View>
              <Text style={styles.aiBadgeLabel}>Character</Text>
            </View>
            <Text style={styles.typlicityText}>"{entry.typicity_description}"</Text>
          </View>
        ) : null}

        {/* AI-generated tags */}
        {entry.ai_tags && entry.ai_tags.length > 0 ? (
          <View style={styles.tagsBlock}>
            <View style={styles.aiBadgeRow}>
              <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View>
              <Text style={styles.aiBadgeLabel}>Descriptors</Text>
            </View>
            <View style={styles.tagRow}>
              {entry.ai_tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Notes */}
        {entry.notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>Tasting Notes</Text>
            <Text style={styles.notesText}>{entry.notes}</Text>
          </View>
        ) : null}

        <View style={{ height: Spacing.huge }} />
      </ScrollView>

      {/* Off-screen card for high-res capture */}
      {entry && (
        <View
          ref={cardRef}
          collapsable={false}
          pointerEvents="none"
          style={styles.offScreen}
        >
          <CheeseShareCard entry={entry} scores={scores} terroir={terroir} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.xl,
  },
  notFoundText: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.inkMuted,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  navBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  navBtnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 16,
    color: Colors.gold,
  },
  deleteText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.red,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  rawBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: '#EAF5EE',
    borderWidth: 0.5,
    borderColor: '#A5D6B5',
  },
  rawBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.green,
  },
  detailBlock: { gap: 3 },
  detailLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  detailValue: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 16,
    color: Colors.ink,
  },
  notesBlock: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    gap: 6,
  },
  notesLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  notesText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 14,
    color: Colors.inkMid,
    lineHeight: 21,
  },
  shareBtn: {
    backgroundColor: '#1A1710',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(201,168,76,0.4)',
  },
  shareBtnDisabled: { opacity: 0.5 },
  shareBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: '#C9A84C',
    letterSpacing: 0.3,
  },
  offScreen: {
    position: 'absolute',
    left: -1200,
    top: 0,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
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
  aiBadgeLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  typlicityBlock: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  typlicityText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 15,
    color: Colors.inkMid,
    lineHeight: 23,
  },
  tagsBlock: {
    gap: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.goldPale,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  tagText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMid,
  },
});
