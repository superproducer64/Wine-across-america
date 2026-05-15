import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput as RNTextInput,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { useEntryDraftStore } from '@/stores/entryDraftStore';
import { AROMA_CATEGORIES, WINE_SHORTCUTS, WineShortcut } from '@/types';

export function Step3Aromas() {
  const { draft, setAromas, setAromasOtherNote, applyWineShortcut } = useEntryDraftStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeShortcutId, setActiveShortcutId] = useState<string | null>(null);

  const toggleL1 = (id: string) => {
    const current = draft.aromas_l1;
    let next: string[];
    if (current.includes(id)) {
      next = current.filter((a) => a !== id);
      // Also remove all L2 aromas from this category
      const category = AROMA_CATEGORIES.find((c) => c.id === id);
      const l2Next = draft.aromas_l2.filter(
        (a) => !category?.subcategories.includes(a)
      );
      setAromas(next, l2Next);
      if (expandedCategory === id) setExpandedCategory(null);
      return;
    } else {
      next = [...current, id];
      setExpandedCategory(id);
    }
    setAromas(next, draft.aromas_l2);
    setActiveShortcutId(null);
  };

  const toggleL2 = (aroma: string) => {
    const current = draft.aromas_l2;
    if (current.includes(aroma)) {
      setAromas(draft.aromas_l1, current.filter((a) => a !== aroma));
    } else {
      setAromas(draft.aromas_l1, [...current, aroma]);
    }
    setActiveShortcutId(null);
  };

  const handleShortcut = (shortcut: WineShortcut) => {
    if (activeShortcutId === shortcut.id) {
      // Tap again to deselect — clear aromas and reset structure
      setAromas([], []);
      setActiveShortcutId(null);
    } else {
      applyWineShortcut(shortcut);
      setActiveShortcutId(shortcut.id);
      setExpandedCategory(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.stepTitle}>Aroma Profile</Text>
      <Text style={styles.intro}>
        Select the aromas you detect, or choose a style shortcut to auto-fill aromas and structure.
      </Text>

      {/* Style Shortcuts */}
      <Text style={styles.sectionLabel}>Style Shortcuts</Text>
      <Text style={styles.shortcutHint}>
        Tap a style to auto-fill aromas and structure sliders — you can adjust anything after.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shortcutScroll}>
        <View style={styles.shortcutRow}>
          {WINE_SHORTCUTS.map((shortcut) => {
            const active = activeShortcutId === shortcut.id;
            return (
              <Pressable
                key={shortcut.id}
                style={[styles.shortcutCard, active && styles.shortcutCardActive]}
                onPress={() => handleShortcut(shortcut)}
              >
                <Text style={styles.shortcutEmoji}>{shortcut.emoji}</Text>
                <Text style={[styles.shortcutName, active && styles.shortcutNameActive]} numberOfLines={2}>
                  {shortcut.name}
                </Text>
                <Text style={styles.shortcutStyle} numberOfLines={1}>
                  {shortcut.styleLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Layer 1 Categories */}
      <Text style={styles.sectionLabel}>Categories</Text>
      <View style={styles.categoriesGrid}>
        {AROMA_CATEGORIES.map((cat) => {
          const selected = draft.aromas_l1.includes(cat.id);
          const isExpanded = expandedCategory === cat.id;
          return (
            <View key={cat.id} style={styles.categoryBlock}>
              <Pressable
                style={[styles.catChip, selected && styles.catChipSelected]}
                onPress={() => toggleL1(cat.id)}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catLabel, selected && styles.catLabelSelected]}>
                  {cat.label}
                </Text>
              </Pressable>

              {/* Layer 2 drill-down */}
              {selected && isExpanded && (
                <View>
                  <View style={styles.l2Grid}>
                    {cat.subcategories.map((aroma) => (
                      <Pressable
                        key={aroma}
                        style={[
                          styles.l2Chip,
                          draft.aromas_l2.includes(aroma) && styles.l2ChipSelected,
                        ]}
                        onPress={() => toggleL2(aroma)}
                      >
                        <Text
                          style={[
                            styles.l2Text,
                            draft.aromas_l2.includes(aroma) && styles.l2TextSelected,
                          ]}
                        >
                          {aroma}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {cat.id === 'other' && (
                    <View style={styles.otherNoteWrapper}>
                      <Text style={styles.otherNoteLabel}>Describe other aromas</Text>
                      <RNTextInput
                        style={styles.otherNoteInput}
                        value={draft.aromas_other_note ?? ''}
                        onChangeText={setAromasOtherNote}
                        placeholder="e.g. wet slate, incense, beeswax…"
                        placeholderTextColor={Colors.inkFaint}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  )}
                </View>
              )}

              {selected && !isExpanded && (
                <Pressable onPress={() => setExpandedCategory(cat.id)}>
                  <Text style={styles.expandHint}>+ Specific notes</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      {/* Summary */}
      {draft.aromas_l1.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Selected</Text>
          <Text style={styles.summaryText}>
            {draft.aromas_l1
              .map((id) => {
                const cat = AROMA_CATEGORIES.find((c) => c.id === id);
                return cat ? `${cat.emoji} ${cat.label}` : id;
              })
              .join(' · ')}
          </Text>
          {draft.aromas_l2.length > 0 && (
            <Text style={styles.summaryL2}>
              {draft.aromas_l2.join(' · ')}
            </Text>
          )}
          {draft.aromas_other_note ? (
            <Text style={styles.summaryL2}>
              ✨ {draft.aromas_other_note}
            </Text>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  stepTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 22,
    color: Colors.ink,
    marginBottom: 6,
  },
  intro: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    marginBottom: Spacing.lg,
    lineHeight: 19,
  },
  sectionLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 8,
    marginTop: Spacing.md,
  },
  shortcutHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    marginBottom: Spacing.sm,
    lineHeight: 17,
  },
  shortcutScroll: {
    marginBottom: Spacing.md,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: Spacing.xl,
    paddingBottom: 4,
  },
  shortcutCard: {
    width: 120,
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  shortcutCardActive: {
    backgroundColor: Colors.goldPale,
    borderColor: Colors.gold,
  },
  shortcutEmoji: {
    fontSize: 22,
  },
  shortcutName: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.ink,
    lineHeight: 16,
  },
  shortcutNameActive: {
    color: Colors.ink,
  },
  shortcutStyle: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkMuted,
    lineHeight: 13,
  },
  categoriesGrid: {
    gap: 8,
  },
  categoryBlock: {
    gap: 6,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  catChipSelected: {
    backgroundColor: Colors.goldPale,
    borderColor: Colors.gold,
  },
  catEmoji: {
    fontSize: 16,
  },
  catLabel: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.inkMid,
  },
  catLabelSelected: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.inkMid,
  },
  l2Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingLeft: Spacing.xl,
    paddingBottom: 4,
  },
  l2Chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  l2ChipSelected: {
    backgroundColor: Colors.gold + '33',
    borderColor: Colors.gold,
  },
  l2Text: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  l2TextSelected: {
    color: Colors.inkMid,
    fontFamily: Fonts.dmSansRegular,
  },
  expandHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.gold,
    paddingLeft: Spacing.xl,
  },
  otherNoteWrapper: {
    paddingLeft: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: 6,
  },
  otherNoteLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  otherNoteInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.ink,
    minHeight: 80,
  },
  summary: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: 4,
  },
  summaryTitle: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
  },
  summaryText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.inkMid,
  },
  summaryL2: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: 'italic',
  },
});
