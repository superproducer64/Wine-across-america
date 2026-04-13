import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { WineIdentityCard } from '@/components/wine/WineIdentityCard';
import { Button } from '@/components/ui/Button';
import { getWineEntry } from '@/lib/supabase';
import { useWineStore } from '@/stores/wineStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { WineEntry } from '@/types';
import { MainStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'WineDetail'>;

export function WineDetailScreen({ route, navigation }: Props) {
  const { entryId } = route.params;
  const [entry, setEntry] = useState<WineEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { removeEntry } = useWineStore();
  const { isSubscribed } = useSubscriptionStore();

  useEffect(() => {
    (async () => {
      const { data, error } = await getWineEntry(entryId);
      if (!error && data) {
        setEntry(data as WineEntry);
      }
      setLoading(false);
    })();
  }, [entryId]);

  const handleDelete = async () => {
    setDeleting(true);
    await removeEntry(entryId);
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.gold} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Wine not found.</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav Bar */}
      <View style={styles.navbar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹ Back</Text>
        </Pressable>
        {confirmDelete ? (
          <View style={styles.deleteConfirmRow}>
            <Pressable onPress={() => setConfirmDelete(false)} style={styles.navBtn}>
              <Text style={styles.navBtnText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleDelete} disabled={deleting} style={styles.navBtn}>
              <Text style={styles.deleteText}>{deleting ? 'Deleting…' : 'Confirm Delete'}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setConfirmDelete(true)} style={styles.navBtn}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Date & location meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {new Date(entry.tasting_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          {entry.location_name ? (
            <Text style={styles.metaText}>📍 {entry.location_name}</Text>
          ) : null}
        </View>

        {/* Free-form notes */}
        {entry.free_notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>Tasting Notes</Text>
            <Text style={styles.notesText}>{entry.free_notes}</Text>
          </View>
        ) : null}

        {/* Wine Identity Card */}
        <WineIdentityCard
          entry={entry}
          showSignatureScore={isSubscribed}
        />

        {/* Price info */}
        {entry.price.length > 0 && (
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>Price Paid</Text>
            {entry.price.map((p, i) => (
              <Text key={i} style={styles.priceValue}>
                {p.currency} {p.amount.toFixed(2)}
                {p.location ? ` · ${p.location}` : ''}
              </Text>
            ))}
          </View>
        )}

        {/* Grapes */}
        {entry.grapes.length > 0 && (
          <View style={styles.grapesBlock}>
            <Text style={styles.grapesLabel}>Grape Varieties</Text>
            <Text style={styles.grapesValue}>{entry.grapes.join(', ')}</Text>
          </View>
        )}

        <View style={{ height: Spacing.huge }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  deleteConfirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
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
    gap: Spacing.lg,
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  notesBlock: {
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  notesLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 6,
  },
  notesText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 14,
    color: Colors.inkMid,
    lineHeight: 21,
  },
  priceBlock: {
    gap: 4,
  },
  priceLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  priceValue: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.ink,
  },
  grapesBlock: {
    gap: 4,
  },
  grapesLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  grapesValue: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMid,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.xl,
  },
  errorText: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.inkMuted,
  },
});
