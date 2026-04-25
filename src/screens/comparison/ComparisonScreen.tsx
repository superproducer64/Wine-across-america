import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  FlatList,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius, Shadows } from '@/theme';
import { useResponsive, MAX_CONTENT_WIDTH } from '@/hooks/useResponsive';
import { MainStackParamList } from '@/navigation/types';
import { useWineStore } from '@/stores/wineStore';
import { WineEntry } from '@/types';
import { WineComparisonCard } from '@/components/wine/WineComparisonCard';

type Props = NativeStackScreenProps<MainStackParamList, 'Comparison'>;

export function ComparisonScreen({ navigation }: Props) {
  const { entries } = useWineStore();
  const [selected, setSelected] = useState<WineEntry[]>([]);
  const [comparing, setComparing] = useState(false);
  const { isWide } = useResponsive();

  const toggleSelect = (entry: WineEntry) => {
    if (selected.find((e) => e.id === entry.id)) {
      setSelected((prev) => prev.filter((e) => e.id !== entry.id));
    } else if (selected.length < 2) {
      setSelected((prev) => [...prev, entry]);
    }
  };

  const isSelected = (entry: WineEntry) => selected.some((e) => e.id === entry.id);
  const selectionIndex = (entry: WineEntry) => selected.findIndex((e) => e.id === entry.id);

  if (comparing && selected.length === 2) {
    return (
      <SafeAreaView style={styles.flex}>
        <View style={styles.topBar}>
          <Pressable onPress={() => setComparing(false)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
          <Text style={styles.topBarTitle}>Compare</Text>
          <View style={{ width: 60 }} />
        </View>
        <WineComparisonCard entryA={selected[0]} entryB={selected[1]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex}>
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
        <Text style={styles.topBarTitle}>Compare Wines</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instruction}>
        <Text style={styles.instructionText}>
          Select 2 wines to compare side by side
        </Text>
        <View style={styles.selectionSlots}>
          {[0, 1].map((i) => (
            <View key={i} style={[styles.slot, selected[i] && styles.slotFilled]}>
              {selected[i] ? (
                <Text style={styles.slotName} numberOfLines={1}>
                  {selected[i].producer || selected[i].name}
                </Text>
              ) : (
                <Text style={styles.slotEmpty}>Wine {i + 1}</Text>
              )}
            </View>
          ))}
        </View>
        {selected.length === 2 && (
          <Pressable style={styles.compareBtn} onPress={() => setComparing(true)}>
            <Text style={styles.compareBtnText}>Compare Now →</Text>
          </Pressable>
        )}
      </View>

      {/* Wine List */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, isWide && { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' }]}
        renderItem={({ item }) => {
          const idx = selectionIndex(item);
          const sel = idx !== -1;
          return (
            <Pressable
              style={[styles.listItem, sel && styles.listItemSelected]}
              onPress={() => toggleSelect(item)}
            >
              {/* Label photo thumbnail */}
              {item.label_photo_url ? (
                <Image
                  source={{ uri: item.label_photo_url }}
                  style={styles.thumbnail}
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Text style={styles.thumbnailEmoji}>🍷</Text>
                </View>
              )}

              <View style={styles.itemInfo}>
                <Text style={styles.itemProducer} numberOfLines={1}>
                  {item.producer || item.name || 'Untitled'}
                </Text>
                <Text style={styles.itemSub} numberOfLines={1}>
                  {[item.name, item.vintage].filter(Boolean).join(' · ')}
                </Text>
                <Text style={styles.itemOrigin} numberOfLines={1}>
                  {[item.region, item.country].filter(Boolean).join(', ')}
                </Text>
              </View>

              <View style={styles.itemRight}>
                {item.technical_score > 0 && (
                  <Text style={styles.itemScore}>{item.technical_score}</Text>
                )}
                {sel ? (
                  <View style={styles.selBadge}>
                    <Text style={styles.selBadgeText}>{idx + 1}</Text>
                  </View>
                ) : (
                  <View style={styles.unselCircle} />
                )}
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍷</Text>
            <Text style={styles.emptyText}>No wines logged yet.</Text>
            <Text style={styles.emptySubtext}>Add some entries to compare them.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.surface },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: { minWidth: 60 },
  backBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.gold,
  },
  topBarTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.ink,
  },

  // Instruction + slots
  instruction: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  instructionText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  selectionSlots: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  slot: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: Colors.gold,
    backgroundColor: Colors.goldPale,
  },
  slotName: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  slotEmpty: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  compareBtn: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  compareBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: Colors.gold,
    letterSpacing: 0.3,
  },

  // List
  list: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  listItemSelected: {
    borderColor: Colors.gold,
    borderWidth: 1.5,
    backgroundColor: Colors.goldPale,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmoji: { fontSize: 22 },
  itemInfo: { flex: 1, gap: 2 },
  itemProducer: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  itemSub: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMid,
  },
  itemOrigin: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  itemRight: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemScore: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 16,
    color: Colors.ink,
  },
  selBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.ink,
  },
  unselCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: Spacing.sm,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.ink,
  },
  emptySubtext: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.inkMuted,
  },
});
