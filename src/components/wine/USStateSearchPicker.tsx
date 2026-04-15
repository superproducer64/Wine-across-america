import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Colors, Fonts, Spacing, Radius } from '@/theme';

const ALL_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
  'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

interface Props {
  selected: string;
  onSelect: (state: string) => void;
}

export function USStateSearchPicker({ selected, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_STATES;
    return ALL_STATES.filter((s) => s.toLowerCase().startsWith(q));
  }, [query]);

  const handleSelect = (state: string) => {
    onSelect(state);
    setQuery('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      {/* Search box */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Type a letter to filter states…"
          placeholderTextColor={Colors.inkMuted}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={() => {
            if (filtered.length === 1) handleSelect(filtered[0]);
          }}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} style={styles.clearBtn} hitSlop={8}>
            <Text style={styles.clearBtnText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Selected badge */}
      {selected ? (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>📍 {selected}</Text>
          <Pressable onPress={() => handleSelect('')} hitSlop={8}>
            <Text style={styles.selectedClear}>✕</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Scrollable state list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isSelected = item === selected;
          return (
            <Pressable
              style={[styles.stateBtn, isSelected && styles.stateBtnSelected]}
              onPress={() => handleSelect(item)}
            >
              <Text style={[styles.stateBtnText, isSelected && styles.stateBtnTextSelected]}>
                {item}
              </Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No states match "{query}"</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchIcon: { fontSize: 14 },
  input: {
    flex: 1,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.ink,
    paddingVertical: 0,
  },
  clearBtn: { padding: 2 },
  clearBtnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMuted,
  },

  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
  },
  selectedBadgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.ink,
  },
  selectedClear: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 11,
    color: Colors.inkMuted,
  },

  list: {
    maxHeight: 240,
  },
  row: {
    gap: 6,
    marginBottom: 6,
  },
  stateBtn: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
  },
  stateBtnSelected: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  stateBtnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.ink,
    textAlign: 'center',
  },
  stateBtnTextSelected: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.ink,
  },
  empty: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});
