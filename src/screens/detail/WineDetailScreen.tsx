import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LABEL_PHOTO_PLACEHOLDER } from '@/utils/imagePlaceholder';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { useResponsive, MAX_CONTENT_WIDTH } from '@/hooks/useResponsive';
import { VivinoStyleCard } from '@/components/wine/VivinoStyleCard';
import { ProWineCard } from '@/components/wine/ProWineCard';
import { Button } from '@/components/ui/Button';
import { getWineEntry } from '@/lib/supabase';
import { useWineStore } from '@/stores/wineStore';
import { useAuthStore } from '@/stores/authStore';
import { ShareWithUserModal } from '@/components/wine/ShareWithUserModal';
import { WineEntry } from '@/types';
import { MainStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'WineDetail'>;

function buildShareText(entry: WineEntry): string {
  const lines: string[] = [];

  const vintage = entry.vintage ? ` ${entry.vintage}` : '';
  lines.push(`🍷 ${entry.name || 'Untitled Wine'}${vintage}`);

  if (entry.producer) lines.push(entry.producer);

  const origin = [entry.appellation, entry.region, entry.country]
    .filter(Boolean)
    .join(', ');
  if (origin) lines.push(origin);

  lines.push('');

  if (entry.technical_score) {
    lines.push(`Technical Score: ${entry.technical_score}/100`);
  }

  if (entry.aromas_l1.length > 0) {
    lines.push(`Aromas: ${entry.aromas_l1.join(', ')}`);
  }

  if (entry.grapes.length > 0) {
    lines.push(`Grapes: ${entry.grapes.join(', ')}`);
  }

  if (entry.free_notes) {
    lines.push('');
    lines.push(`"${entry.free_notes}"`);
  }

  lines.push('');

  if (entry.location_name) {
    lines.push(`📍 ${entry.location_name}`);
  }

  lines.push(
    `🗓 ${new Date(entry.tasting_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`
  );

  if (entry.want_another_glass) lines.push('🥂 Would have another glass');
  if (entry.want_to_buy) lines.push('🛒 Would buy a bottle');

  lines.push('');
  lines.push('Logged with Pour Across America');

  return lines.join('\n');
}

export function WineDetailScreen({ route, navigation }: Props) {
  const { entryId } = route.params;
  const { entries, removeEntry } = useWineStore();
  const { isWide } = useResponsive();
  const { user, profile } = useAuthStore();

  // Use cached store entry immediately — avoids a network round-trip on every open.
  // Only fall back to fetching if the entry isn't in the store (e.g. deep link).
  const cached = entries.find((e) => e.id === entryId) ?? null;
  const [entry, setEntry] = useState<WineEntry | null>(cached);
  const [loading, setLoading] = useState(cached === null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareToast, setShareToast] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (cached !== null) return; // already have it, skip the fetch
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

  const handleShare = async () => {
    if (!entry) return;
    const text = buildShareText(entry);
    const title = `${entry.name || 'Wine'}${entry.vintage ? ` ${entry.vintage}` : ''}`;

    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({ title, text });
        } catch {
          // user cancelled — do nothing
        }
      } else {
        try {
          await navigator.clipboard.writeText(text);
          setShareToast('Copied to clipboard!');
          setTimeout(() => setShareToast(''), 3000);
        } catch {
          setShareToast('Could not copy — please copy manually.');
          setTimeout(() => setShareToast(''), 3000);
        }
      }
    } else {
      try {
        await Share.share({ message: text, title });
      } catch {
        // user cancelled — do nothing
      }
    }
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

        <View style={styles.navRight}>
          {/* Share button */}
          {!confirmDelete && (
            <Pressable onPress={handleShare} style={styles.navBtn}>
              <Text style={styles.shareText}>Share</Text>
            </Pressable>
          )}

          {/* Delete flow */}
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
      </View>

      {/* Clipboard toast (web fallback) */}
      {shareToast !== '' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{shareToast}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, isWide && { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' }]}
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

        {/* Intelligence Card — radar chart layout */}
        <ProWineCard entry={entry} />

        {/* Original Wine Card */}
        <VivinoStyleCard entry={entry} />

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

        {/* Label photo */}
        {entry.label_photo_url ? (
          <View style={styles.labelPhotoBlock}>
            <Text style={styles.labelPhotoLabel}>Label Photo</Text>
            <Image
              source={{ uri: entry.label_photo_url }}
              style={styles.labelPhoto}
              contentFit="cover"
              cachePolicy="memory-disk"
              placeholder={{ uri: LABEL_PHOTO_PLACEHOLDER }}
              transition={200}
            />
          </View>
        ) : null}

        {/* Share buttons at bottom */}
        <View style={styles.shareButtons}>
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>⬆ Share via Text / Email</Text>
          </Pressable>
          <Pressable onPress={() => setShowShareModal(true)} style={[styles.shareButton, styles.shareButtonInApp]}>
            <Text style={[styles.shareButtonText, styles.shareButtonInAppText]}>🍷 Share with App Member</Text>
          </Pressable>
        </View>

        <View style={{ height: Spacing.huge }} />
      </ScrollView>

      {/* In-app share modal */}
      {user && (
        <ShareWithUserModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          entry={entry}
          senderId={user.id}
          senderName={profile?.display_name ?? profile?.email ?? 'A member'}
        />
      )}
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
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  shareText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.gold,
  },
  deleteText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.red,
  },
  toast: {
    backgroundColor: Colors.ink,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  toastText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.white,
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
  labelPhotoBlock: {
    marginTop: Spacing.xl,
  },
  labelPhotoLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: Spacing.sm,
  },
  labelPhoto: {
    width: '100%',
    height: 220,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
  },
  shareButtons: {
    gap: Spacing.sm,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  shareButtonInApp: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  shareButtonText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  shareButtonInAppText: {
    color: Colors.gold,
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
