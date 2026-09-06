import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { useResponsive, SIDEBAR_WIDTH, MAX_CONTENT_WIDTH } from '@/hooks/useResponsive';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import {
  DirectMessage,
  fetchConversationMessages,
  markConversationRead,
  sendMessage,
} from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { MainStackParamList } from '@/navigation/types';

const MAX_LENGTH = 2000;

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function MessageDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'MessageDetail'>>();
  const { otherUserId, otherDisplayName, otherAvatarUrl } = route.params;
  const { isWide } = useResponsive();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [imageError, setImageError] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await fetchConversationMessages(user.id, otherUserId);
    if (fetchError) setError(fetchError);
    else setMessages(data ?? []);
    setLoading(false);
    markConversationRead(user.id, otherUserId);
  }, [user, otherUserId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const trimmed = content.trim();
  const initials = (otherDisplayName ?? '?').charAt(0).toUpperCase();

  const handleSend = async () => {
    if (!user || !trimmed) return;
    setSending(true);
    setError('');
    const { error: sendError } = await sendMessage(user.id, otherUserId, trimmed);
    setSending(false);
    if (sendError) {
      setError(sendError);
      return;
    }
    setContent('');
    await load();
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={[styles.safe, isWide && { paddingLeft: SIDEBAR_WIDTH }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={[styles.inner, isWide && styles.innerWide]}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          </View>

          <View style={styles.senderCard}>
            {otherAvatarUrl && !imageError ? (
              <Image
                source={{ uri: otherAvatarUrl }}
                style={styles.avatar}
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <Text style={styles.senderName}>{otherDisplayName ?? 'Unnamed member'}</Text>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.thread}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {loading ? (
              <Text style={styles.emptyText}>Loading messages…</Text>
            ) : messages.length === 0 ? (
              <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
            ) : (
              messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <View key={m.id} style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
                    <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      {m.attachment_url ? (
                        <Image source={{ uri: m.attachment_url }} style={styles.bubbleImage} resizeMode="contain" />
                      ) : null}
                      {m.content ? (
                        <Text
                          style={[
                            styles.bubbleText,
                            mine && styles.bubbleTextMine,
                            m.attachment_url ? styles.bubbleTextWithImage : undefined,
                          ]}
                        >
                          {m.content}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
                      {formatTimestamp(m.created_at)}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={styles.composeRow}>
            <TextInput
              placeholder="Write a reply…"
              value={content}
              onChangeText={(t) => setContent(t.slice(0, MAX_LENGTH))}
              multiline
              maxLength={MAX_LENGTH}
              containerStyle={styles.inputContainer}
              style={styles.textArea}
            />
            <View style={styles.composeFooter}>
              <Text style={styles.counter}>
                {content.length} / {MAX_LENGTH}
              </Text>
              <Button
                label="Reply"
                onPress={handleSend}
                loading={sending}
                disabled={!trimmed}
                size="sm"
                style={styles.sendBtn}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  flex: { flex: 1 },
  inner: {
    flex: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  innerWide: {
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { paddingVertical: Spacing.xs },
  backText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.gold,
  },
  senderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.playfair,
    fontSize: 16,
    color: Colors.ink,
  },
  senderName: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 18,
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
  thread: {
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  emptyText: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  bubbleRow: {
    alignItems: 'flex-start',
    maxWidth: '82%',
  },
  bubbleRowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  bubbleTheirs: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  bubbleMine: {
    backgroundColor: Colors.gold,
  },
  bubbleText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.inkMid,
    lineHeight: 21,
  },
  bubbleTextMine: {
    color: Colors.ink,
  },
  bubbleImage: {
    width: 220,
    height: 300,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  bubbleTextWithImage: {
    marginTop: 8,
  },
  bubbleTime: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 3,
    marginHorizontal: 4,
  },
  bubbleTimeMine: {
    textAlign: 'right',
  },
  composeRow: {
    paddingTop: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  inputContainer: {
    marginBottom: 0,
  },
  textArea: {
    height: 80,
  },
  composeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  counter: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  sendBtn: {
    minWidth: 90,
  },
});
