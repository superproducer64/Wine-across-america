import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { signUpWithEmail, uploadSommelierCert, submitSommelierApplication } from '@/lib/supabase';
import { AuthStackParamList } from '@/navigation/types';
import { SommelierCertUpload } from '@/components/auth/SommelierCertUpload';
import { UserRole } from '@/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<UserRole>('enthusiast');
  const [certDataUrl, setCertDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async () => {
    setError('');
    setSuccess('');
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (role === 'sommelier' && !certDataUrl) {
      setError('Please upload your Level 3 certification to apply as a Sommelier.');
      return;
    }

    setLoading(true);
    try {
      const data = await signUpWithEmail(email.trim(), password, name.trim(), role);

      if (role === 'sommelier' && certDataUrl && data.user) {
        const { url } = await uploadSommelierCert(data.user.id, certDataUrl);
        if (url) {
          await submitSommelierApplication(data.user.id, url);
        }
      }

      if (data.session) {
        // Auth listener navigates automatically
      } else {
        setSuccess(
          role === 'sommelier'
            ? 'Account created! Your certification is under review. Check your email for a confirmation link, then sign in.'
            : 'Account created! Check your email for a confirmation link, then sign in.'
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Start your wine intelligence journal
          </Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}
          {success ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{success}</Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.successLink}>Go to Sign In →</Text>
              </Pressable>
            </View>
          ) : null}

          <TextInput
            label="Your Name"
            value={name}
            onChangeText={setName}
            placeholder="Jane Smith"
            autoCapitalize="words"
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@example.com"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="8+ characters"
          />
          <TextInput
            label="Confirm Password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholder="Re-enter password"
          />

          {/* Role selector */}
          <View style={styles.roleSection}>
            <Text style={styles.roleTitle}>I am a</Text>
            <View style={styles.roleRow}>
              <Pressable
                style={[styles.rolePill, role === 'enthusiast' && styles.rolePillActive]}
                onPress={() => setRole('enthusiast')}
              >
                <Text style={styles.rolePillIcon}>🍷</Text>
                <Text style={[styles.rolePillLabel, role === 'enthusiast' && styles.rolePillLabelActive]}>
                  Wine Enthusiast
                </Text>
              </Pressable>
              <Pressable
                style={[styles.rolePill, role === 'sommelier' && styles.rolePillActive]}
                onPress={() => setRole('sommelier')}
              >
                <Text style={styles.rolePillIcon}>🎓</Text>
                <Text style={[styles.rolePillLabel, role === 'sommelier' && styles.rolePillLabelActive]}>
                  Sommelier
                </Text>
              </Pressable>
            </View>
            {role === 'enthusiast' && (
              <Text style={styles.roleDesc}>
                Log wines, track tastings, and build your personal cellar journal.
              </Text>
            )}
            {role === 'sommelier' && (
              <Text style={styles.roleDesc}>
                Unlock professional scoring fields including terroir analysis. Requires Level 3 certification from any recognized program.
              </Text>
            )}
          </View>

          {role === 'sommelier' && (
            <SommelierCertUpload
              onCertSelected={setCertDataUrl}
              certDataUrl={certDataUrl}
              uploading={loading}
            />
          )}

          <Button
            label={role === 'sommelier' ? 'Create Account & Apply' : 'Create Account'}
            onPress={handleSignup}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.footerLink}>Sign in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.ink },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.xxxl,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  trophy: {
    fontSize: 40,
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 26,
    color: Colors.gold,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: 4,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  errorBanner: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.red,
    backgroundColor: 'rgba(220,53,69,0.1)',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: 'rgba(40,167,69,0.1)',
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 8,
    alignItems: 'center',
  },
  successText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: '#28a745',
    textAlign: 'center',
  },
  successLink: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.gold,
  },
  roleSection: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  roleTitle: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.inkMid,
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rolePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  rolePillActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(196,132,122,0.12)',
  },
  rolePillIcon: {
    fontSize: 16,
  },
  rolePillLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    flex: 1,
  },
  rolePillLabelActive: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.gold,
  },
  roleDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  footerText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  footerLink: {
    color: Colors.gold,
    fontFamily: Fonts.dmSansRegular,
  },
});
