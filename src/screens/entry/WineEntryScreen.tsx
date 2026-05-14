import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { useResponsive, SIDEBAR_WIDTH } from '@/hooks/useResponsive';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { Button } from '@/components/ui/Button';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Step1Basics } from './steps/Step1Basics';
import { Step2StructureWheel } from './steps/Step2StructureWheel';
import { Step3Aromas } from './steps/Step3Aromas';
import { Step4TechnicalScore } from './steps/Step4TechnicalScore';
import { Step5NotesAndTerroir } from './steps/Step5NotesAndTerroir';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { useAuthStore } from '@/stores/authStore';
import { useWineStore } from '@/stores/wineStore';
import { MainStackParamList } from '@/navigation/types';

type Props = Record<string, never>;

const BASE_STEPS = [
  { component: Step1Basics, label: 'Basics' },
  { component: Step3Aromas, label: 'Aromas' },
  { component: Step2StructureWheel, label: 'Structure' },
  { component: Step4TechnicalScore, label: 'Score' },
  { component: Step5NotesAndTerroir, label: 'Finish' },
];

export function WineEntryScreen(_props: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmBlend, setConfirmBlend] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const { draft, reset } = useEntryDraftStore();
  const { user, profile } = useAuthStore();
  const { addEntry, lastSaveError } = useWineStore();

  const isSommelier = profile?.user_role === 'sommelier' && profile?.sommelier_status === 'approved';
  const STEPS = BASE_STEPS;

  const StepComponent = STEPS[step].component;
  const isLast = step === STEPS.length - 1;
  const { isWide } = useResponsive();

  const handleNext = () => {
    setError('');
    if (step === 0 && !draft.name.trim()) {
      setError('Please enter at least the wine name before continuing.');
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    if (step === 0) {
      setConfirmDiscard(true);
      return;
    }
    setStep((s) => s - 1);
  };

  const handleDiscard = () => {
    reset();
    navigation.goBack();
  };

  const doSubmit = async () => {
    if (!user) return;
    setError('');
    setSubmitting(true);
    const entry = await addEntry(user.id, draft);
    setSubmitting(false);
    if (entry) {
      reset();
      setSavedEntryId(entry.id);
    } else {
      setConfirmBlend(false);
      setError(lastSaveError ? `Save failed: ${lastSaveError}` : 'Failed to save wine entry. Please try again.');
    }
  };

  const handleSubmit = () => {
    const blends = draft.grape_blends ?? [];
    const hasAnyPct = blends.some((e) => e.percentage !== null);
    if (hasAnyPct) {
      const total = blends.reduce((sum, e) => sum + (e.percentage ?? 0), 0);
      if (total !== 100) {
        setConfirmBlend(true);
        return;
      }
    }
    doSubmit();
  };

  // Success state
  if (savedEntryId) {
    return (
      <SafeAreaView style={[styles.safe, isWide && { paddingLeft: SIDEBAR_WIDTH }]}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🍷</Text>
          <Text style={styles.successTitle}>Wine Logged!</Text>
          <Text style={styles.successSub}>{draft.name || 'Your wine'} has been saved.</Text>
          <View style={styles.successActions}>
            <Button
              label="View Entry"
              onPress={() => navigation.navigate('WineDetail', { entryId: savedEntryId })}
              style={styles.successBtn}
            />
            <Button
              label="Log Another"
              onPress={() => { reset(); setSavedEntryId(null); setStep(0); }}
              variant="secondary"
              style={styles.successBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Discard confirmation state
  if (confirmDiscard) {
    return (
      <SafeAreaView style={[styles.safe, isWide && { paddingLeft: SIDEBAR_WIDTH }]}>
        <View style={styles.confirmContainer}>
          <Text style={styles.confirmTitle}>Discard entry?</Text>
          <Text style={styles.confirmSub}>Your progress will be lost.</Text>
          <View style={styles.confirmActions}>
            <Button
              label="Keep Editing"
              onPress={() => setConfirmDiscard(false)}
              style={styles.confirmBtn}
            />
            <Button
              label="Discard"
              onPress={handleDiscard}
              variant="destructive"
              style={styles.confirmBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Blend confirmation state
  if (confirmBlend) {
    const blends = draft.grape_blends ?? [];
    const total = blends.reduce((sum, e) => sum + (e.percentage ?? 0), 0);
    return (
      <SafeAreaView style={[styles.safe, isWide && { paddingLeft: SIDEBAR_WIDTH }]}>
        <View style={styles.confirmContainer}>
          <Text style={styles.confirmTitle}>Incomplete blend</Text>
          <Text style={styles.confirmSub}>
            Your grape blend adds up to {total}% — not 100%. Would you like to go back and fix it, or save as-is?
          </Text>
          <View style={styles.confirmActions}>
            <Button
              label="Go Back & Fix"
              onPress={() => setConfirmBlend(false)}
              style={styles.confirmBtn}
            />
            <Button
              label={`Save Anyway (${total}%)`}
              onPress={() => doSubmit()}
              loading={submitting}
              variant="secondary"
              style={styles.confirmBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, isWide && { paddingLeft: SIDEBAR_WIDTH }]}>
      <ResponsiveContainer style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>{step === 0 ? '✕' : '‹'}</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerStep}>
              Step {step + 1} of {STEPS.length}
            </Text>
            <Text style={styles.headerLabel}>{STEPS[step].label}</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        {/* Progress */}
        <ProgressDots total={STEPS.length} current={step} />

        {error ? (
          <Text style={styles.errorBanner}>{error}</Text>
        ) : null}

        {/* Step content */}
        <View style={styles.stepContainer}>
          {step === STEPS.length - 1
            ? <Step5NotesAndTerroir isSommelier={isSommelier} />
            : <StepComponent />}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {isLast ? (
            <Button
              label="Save Wine Entry"
              onPress={handleSubmit}
              loading={submitting}
              size="lg"
              style={styles.fullBtn}
            />
          ) : (
            <Button
              label="Continue →"
              onPress={handleNext}
              size="lg"
              style={styles.fullBtn}
            />
          )}
        </View>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 22,
    color: Colors.inkMid,
    fontFamily: Fonts.dmSans,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerStep: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerLabel: {
    fontFamily: Fonts.playfair,
    fontSize: 16,
    color: Colors.ink,
  },
  errorBanner: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.red,
    backgroundColor: 'rgba(220,53,69,0.08)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  fullBtn: {
    width: '100%',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.lg,
  },
  successEmoji: { fontSize: 56 },
  successTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 28,
    color: Colors.ink,
  },
  successSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 15,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  successActions: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  successBtn: { width: '100%' },
  confirmContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.lg,
  },
  confirmTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 24,
    color: Colors.ink,
  },
  confirmSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  confirmActions: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  confirmBtn: { width: '100%' },
});
