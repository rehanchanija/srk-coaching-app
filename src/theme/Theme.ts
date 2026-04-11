/**
 * Antigravity Premium Design System
 * Focus: High Contrast, Modern Indigo Primary, Refined Typography
 */

export const colors = {
  // Brand Colors
  primary: '#6366F1', // Indigo - Professional & Educational
  primaryLight: '#EEF2FF',
  primaryDark: '#4338CA',

  secondary: '#10B981', // Emerald - Positive progress
  secondaryLight: '#D1FAE5',

  accent: '#8B5CF6', // Violet
  accentLight: '#F5F3FF',

  // UI Colors
  background: '#F8FAFC', // Slate 50 - Soft screen bg
  card: '#FFFFFF',
  border: '#E2E8F0', // Slate 200

  // Text Colors
  text: '#0F172A', // Slate 900 - Deep black-ish
  textLight: '#475569', // Slate 600 - Readable subtext
  textMuted: '#94A3B8', // Slate 400 - Faint labels
  white: '#FFFFFF',

  // Status Colors
  success: '#059669',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  s: 8,
  m: 14,
  l: 24,
  xl: 32,
  round: 999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#0F172A',
    letterSpacing: -1,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#0F172A',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1E293B',
    letterSpacing: -0.4,
  },
  body: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#94A3B8',
    letterSpacing: 0.2,
  }
};
