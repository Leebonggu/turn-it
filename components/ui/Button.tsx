import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'dark' | 'outline';
  style?: ViewStyle;
}

export default function Button({ title, onPress, disabled, variant = 'primary', style }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'dark' && styles.dark,
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={[
        styles.text,
        variant === 'outline' && styles.outlineText,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.primary },
  dark: { backgroundColor: colors.primaryDark },
  outline: { backgroundColor: colors.transparent, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  text: { color: colors.textInverse, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  outlineText: { color: colors.textSecondary },
});
