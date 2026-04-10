import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '@/theme';

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
}: ScoreSliderProps) {
  const trackWidth = useRef(0);
  const trackX = useRef(0);

  const clampValue = useCallback(
    (raw: number) => {
      const stepped = Math.round(raw / step) * step;
      return Math.max(min, Math.min(max, stepped));
    },
    [min, max, step]
  );

  const positionToValue = useCallback(
    (x: number) => {
      const ratio = (x - trackX.current) / trackWidth.current;
      const raw = min + ratio * (max - min);
      return clampValue(raw);
    },
    [min, max, clampValue]
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      onChange(positionToValue(evt.nativeEvent.pageX));
    },
    onPanResponderMove: (evt) => {
      onChange(positionToValue(evt.nativeEvent.pageX));
    },
  });

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    e.target.measure((_x, _y, width, _height, pageX) => {
      trackWidth.current = width;
      trackX.current = pageX;
    });
  };

  const fillRatio = (value - min) / (max - min);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.valueBadge, { backgroundColor: accentColor + '22', borderColor: accentColor + '66' }]}>
          <Text style={[styles.valueText, { color: accentColor }]}>{value}</Text>
        </View>
      </View>

      {tip ? <Text style={styles.tip}>{tip}</Text> : null}

      <View style={styles.sliderRow}>
        {lowLabel ? <Text style={styles.anchor}>{lowLabel}</Text> : null}

        <View
          style={styles.track}
          onLayout={handleTrackLayout}
          {...panResponder.panHandlers}
        >
          <View
            style={[
              styles.fill,
              { width: `${fillRatio * 100}%`, backgroundColor: accentColor },
            ]}
          />
          <View
            style={[
              styles.thumb,
              {
                left: `${fillRatio * 100}%`,
                backgroundColor: accentColor,
                borderColor: Colors.surface,
              },
            ]}
          />
        </View>

        {highLabel ? <Text style={styles.anchor}>{highLabel}</Text> : null}
      </View>

      {(lowLabel || highLabel) && (
        <View style={styles.anchorsRow}>
          {lowLabel ? <Text style={styles.anchorLabel}>{lowLabel}</Text> : <View />}
          {highLabel ? <Text style={styles.anchorLabel}>{highLabel}</Text> : <View />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    color: Colors.ink,
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
    marginBottom: 10,
    fontStyle: 'italic',
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
  anchorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  anchorLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    color: Colors.inkFaint,
  },
});
