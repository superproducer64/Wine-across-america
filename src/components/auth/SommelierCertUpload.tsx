import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts, Spacing, Radius } from '@/theme';

interface Props {
  onCertSelected: (dataUrl: string) => void;
  certDataUrl: string | null;
  uploading?: boolean;
  error?: string;
}

export function SommelierCertUpload({ onCertSelected, certDataUrl, uploading, error }: Props) {
  const [picking, setPicking] = useState(false);

  const handlePick = async () => {
    setPicking(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        base64: true,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mime = asset.mimeType ?? 'image/jpeg';
        const dataUrl = `data:${mime};base64,${asset.base64}`;
        onCertSelected(dataUrl);
      }
    } finally {
      setPicking(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Level 3 Certification</Text>
      <Text style={styles.sublabel}>
        Upload a photo or scan of your certificate from any recognized sommelier program
        (CMS, WSET, ISG, etc.). Your application will be reviewed and approved within 2–3 business days.
      </Text>

      {certDataUrl ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: certDataUrl }} style={styles.preview} resizeMode="cover" />
          <Pressable style={styles.changeBtn} onPress={handlePick} disabled={picking || uploading}>
            <Text style={styles.changeBtnText}>Change Photo</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.uploadArea}
          onPress={handlePick}
          disabled={picking || uploading}
        >
          {picking ? (
            <ActivityIndicator color={Colors.gold} />
          ) : (
            <>
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={styles.uploadText}>Tap to upload your certificate</Text>
              <Text style={styles.uploadHint}>JPG or PNG — photo of physical cert is fine</Text>
            </>
          )}
        </Pressable>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.inkMid,
  },
  sublabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 17,
  },
  uploadArea: {
    borderWidth: 1,
    borderColor: Colors.gold,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(196,132,122,0.06)',
  },
  uploadIcon: {
    fontSize: 28,
  },
  uploadText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    color: Colors.gold,
  },
  uploadHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  previewWrap: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: 0,
  },
  preview: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surfaceAlt,
  },
  changeBtn: {
    padding: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  changeBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.gold,
  },
  errorText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.red,
  },
});
