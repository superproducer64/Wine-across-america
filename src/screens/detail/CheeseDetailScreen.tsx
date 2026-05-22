import React, { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/Button';
import { getCheeseEntry } from '@/lib/supabase';
import { useCheeseStore } from '@/stores/cheeseStore';
import { CheeseEntry, PASTEURIZATION_LABELS } from '@/types';
import { MainStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'CheeseDetail'>;

export function CheeseDetailScreen({ route, navigation }: Props) {
  const { entryId } = route.params;
  const [entry, setEntry] = useState<CheeseEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { removeEntry } = useCheeseStore();

  useEffect(() => {
    (async () => {
      const { data, error } = await getCheeseEntry(entryId);
      if (!error && data) setEntry(data as CheeseEntry);
      setLoading(false);
    })();
  }, [entryId]);

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
        <CheeseIdentityCard entry={entry} />

        {/* Price */}
        {entry.price != null && (
          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Price Paid</Text>
            <Text style={styles.detailValue}>${entry.price.toFixed(2)}</Text>
          </View>
        )}

        {/* Notes */}
        {entry.notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>Tasting Notes</Text>
            <Text style={styles.notesText}>{entry.notes}</Text>
          </View>
        ) : null}

        <View style={{ height: Spacing.huge }} />
      </ScrollView>
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
});
