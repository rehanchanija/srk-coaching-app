import React, { ReactNode, useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Pressable } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/Theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  onContainerPress?: () => void;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, rightIcon, onContainerPress, style, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<TextInput>(null);

  return (
    <View style={styles.container}>
      {label && <Text style={[typography.bodySmall, styles.label]}>{label}</Text>}
      <Pressable 
        onPress={() => {
          if (onContainerPress) {
            onContainerPress();
          } else {
            inputRef.current?.focus();
          }
        }}
        style={[
          styles.inputContainer, 
          isFocused && styles.inputFocused,
          error && styles.inputError, 
          style
        ]}
      >
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <TextInput
          ref={inputRef}
          style={[styles.input, icon ? styles.inputWithIcon : undefined]}
          placeholderTextColor={colors.textLight}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
      </Pressable>
      {error && <Text style={[typography.caption, styles.errorText]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.l,
  },
  label: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: radius.l,
    height: 56,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrapper: {
    paddingLeft: spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    paddingHorizontal: spacing.m,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  inputWithIcon: {
    paddingLeft: spacing.s,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  rightIconWrapper: {
    paddingRight: spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});
