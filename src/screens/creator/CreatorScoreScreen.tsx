import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TextInput as RNTextInput,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { MainStackParamList } from '@/navigation/types';
import {
  CreatorScoreDraft,
  makeDefaultCreatorScoreDraft,
  CREATOR_CATEGORIES,
} from '@/types';
import {
  createCreatorScore,
  updateCreatorScore,
  getCreatorScore,
} from '@/lib/supabase';

type Props = NativeStackScreenProps<MainStackParamList, 'CreatorScore'>;

export function CreatorScoreScreen({ route, navigation }: Props) {
  const { scoreId } = route.params ?? {};
  const isEditing = Boolean(scoreId);

  const [draft, setDraft] = useState<CreatorScoreDraft>(makeDefaultCreatorScoreDraft());
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const total =
    draft.sense_of_place +
    draft.story_authenticity +
    draft.farming_practices +
    draft.structure_balance +
    draft.overall_enjoyment;

  useEffect(() => {
    if (!scoreId) return;
    getCreatorScore(scoreId).then(({ data, error }) => {
      if (error || !data) {
        Alert.alert('Error', 'Could not load score.');
        navigation.goBack();
        return;
      }
      setDraft({
        entry_name: data.entry_name,
        producer: data.producer,
        style: data.style,
        region: data.region,
        sense_of_place: data.sense_of_place,
        story_authenticity: data.story_authenticity,
        farming_practices: data.farming_practices,
        structure_balance: data.structure_balance,
        overall_enjoyment: data.overall_enjoyment,
        editorial_note: data.editorial_note,
        is_published: data.is_published,
      });
      setLoading(false);
    });
  }, [scoreId]);

  const setField = (update: Partial<CreatorScoreDraft>) =>
    setDraft((prev) => ({ ...prev, ...update }));

  const handleSave = async () => {
    if (!draft.entry_name.trim()) {
      Alert.alert('Required', 'Please enter the cheese name.');
      return;
    }
    setSaving(true);
    try {
      if (isEditing && scoreId) {
        const { error } = await updateCreatorScore(scoreId, draft);
        if (error) throw error;
      } else {
        const { error } = await createCreatorScore(draft);
        if (error) throw error;
      }
      navigation.goBack();
    } catch (e: unknown) {
      const err = e as { message?: string };
      Alert.alert('Save failed', err.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const tierLabel =
    total >= 90 ? 'Exceptional' :
    total >= 80 ? 'Distinguished' :
    total >= 70 ? 'Noteworthy' :
    total >= 60 ? 'Sound' : 'Developing';

  const tierColor =
    total >= 90 ? Colors.gold :
    total >= 80 ? Colors.green :
    total >= 70 ? Colors.blue :
    Colors.inkMuted;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Score' : 'New Score'}
          </Text>
          <Pressable style={styles.headerBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.gold} size="small" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Identification */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cheese</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Name *</Text>
              <RNTextInput
                style={styles.input}
                value={draft.entry_name}
                onChangeText={(v) => setField({ entry_name: v })}
                placeholder="e.g., Jasper Hill Harbison"
                placeholderTextColor={Colors.inkFaint}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Producer / Creamery</Text>
              <RNTextInput
                style={styles.input}
                value={draft.producer}
                onChangeText={(v) => setField({ producer: v })}
                placeholder="e.g., Jasper Hill Farm"
                placeholderTextColor={Colors.inkFaint}
              />
            </View>

            <View style={styles.fieldRow}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Style</Text>
                <RNTextInput
                  style={styles.input}
                  value={draft.style}
                  onChangeText={(v) => setField({ style: v })}
                  placeholder="bloomy, alpine…"
                  placeholderTextColor={Colors.inkFaint}
                  autoCapitalize="none"
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Region</Text>
                <RNTextInput
                  style={styles.input}
                  value={draft.region}
                  onChangeText={(v) => setField({ region: v })}
                  placeholder="Vermont…"
                  placeholderTextColor={Colors.inkFaint}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Live score card */}
          <View style={styles.scoreCard}>
            <View>
              <Text style={styles.scoreLabelText}>Signature Score</Text>
              <Text style={[styles.scoreTierText, { color: tierColor }]}>{tierLabel}</Text>
            </View>
            <View style={styles.scoreNumRow}>
              <Text style={styles.scoreNum}>{total}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
          </View>

          {/* Category sliders */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Signature Categories</Text>
            {CREATOR_CATEGORIES.map((cat) => (
              <View key={cat.key} style={styles.catRow}>
                <View style={styles.catHeader}>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>{draft[cat.key]}</Text>
                  </View>
                </View>
                <Text style={styles.catDesc}>{cat.description}</Text>
                <ScoreSlider
                  label=""
                  value={draft[cat.key]}
                  min={0}
                  max={20}
                  step={1}
                  onChange={(v) => setField({ [cat.key]: v })}
                  accentColor={Colors.gold}
                />
              </View>
            ))}
          </View>

          {/* Editorial note */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Editorial Note</Text>
            <RNTextInput
              style={styles.textarea}
              value={draft.editorial_note}
              onChangeText={(v) => setField({ editorial_note: v })}
              placeholder="Share what makes this cheese exceptional…"
              placeholderTextColor={Colors.inkFaint}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Publish toggle */}
          <View style={styles.publishRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.publishLabel}>Publish</Text>
              <Text style={styles.publishSub}>
                Published scores are visible to all subscribers.
              </Text>
            </View>
            <Switch
              value={draft.is_published}
              onValueChange={(v) => setField({ is_published: v })}
              trackColor={{ false: Colors.border, true: Colors.gold }}
              thumbColor={draft.is_published ? Colors.ink : Colors.inkFaint}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerBtn: { width: 60 },
  headerTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 17,
    color: Colors.ink,
  },
  cancelText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.inkMuted,
  },
  saveText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: Colors.gold,
    textAlign: 'right',
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 4,
  },
  field: {
    gap: 4,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: Colors.inkFaint,
  },
  input: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  scoreCard: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreLabelText: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 3,
  },
  scoreTierText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 15,
  },
  scoreNumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  scoreNum: {
    fontFamily: Fonts.playfair,
    fontSize: 48,
    color: Colors.gold,
    lineHeight: 52,
  },
  scoreMax: {
    fontFamily: Fonts.dmSans,
    fontSize: 16,
    color: 'rgba(255,255,255,0.35)',
    paddingBottom: 6,
  },
  catRow: {
    marginBottom: Spacing.sm,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  catLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  catBadge: {
    minWidth: 30,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.goldPale,
    borderWidth: 0.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  catBadgeText: {
    fontFamily: Fonts.playfair,
    fontSize: 12,
    color: Colors.gold,
    lineHeight: 16,
  },
  catDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
    marginBottom: 8,
  },
  textarea: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 120,
    lineHeight: 22,
  },
  publishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  publishLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 2,
  },
  publishSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
  },
});
