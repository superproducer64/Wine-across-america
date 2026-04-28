import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';

interface DatePickerInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value + 'T12:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function formatDisplay(value: string): string {
  const d = parseDate(value);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function DatePickerInput({ label, value, onChange, placeholder = 'Select a date' }: DatePickerInputProps) {
  const today = new Date();
  const parsed = parseDate(value);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());

  const openPicker = () => {
    const d = parseDate(value);
    setViewYear(d?.getFullYear() ?? today.getFullYear());
    setViewMonth(d?.getMonth() ?? today.getMonth());
    setOpen(true);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayPress = (day: number) => {
    onChange(toISO(viewYear, viewMonth, day));
    setOpen(false);
  };

  const buildGrid = () => {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const grid = buildGrid();
  const selectedDay = parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth
    ? parsed.getDate()
    : null;
  const todayDay = today.getFullYear() === viewYear && today.getMonth() === viewMonth
    ? today.getDate()
    : null;

  const displayValue = formatDisplay(value);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <Pressable style={styles.field} onPress={openPicker}>
        <Text style={[styles.fieldText, !displayValue && styles.fieldPlaceholder]}>
          {displayValue || placeholder}
        </Text>
        <Text style={styles.calIcon}>📅</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheetWrapper} pointerEvents="box-none">
          <View style={styles.sheet}>
            {/* Month navigation */}
            <View style={styles.nav}>
              <Pressable onPress={prevMonth} style={styles.navBtn} hitSlop={12}>
                <Text style={styles.navArrow}>‹</Text>
              </Pressable>
              <Text style={styles.navTitle}>
                {MONTHS[viewMonth]} {viewYear}
              </Text>
              <Pressable onPress={nextMonth} style={styles.navBtn} hitSlop={12}>
                <Text style={styles.navArrow}>›</Text>
              </Pressable>
            </View>

            {/* Weekday headers */}
            <View style={styles.row}>
              {DAYS.map((d, i) => (
                <View key={i} style={styles.cell}>
                  <Text style={styles.dayHeader}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            {Array.from({ length: grid.length / 7 }).map((_, rowIdx) => (
              <View key={rowIdx} style={styles.row}>
                {grid.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
                  const isSelected = day !== null && day === selectedDay;
                  const isToday = day !== null && day === todayDay;
                  return (
                    <Pressable
                      key={colIdx}
                      style={styles.cell}
                      onPress={() => day && handleDayPress(day)}
                      disabled={day === null}
                    >
                      <View style={[
                        styles.dayInner,
                        isSelected && styles.daySelected,
                        !isSelected && isToday && styles.dayToday,
                      ]}>
                        <Text style={[
                          styles.dayText,
                          isSelected && styles.dayTextSelected,
                          !isSelected && isToday && styles.dayTextToday,
                          day === null && styles.dayTextEmpty,
                        ]}>
                          {day ?? ''}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: Spacing.md,
  },
  label: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.inkMuted,
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    gap: Spacing.sm,
  },
  fieldText: {
    flex: 1,
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    color: Colors.ink,
  },
  fieldPlaceholder: {
    color: Colors.inkFaint,
  },
  calIcon: {
    fontSize: 17,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  navBtn: {
    padding: 4,
  },
  navArrow: {
    fontFamily: Fonts.playfair,
    fontSize: 26,
    color: Colors.gold,
    lineHeight: 30,
  },
  navTitle: {
    fontFamily: Fonts.playfairSemiBold,
    fontSize: 17,
    color: Colors.ink,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 2,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeader: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    color: Colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: Colors.gold,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  dayText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 14,
    color: Colors.ink,
  },
  dayTextSelected: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.ink,
  },
  dayTextToday: {
    color: Colors.gold,
    fontFamily: Fonts.dmSansMedium,
  },
  dayTextEmpty: {
    color: 'transparent',
  },
});
