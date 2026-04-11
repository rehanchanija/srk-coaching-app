import React from 'react';
import { View, StyleSheet, ViewProps, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme/Theme';

interface CardProps extends ViewProps {
  onPress?: () => void;
  variant?: 'elevated' | 'flat' | 'outline';
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, variant = 'elevated', ...props }) => {
  const cardStyle: ViewStyle[] = [styles.baseCard];
  
  if (variant === 'elevated') cardStyle.push(styles.elevated);
  if (variant === 'outline') cardStyle.push(styles.outline);
  if (style) cardStyle.push(style as ViewStyle);

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} style={cardStyle} onPress={onPress}>
        {children}
      </TouchableOpacity>
    );
  }
  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  baseCard: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    padding: spacing.m + 4,
    marginBottom: spacing.m,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08, // Very subtle soft light
    shadowRadius: 16,
    elevation: 8,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: '#F1F5F9', // Subtle Slate 100
  },
});
