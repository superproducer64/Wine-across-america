import React, { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { useResponsive, SIDEBAR_WIDTH, MAX_CONTENT_WIDTH } from '@/hooks/useResponsive';
import { fetchInboxMessages, fetchSentMessages, InboxMessage, SentMessage } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { MainStackParamList } from '@/navigation/types';

type Tab = 'received' | 'sent';

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function Avatar({ name, url }: { name: string | null; url: string | null }) {
  const [imageError, setImageError] = useState(false);
  const initials = (name ?? '?').charAt(0).toUpperCase();
  return url && !imageError ? (
    <Image source={{ uri: url }} style={styles.avatar} onError={() => setImageError(true)} />
  ) : (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function ReceivedRow({ message, onPress }: { message: InboxMessage; onPress: () => void }) {
  const unread = !message.read;
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Avatar name={message.sender_display_name} url={message.sender_avatar_url} />
      <View style={styles.rowMeta}>
        <View style={styles.rowTop}>
          <View style={styles.nameRow}>
            {unread && <View style={styles.unreadDot} />}
            <Text style={[styles.rowName, unread && styles.rowNameUnread]}>
              {message.sender_display_name ?? 'Unnamed member'}
            </Text>
          </View>
          <Text style={styles.rowTime}>{formatTimestamp(message.created_at)}</Text>
        </View>
        <Text
          style={[styles.rowPreview, unread && styles.rowPreviewUnread]}
          numberOfLines={2}
        >
          {message.content}
        </Text>
      </View>
    </Pressable>
  );
}

function SentRow({ message }: { message: SentMessage }) {
  return (
    <View style={styles.row}>
      <Avatar name={message.recipient_display_name} url={message.recipient_avatar_url} />
      <View style={styles.rowMeta}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName}>
            To {message.recipient_display_name ?? 'Unnamed member'}
          </Text>
          <Text style={styles.rowTime}>{formatTimestamp(message.created_at)}</Text>
        </View>
        <Text style={styles.rowPreview} numberOfLines={2}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export function InboxScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isWide } = useResponsive();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('received');
  const [received, setReceived] = useState<InboxMessage[]>([]);
  const [sent, setSent] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    if (tab === 'received') {
      const { data, error: fetchError } = await fetchInboxMessages(user.id);
      if (fetchError) setError(fetchError);
      else setReceived(data ?? []);
    } else {
      const { data, error: fetchError } = await fetchSentMessages(user.id);
      if (fetchError) setError(fetchError);
      else setSent(data ?? []);
    }
    setLoading(false);
  }, [user, tab]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const list = tab === 'received' ? received : sent;

  return (
    <SafeAreaView style={[styles.safe, isWide && { paddingLeft: SIDEBAR_WIDTH }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={isWide ? { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' } : undefined}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Messages</Text>

          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tabBtn, tab === 'received' && styles.tabBtnActive]}
              onPress={() => setTab('received')}
            >
              <Text style={[styles.tabLabel, tab === 'received' && styles.tabLabelActive]}>
                Received
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, tab === 'sent' && styles.tabBtnActive]}
              onPress={() => setTab('sent')}
            >
              <Text style={[styles.tabLabel, tab === 'sent' && styles.tabLabelActive]}>
                Sent
              </Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Loading messages…</Text>
            </View>
          ) : list.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✉️</Text>
              <Text style={styles.emptyTitle}>
                {tab === 'received' ? 'No messages yet' : 'No sent messages'}
              </Text>
              <Text style={styles.emptyText}>
                {tab === 'received'
                  ? 'Messages from other members will show up here.'
                  : 'Messages you send to other members will show up here.'}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {tab === 'received'
                ? received.map((m) => (
                    <ReceivedRow
                      key={m.id}
                      message={m}
                      onPress={() => navigation.navigate('MessageDetail', { message: m })}
                    />
                  ))
                : sent.map((m) => <SentRow key={m.id} message={m} />)}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  backBtn: { paddingVertical: Spacing.xs },
  backText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.gold,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 28,
    color: Colors.ink,
    marginBottom: 4,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  tabBtnActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  tabLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  tabLabelActive: {
    color: Colors.ink,
  },
  errorBanner: {
    backgroundColor: 'rgba(139,46,46,0.08)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.red,
  },
  errorText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.red,
    lineHeight: 18,
  },
  emptyState: {
    paddingVertical: Spacing.huge,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 20,
    color: Colors.ink,
  },
  emptyText: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  list: { gap: Spacing.md },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.playfair,
    fontSize: 18,
    color: Colors.ink,
  },
  rowMeta: { flex: 1, gap: 3 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  rowName: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.ink,
  },
  rowNameUnread: {
    fontFamily: Fonts.dmSansMedium,
  },
  rowTime: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  rowPreview: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    lineHeight: 18,
  },
  rowPreviewUnread: {
    color: Colors.inkMid,
  },
});
