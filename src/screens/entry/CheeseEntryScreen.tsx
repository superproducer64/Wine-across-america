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
import { Colors, Fonts, Spacing } from '@/theme';
import { Button } from '@/components/ui/Button';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Step1Basics } from './steps/Step1Basics';
import { Step2StructureWheel } from './steps/Step2StructureWheel';
import { Step3TechnicalScore } from './steps/Step3TechnicalScore';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { useAuthStore } from '@/stores/authStore';
import { useCheeseStore } from '@/stores/cheeseStore';
import { MainStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<MainStackParamList>;

const STEPS = [
  { component: Step1Basics,        label: 'Basics'    },
  { component: Step2StructureWheel, label: 'Structure' },
  { component: Step3TechnicalScore, label: 'Score'     },
];

export function CheeseEntryScreen() {
  const navigation = useNavigation<NavProp>();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const { draft, scores, terroir, terroirEnabled, reset } = useEntryDraftStore();
  const { user } = useAuthStore();
  const { addEntry, addScore, saveTerroirRecord } = useCheeseStore();

  const StepComponent = STEPS[step].component;
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (step === 0 && !draft.name.trim()) {
      Alert.alert('Cheese name required', 'Please enter the cheese name before continuing.');
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
          onPress: () => { reset(); navigation.goBack(); },
        },
      ]);
      return;
    }
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    // Step 1: save the cheese entry
    const entry = await addEntry(user.id, draft);
    if (!entry) {
      setSubmitting(false);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
      return;
    }

    // Step 2: save scores linked to the entry
    await addScore(user.id, entry.id, scores);

    // Step 3: save terroir if enabled
    if (terroirEnabled && (terroir.pasture_soil || terroir.climate || terroir.milk_season)) {
      await saveTerroirRecord(user.id, entry.id, terroir);
    }

    setSubmitting(false);
    reset();
    Alert.alert(
      'Saved!',
      `${entry.name} has been logged with scores.`,
      [
        {
          text: 'View Entry',
          onPress: () => navigation.navigate('CheeseDetail', { entryId: entry.id }),
        },
        { text: 'Log Another', onPress: () => reset() },
      ]
    );
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

      <ProgressDots total={STEPS.length} current={step} />

      <View style={styles.stepContainer}>
        <StepComponent />
      </View>

      <View style={styles.footer}>
        {isLast ? (
          <Button
            label="Save Cheese Entry"
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
  safe: { flex: 1, backgroundColor: Colors.surface },
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
  headerCenter: { flex: 1, alignItems: 'center' },
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
  stepContainer: { flex: 1 },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  fullBtn: { width: '100%' },
});
