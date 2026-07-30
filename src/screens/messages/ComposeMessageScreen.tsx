import React, { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { useResponsive, SIDEBAR_WIDTH, MAX_CONTENT_WIDTH } from '@/hooks/useResponsive';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { sendMessage } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { MainStackParamList } from '@/navigation/types';

const MAX_LENGTH = 2000;

export function ComposeMessageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'ComposeMessage'>>();
  const { recipientId, recipientName, recipientAvatarUrl } = route.params;
  const { isWide } = useResponsive();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [imageError, setImageError] = useState(false);

  const trimmed = content.trim();
  const initials = (recipientName ?? '?').charAt(0).toUpperCase();

  const handleSend = async () => {
    if (!user || !trimmed) return;
    setLoading(true);
    setError('');
    const { error: sendError } = await sendMessage(user.id, recipientId, trimmed);
    setLoading(false);
    if (sendError) {
      setError(sendError);
      return;
    }
    setSent(true);
  };

  return (
    <SafeAreaView style={[styles.safe, isWide && { paddingLeft: SIDEBAR_WIDTH }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={isWide ? { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' } : undefined}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Message</Text>

          <View style={styles.recipientCard}>
            {recipientAvatarUrl && !imageError ? (
              <Image
                source={{ uri: recipientAvatarUrl }}
                style={styles.avatar}
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <Text style={styles.recipientName}>To {recipientName ?? 'Unnamed member'}</Text>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {sent ? (
            <View style={styles.sentCard}>
              <Text style={styles.sentIcon}>✉️</Text>
              <Text style={styles.sentTitle}>Message sent</Text>
              <Text style={styles.sentSub}>
                {recipientName ?? 'This member'} will see it in their inbox.
              </Text>
              <Button
                label="Done"
                onPress={() => navigation.goBack()}
                style={styles.doneBtn}
              />
            </View>
          ) : (
            <>
              <TextInput
                placeholder="Write your message…"
                value={content}
                onChangeText={(t) => setContent(t.slice(0, MAX_LENGTH))}
                multiline
                maxLength={MAX_LENGTH}
                containerStyle={styles.inputContainer}
                style={styles.textArea}
              />
              <Text style={styles.counter}>{content.length} / {MAX_LENGTH}</Text>

              <Button
                label="Send"
                onPress={handleSend}
                loading={loading}
                disabled={!trimmed}
                style={styles.submitBtn}
              />
            </>
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
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
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
  recipientName: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 15,
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
  inputContainer: {
    marginBottom: 0,
  },
  textArea: {
    height: 160,
  },
  counter: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    textAlign: 'right',
    marginTop: -Spacing.sm,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  sentCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 6,
  },
  sentIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  sentTitle: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 18,
    color: Colors.ink,
  },
  sentSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  doneBtn: {
    marginTop: Spacing.md,
    alignSelf: 'stretch',
  },
});
