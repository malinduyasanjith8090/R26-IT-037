// components/ProgressBar.tsx (Fixed)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface ProgressBarProps {
  progress: number;
  height?: number;
  showLabel?: boolean;
  label?: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 20,
  showLabel = false,
  label,
  color,
}) => {
  const { colors } = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const progressColor = color || colors.primary;

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            {label || `${Math.round(clampedProgress * 100)}%`}
          </Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: colors.primaryLight }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress * 100}%`,
              backgroundColor: progressColor,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSize.sm,
  },
  track: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 10,
  },
});

export default ProgressBar;