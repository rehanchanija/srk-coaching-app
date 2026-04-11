import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/Theme';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.primary,
  height = 8,
}) => {
  const boundedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, { height }]}>
      <View
        style={[
          styles.fill,
          { width: `${boundedProgress}%`, backgroundColor: color, height },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.border,
    borderRadius: radius.round,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: radius.round,
  },
});
