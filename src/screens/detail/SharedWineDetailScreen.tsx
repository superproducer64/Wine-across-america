import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Fonts, Spacing, Radius } from '@/theme';
import { VivinoStyleCard } from '@/components/wine/VivinoStyleCard';
import { WineEntry } from '@/types';
import { MainStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'SharedWineDetail'>;

export function SharedWineDetailScreen({ route, navigation }: Props) {
  const { snapshot, senderName } = route.params;
  const entry = snapshot as unknown as WineEntry;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav bar */}
      <View style={styles.navbar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹ Back</Text>
        </Pressable>
      </View>

      {/* Shared-by banner */}
      <View style={styles.sharedBanner}>
        <Text style={styles.sharedIcon}>🍷</Text>
        <Text style={styles.sharedText}>
          Shared by <Text style={styles.sharedName}>{senderName}</Text>
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <VivinoStyleCard entry={entry} />
        <View style={{ height: Spacing.huge }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  navBtnText: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 16,
    color: Colors.gold,
  },
  sharedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.goldPale,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderStrong,
  },
  sharedIcon: {
    fontSize: 16,
  },
  sharedText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  sharedName: {
    fontFamily: Fonts.dmSansMedium,
    color: Colors.ink,
  },
  content: {
    padding: Spacing.xl,
  },
});
