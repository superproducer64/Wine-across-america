import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
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

const STEPS = [
  { component: Step1Basics, label: 'Basics' },
  { component: Step2StructureWheel, label: 'Structure' },
  { component: Step3Aromas, label: 'Aromas' },
  { component: Step4TechnicalScore, label: 'Score' },
  { component: Step5NotesAndTerroir, label: 'Finish' },
];

export function WineEntryScreen(_props: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { draft, reset } = useEntryDraftStore();
  const { user } = useAuthStore();
  const { addEntry } = useWineStore();

  const StepComponent = STEPS[step].component;
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (step === 0 && !draft.name.trim()) {
      Alert.alert('Wine name required', 'Please enter at least the wine name before continuing.');
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      Alert.alert('Discard entry?', 'Your progress will be lost.', [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            reset();
            navigation.goBack();
          },
        },
      ]);
      return;
    }
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const entry = await addEntry(user.id, draft);
    setSubmitting(false);
    if (entry) {
      reset();
      Alert.alert('Saved!', `${entry.name || 'Your wine'} has been logged.`, [
        { text: 'View Entry', onPress: () => navigation.navigate('WineDetail', { entryId: entry.id }) },
        { text: 'Log Another', onPress: () => reset() },
      ]);
    } else {
      Alert.alert('Error', 'Failed to save wine entry. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
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

      {/* Step content */}
      <View style={styles.stepContainer}>
        <StepComponent />
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
});
