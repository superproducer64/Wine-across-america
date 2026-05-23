import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';
import { ParameterInfo } from '@/data/parameterInfo';

interface InfoSheetProps {
  visible: boolean;
  onClose: () => void;
  info: ParameterInfo;
}

export function InfoSheet({ visible, onClose, info }: InfoSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{info.title}</Text>
            <Text style={styles.subtitle}>{info.subtitle}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* What it is */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHAT IT IS</Text>
            <Text style={styles.bodyText}>{info.whatItIs}</Text>
          </View>

          {/* How to identify */}
          {info.focus ? (
            <View style={styles.focusBox}>
              <Text style={styles.focusIcon}>👁</Text>
              <Text style={styles.focusText}>{info.focus}</Text>
            </View>
          ) : null}

          {/* Zones */}
          {info.zones && info.zones.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>THE ZONES</Text>
              {info.zones.map((zone) => (
                <View key={zone.label} style={styles.zoneRow}>
                  <View style={[styles.zoneDot, { backgroundColor: zone.color }]} />
                  <View style={styles.zoneContent}>
                    <View style={styles.zoneHeader}>
                      <Text style={[styles.zoneLabel, { color: zone.color }]}>
                        {zone.label}
                      </Text>
                      {zone.range ? (
                        <Text style={styles.zoneRange}>{zone.range}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.zoneDesc}>{zone.description}</Text>
                    {zone.tag ? (
                      <View style={[styles.zoneTag, { borderColor: zone.color + '60', backgroundColor: zone.color + '15' }]}>
                        <Text style={[styles.zoneTagText, { color: zone.color }]}>
                          {zone.tag}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {/* Note */}
          {info.note ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{info.note}</Text>
            </View>
          ) : null}

          {/* Tip */}
          {info.tip ? (
            <View style={styles.tipBox}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>{info.tip}</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '82%',
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 20,
    color: Colors.ink,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
    fontStyle: 'italic',
  },
  closeBtn: {
    paddingTop: 2,
  },
  closeBtnText: {
    fontFamily: Fonts.dmSans,
    fontSize: 16,
    color: Colors.inkMuted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.md,
  },
  sectionLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.inkFaint,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  bodyText: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.inkMid,
    lineHeight: 20,
  },
  focusBox: {
    flexDirection: 'row',
    backgroundColor: Colors.goldPale,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.gold + '80',
    padding: Spacing.md,
    gap: 10,
    alignItems: 'flex-start',
  },
  focusIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  focusText: {
    flex: 1,
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMid,
    lineHeight: 19,
  },
  zoneRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  zoneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    flexShrink: 0,
  },
  zoneContent: {
    flex: 1,
    gap: 3,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
  },
  zoneRange: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkFaint,
  },
  zoneDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
  },
  zoneTag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  zoneTagText: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    fontStyle: 'italic',
  },
  noteBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  noteText: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
    lineHeight: 17,
  },
  tipBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  tipIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
