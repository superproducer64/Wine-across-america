import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { useResponsive, SIDEBAR_WIDTH, MAX_CONTENT_WIDTH } from '@/hooks/useResponsive';
import { Button } from '@/components/ui/Button';
import {
  fetchPendingSommelierApplications,
  getSommelierCertSignedUrl,
  updateSommelierStatus,
} from '@/lib/supabase';
import { MainStackParamList } from '@/navigation/types';

type Application = {
  id: string;
  email: string;
  display_name: string | null;
  sommelier_cert_url: string | null;
  created_at: string;
};

type ApplicationRowProps = {
  app: Application;
  onDecision: (id: string, decision: 'approved' | 'rejected') => void;
  busy: boolean;
};

function ApplicationRow({ app, onDecision, busy }: ApplicationRowProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (app.sommelier_cert_url) {
      getSommelierCertSignedUrl(app.sommelier_cert_url).then(setSignedUrl);
    }
  }, [app.sommelier_cert_url]);

  const initials = (app.display_name ?? app.email ?? '?')[0].toUpperCase();
  const submittedDate = new Date(app.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.appCard}>
      <View style={styles.appHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.appMeta}>
          {app.display_name ? (
            <Text style={styles.appName}>{app.display_name}</Text>
          ) : null}
          <Text style={styles.appEmail}>{app.email}</Text>
          <Text style={styles.appDate}>Applied {submittedDate}</Text>
        </View>
      </View>

      {signedUrl && !imageError ? (
        <View style={styles.certImageContainer}>
          <Text style={styles.certLabel}>Certification Document</Text>
          <Image
            source={{ uri: signedUrl }}
            style={styles.certImage}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        </View>
      ) : app.sommelier_cert_url ? (
        <View style={styles.certImageContainer}>
          <Text style={styles.certLabel}>Certification Document</Text>
          <View style={styles.certImagePlaceholder}>
            <Text style={styles.certImagePlaceholderText}>
              {imageError ? 'Could not load image' : 'Loading…'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.certImageContainer}>
          <Text style={styles.certLabel}>Certification Document</Text>
          <View style={styles.certImagePlaceholder}>
            <Text style={styles.certImagePlaceholderText}>No certificate uploaded</Text>
          </View>
        </View>
      )}

      <View style={styles.appActions}>
        <Button
          label="Reject"
          onPress={() => onDecision(app.id, 'rejected')}
          variant="destructive"
          style={styles.actionBtn}
          loading={busy}
        />
        <Button
          label="Approve"
          onPress={() => onDecision(app.id, 'approved')}
          style={styles.actionBtn}
          loading={busy}
        />
      </View>
    </View>
  );
}

export function AdminScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isWide } = useResponsive();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await fetchPendingSommelierApplications();
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setApplications((data ?? []) as Application[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleDecision = async (userId: string, decision: 'approved' | 'rejected') => {
    setBusyId(userId);
    setSuccessMessage('');
    const { error: updateError } = await updateSommelierStatus(userId, decision);
    if (updateError) {
      setError(updateError);
    } else {
      const name =
        applications.find((a) => a.id === userId)?.display_name ??
        applications.find((a) => a.id === userId)?.email ??
        'Applicant';
      setSuccessMessage(
        decision === 'approved'
          ? `${name} has been approved as a Sommelier.`
          : `${name}'s application has been rejected.`
      );
      setApplications((prev) => prev.filter((a) => a.id !== userId));
    }
    setBusyId(null);
  };

  return (
    <SafeAreaView style={[styles.safe, isWide && { paddingLeft: SIDEBAR_WIDTH }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={
            isWide
              ? { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' }
              : undefined
          }
        >
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Sommelier Applications</Text>
          <Text style={styles.subtitle}>
            Review and approve or reject pending certification applications.
          </Text>

          {successMessage ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Loading applications…</Text>
            </View>
          ) : applications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎓</Text>
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text style={styles.emptyText}>No pending applications to review.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {applications.map((app) => (
                <ApplicationRow
                  key={app.id}
                  app={app}
                  onDecision={handleDecision}
                  busy={busyId === app.id}
                />
              ))}
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
  subtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMuted,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  successBanner: {
    backgroundColor: 'rgba(46,107,69,0.1)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.green,
  },
  successText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.green,
    lineHeight: 18,
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
  list: { gap: Spacing.lg },
  appCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
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
  appMeta: { flex: 1, gap: 2 },
  appName: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 16,
    color: Colors.ink,
  },
  appEmail: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  appDate: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkFaint,
    marginTop: 2,
  },
  certImageContainer: { gap: Spacing.sm },
  certLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  certImage: {
    width: '100%',
    height: 220,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  certImagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: Radius.md,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certImagePlaceholderText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  appActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionBtn: { flex: 1 },
});
