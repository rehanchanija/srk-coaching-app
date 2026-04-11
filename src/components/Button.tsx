import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/Theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  style,
  disabled,
  ...props
}) => {
  const getBackgroundStyle = () => {
    if (disabled) return styles.disabled;
    switch (variant) {
      case 'primary': return styles.primary;
      case 'secondary': return styles.secondary;
      case 'outline': return styles.outline;
      default: return styles.primary;
    }
  };

  const getTextStyle = () => {
    if (disabled) return styles.textDisabled;
    switch (variant) {
      case 'primary': return styles.textPrimary;
      case 'secondary': return styles.textSecondary;
      case 'outline': return styles.textOutline;
      default: return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.button, getBackgroundStyle(), style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <Text style={[typography.h3, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radius.l,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  outline: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.border,
  },
  textPrimary: {
    color: colors.white,
    letterSpacing: 0.5,
  },
  textSecondary: {
    color: colors.text,
    letterSpacing: 0.5,
  },
  textOutline: {
    color: colors.primary,
    letterSpacing: 0.5,
  },
  textDisabled: {
    color: colors.textLight,
  },
});
