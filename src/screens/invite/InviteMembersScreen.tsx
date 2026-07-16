import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { useResponsive, SIDEBAR_WIDTH, MAX_CONTENT_WIDTH } from '@/hooks/useResponsive';
import { Button } from '@/components/ui/Button';
import { createInvite } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { MainStackParamList } from '@/navigation/types';

function buildInviteMessage(inviterName: string | null, code: string): string {
  const who = inviterName ? `${inviterName} has` : 'You’ve been';
  return (
    `${who} invited you to Pour Across America — a wine tasting journal. ` +
    `Join with this link: pouracrossamerica://invite/${code}`
  );
}

export function InviteMembersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isWide } = useResponsive();
  const { user, profile } = useAuthStore();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyToast, setCopyToast] = useState('');

  const handleGenerateAndShare = async () => {
    if (!user) return;
    setError('');
    setLoading(true);

    let inviteCode = code;
    if (!inviteCode) {
      const { code: newCode, error: createError } = await createInvite(user.id);
      setLoading(false);
      if (createError || !newCode) {
        setError(createError ?? 'Could not create an invite. Please try again.');
        return;
      }
      inviteCode = newCode;
      setCode(newCode);
    } else {
      setLoading(false);
    }

    const message = buildInviteMessage(profile?.display_name ?? null, inviteCode);

    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({ title: 'Join Pour Across America', text: message });
        } catch {
          // user cancelled — do nothing
        }
      } else {
        try {
          await navigator.clipboard.writeText(message);
          setCopyToast('Copied to clipboard!');
          setTimeout(() => setCopyToast(''), 3000);
        } catch {
          setCopyToast('Could not copy — please copy manually.');
          setTimeout(() => setCopyToast(''), 3000);
        }
      }
    } else {
      try {
        await Share.share({ message });
      } catch {
        // user cancelled — do nothing
      }
    }
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

          <Text style={styles.trophy}>✉️</Text>
          <Text style={styles.title}>Invite Members</Text>
          <Text style={styles.subtitle}>
            Share a personal invite link with friends. When they join, it's attributed to you.
          </Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {copyToast ? (
            <View style={styles.toastBanner}>
              <Text style={styles.toastText}>{copyToast}</Text>
            </View>
          ) : null}

          {code ? (
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>Your invite code</Text>
              <Text style={styles.codeValue}>{code}</Text>
            </View>
          ) : null}

          <Button
            label={code ? 'Share Again' : 'Generate Invite Link'}
            onPress={handleGenerateAndShare}
            loading={loading}
            style={styles.submitBtn}
          />
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
  trophy: {
    fontSize: 36,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 28,
    color: Colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMuted,
    lineHeight: 20,
    marginBottom: Spacing.sm,
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
  toastBanner: {
    backgroundColor: 'rgba(40,167,69,0.1)',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  toastText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: '#28a745',
    textAlign: 'center',
  },
  codeCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 6,
  },
  codeLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  codeValue: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 26,
    letterSpacing: 3,
    color: Colors.gold,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
});
