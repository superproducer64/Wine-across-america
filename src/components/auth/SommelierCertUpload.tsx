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
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Fonts, Spacing, Radius } from '@/theme';

interface Props {
  onCertSelected: (uri: string, mimeType: string) => void;
  certDataUrl: string | null;
  certMime?: string | null;
  uploading?: boolean;
  error?: string;
}

function isPdfMime(mime: string | null | undefined) {
  return mime === 'application/pdf';
}

export function SommelierCertUpload({ onCertSelected, certDataUrl, certMime, uploading, error }: Props) {
  const [picking, setPicking] = useState(false);

  const handlePickImage = async () => {
    setPicking(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
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
        onCertSelected(dataUrl, mime);
      }
    } finally {
      setPicking(false);
    }
  };

  const handlePickPdf = async () => {
    setPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onCertSelected(asset.uri, 'application/pdf');
      }
    } finally {
      setPicking(false);
    }
  };

  const isPdf = isPdfMime(certMime);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Level 3 Certification</Text>
      <Text style={styles.sublabel}>
        Upload a photo, scan, or PDF of your certificate from any recognized sommelier program
        (CMS, WSET, ISG, etc.). Your application will be reviewed within 2–3 business days.
      </Text>

      {certDataUrl ? (
        <View style={styles.previewWrap}>
          {isPdf ? (
            <View style={styles.pdfPreview}>
              <Text style={styles.pdfIcon}>📄</Text>
              <Text style={styles.pdfLabel}>PDF certificate selected</Text>
            </View>
          ) : (
            <Image source={{ uri: certDataUrl }} style={styles.preview} resizeMode="cover" />
          )}
          <View style={styles.changeRow}>
            <Pressable style={styles.changeBtn} onPress={handlePickImage} disabled={picking || uploading}>
              <Text style={styles.changeBtnText}>Change Photo</Text>
            </Pressable>
            <Pressable style={[styles.changeBtn, styles.changeBtnPdf]} onPress={handlePickPdf} disabled={picking || uploading}>
              <Text style={styles.changeBtnText}>Use PDF</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.uploadOptions}>
          <Pressable
            style={styles.uploadArea}
            onPress={handlePickImage}
            disabled={picking || uploading}
          >
            {picking ? (
              <ActivityIndicator color={Colors.gold} />
            ) : (
              <>
                <Text style={styles.uploadIcon}>🖼️</Text>
                <Text style={styles.uploadText}>Photo / Image</Text>
                <Text style={styles.uploadHint}>JPG or PNG</Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={styles.uploadArea}
            onPress={handlePickPdf}
            disabled={picking || uploading}
          >
            {picking ? (
              <ActivityIndicator color={Colors.gold} />
            ) : (
              <>
                <Text style={styles.uploadIcon}>📄</Text>
                <Text style={styles.uploadText}>PDF Document</Text>
                <Text style={styles.uploadHint}>PDF file</Text>
              </>
            )}
          </Pressable>
        </View>
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
  uploadOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  uploadArea: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gold,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(196,132,122,0.06)',
  },
  uploadIcon: {
    fontSize: 24,
  },
  uploadText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.gold,
    textAlign: 'center',
  },
  uploadHint: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkMuted,
  },
  previewWrap: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  preview: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.surfaceAlt,
  },
  pdfPreview: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pdfIcon: {
    fontSize: 32,
  },
  pdfLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.inkMid,
  },
  changeRow: {
    flexDirection: 'row',
  },
  changeBtn: {
    flex: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderTopWidth: 0.5,
    borderColor: Colors.border,
  },
  changeBtnPdf: {
    borderLeftWidth: 0.5,
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
