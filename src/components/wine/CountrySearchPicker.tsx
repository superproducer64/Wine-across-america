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
import { COUNTRIES_AND_REGIONS } from '@/types';

const ALL_COUNTRIES = Object.keys(COUNTRIES_AND_REGIONS).sort();

interface Props {
  selected: string;
  onSelect: (country: string) => void;
}

export function CountrySearchPicker({ selected, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_COUNTRIES.filter((c) => c.toLowerCase().startsWith(q));
  }, [query]);

  const handleSelect = (country: string) => {
    onSelect(country);
    setQuery('');
    setOpen(false);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    onSelect('');
    setQuery('');
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Country already chosen ───────────────────────────────────────────────────
  if (selected && !open) {
    return (
      <View style={styles.chosenRow}>
        <Text style={styles.chosenIcon}>🌍</Text>
        <Text style={styles.chosenName}>{selected}</Text>
        <Pressable onPress={handleClear} style={styles.changeBtn} hitSlop={8}>
          <Text style={styles.changeBtnText}>Change</Text>
        </Pressable>
      </View>
    );
  }

  // ── Search ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Type to search countries…"
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

      {/* Results */}
      {filtered.length > 0 && (
        <View style={styles.resultList}>
          {filtered.map((country, index) => (
            <Pressable
              key={country}
              style={[
                styles.resultRow,
                index < filtered.length - 1 && styles.resultRowBorder,
              ]}
              onPress={() => handleSelect(country)}
            >
              <Text style={styles.resultText}>{country}</Text>
              <Text style={styles.resultArrow}>›</Text>
            </Pressable>
          ))}
        </View>
      )}

      {query.trim().length > 0 && filtered.length === 0 && (
        <Text style={styles.empty}>No countries match "{query}"</Text>
      )}

      {query.trim().length === 0 && (
        <Text style={styles.hint}>e.g. type "f" for France, "u" for USA</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },

  // Chosen state
  chosenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
  },
  chosenIcon: { fontSize: 16 },
  chosenName: {
    flex: 1,
    fontFamily: Fonts.dmSansMedium,
    fontSize: 15,
    color: Colors.ink,
  },
  changeBtn: {
    backgroundColor: Colors.ink,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  changeBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.gold,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
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

  // Results
  resultList: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  resultRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  resultText: {
    flex: 1,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.ink,
  },
  resultArrow: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 18,
    color: Colors.gold,
  },

  // Empty / hint
  empty: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  hint: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: 'italic',
    paddingLeft: 2,
  },
});
