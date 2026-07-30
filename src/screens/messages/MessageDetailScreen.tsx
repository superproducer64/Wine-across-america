import React, { useEffect, useState } from 'react';
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
import { markMessageRead } from '@/lib/supabase';
import { MainStackParamList } from '@/navigation/types';

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Read-only — this screen has no reply input or reply button by design.
// Direct messages in this app are intentionally one-directional.
export function MessageDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'MessageDetail'>>();
  const { message } = route.params;
  const { isWide } = useResponsive();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!message.read) {
      markMessageRead(message.id);
    }
  }, [message.id, message.read]);

  const initials = (message.sender_display_name ?? '?').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={[styles.safe, isWide && { paddingLeft: SIDEBAR_WIDTH }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={isWide ? { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' } : undefined}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          </View>

          <View style={styles.senderCard}>
            {message.sender_avatar_url && !imageError ? (
              <Image
                source={{ uri: message.sender_avatar_url }}
                style={styles.avatar}
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.senderMeta}>
              <Text style={styles.senderName}>
                {message.sender_display_name ?? 'Unnamed member'}
              </Text>
              <Text style={styles.timestamp}>{formatTimestamp(message.created_at)}</Text>
            </View>
          </View>

          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>{message.content}</Text>
          </View>
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
  senderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.playfair,
    fontSize: 20,
    color: Colors.ink,
  },
  senderMeta: { gap: 2 },
  senderName: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 18,
    color: Colors.ink,
  },
  timestamp: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  bodyCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  bodyText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.inkMid,
    lineHeight: 22,
  },
});
