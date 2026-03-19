export const colors = {
  // Primary
  primary: '#4F46E5',
  primaryDark: '#1C1C1E',

  // Backgrounds
  bg: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F4F6',

  // Borders
  border: '#D1D5DB',
  borderLight: '#E5E7EB',
  borderSubtle: '#F3F4F6',

  // Text
  text: '#1F2937',
  textSecondary: '#374151',
  textTertiary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Status
  success: '#059669',
  successBg: '#ECFDF5',
  warning: '#D97706',
  error: '#DC2626',
  errorBg: '#FEF2F2',

  // Overlay
  overlay: 'rgba(0,0,0,0.4)',

  // Transparent
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
