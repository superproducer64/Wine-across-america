import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';

export interface SliderZone {
  label: string;
  min: number;
  max: number;
  color: string;
}

interface ScoreSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  lowLabel?: string;
  highLabel?: string;
  tip?: string;
  onChange: (value: number) => void;
  accentColor?: string;
  disabled?: boolean;
  zones?: SliderZone[];
  onInfo?: () => void;
}

export function ScoreSlider({
  label,
  value,
  min = 1,
  max = 10,
  step = 1,
  lowLabel,
  highLabel,
  tip,
  onChange,
  accentColor = Colors.gold,
  disabled = false,
  zones,
  onInfo,
}: ScoreSliderProps) {
  const trackWidth = useRef(0);

  const clampValue = useCallback(
    (raw: number) => {
      const stepped = Math.round(raw / step) * step;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step]
  );

  const locationToValue = useCallback(
    (locationX: number) => {
      if (trackWidth.current === 0) return value;
      const ratio = locationX / trackWidth.current;
      const raw = min + ratio * (max - min);
      return clampValue(raw);
    },
    [min, max, value, clampValue]
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: (evt) => {
      if (!disabled) onChange(locationToValue(evt.nativeEvent.locationX));
    },
    onPanResponderMove: (evt) => {
      if (!disabled) onChange(locationToValue(evt.nativeEvent.locationX));
    },
  });

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const fillRatio = (value - min) / (max - min);
  const activeZone = zones?.find((z) => value >= z.min && value <= z.max);
  const fillColor = disabled
    ? Colors.inkFaint
    : (activeZone?.color ?? accentColor);

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
          {onInfo && (
            <Pressable onPress={onInfo} hitSlop={10} style={styles.infoBtn}>
              <Text style={styles.infoBtnText}>ⓘ</Text>
            </Pressable>
          )}
        </View>
        <View style={[styles.valueBadge, { backgroundColor: fillColor + '22', borderColor: fillColor + '66' }]}>
          <Text style={[styles.valueText, { color: fillColor }]}>{value}</Text>
        </View>
      </View>

      {tip ? <Text style={styles.tip}>{tip}</Text> : null}

      {zones && zones.length > 0 && (
        <View style={styles.zoneRow}>
          {zones.map((zone) => {
            const isActive = activeZone?.label === zone.label;
            const size = zone.max - zone.min + 1;
            return (
              <View key={zone.label} style={{ flex: size, alignItems: 'center' }}>
                <View
                  style={[
                    styles.zoneBand,
                    {
                      backgroundColor: zone.color,
                      opacity: isActive ? 1 : 0.28,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.zoneLabel,
                    {
                      color: isActive ? zone.color : Colors.inkFaint,
                      fontFamily: isActive ? Fonts.dmSansMedium : Fonts.dmSans,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {zone.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.sliderRow}>
        {lowLabel ? <Text style={styles.anchor}>{lowLabel}</Text> : null}

        <View
          style={[styles.track, disabled && styles.trackDisabled]}
          onLayout={handleTrackLayout}
          {...panResponder.panHandlers}
        >
          <View
            style={[
              styles.fill,
              { width: `${fillRatio * 100}%`, backgroundColor: fillColor },
            ]}
          />
          {!disabled && (
            <View
              style={[
                styles.thumb,
                {
                  left: `${fillRatio * 100}%`,
                  backgroundColor: fillColor,
                  borderColor: Colors.surface,
                },
              ]}
            />
          )}
        </View>

        {highLabel ? <Text style={styles.anchor}>{highLabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  containerDisabled: {
    opacity: 0.55,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  label: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  labelDisabled: {
    color: Colors.inkMuted,
  },
  infoBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBtnText: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.inkFaint,
  },
  valueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  valueText: {
    fontFamily: Fonts.playfair,
    fontSize: 15,
    fontWeight: '600',
  },
  tip: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.inkMuted,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  zoneRow: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 2,
  },
  zoneBand: {
    height: 5,
    borderRadius: Radius.full,
    width: '100%',
    marginBottom: 3,
  },
  zoneLabel: {
    fontSize: 9,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    justifyContent: 'center',
  },
  trackDisabled: {
    borderStyle: 'dashed',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: Radius.full,
  },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    top: -9,
    marginLeft: -11,
  },
  anchor: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: Colors.inkMuted,
    flexShrink: 1,
  },
});
