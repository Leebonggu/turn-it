import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

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
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primary: { backgroundColor: '#4F46E5' },
  dark: { backgroundColor: '#1C1C1E' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#D1D5DB' },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
  outlineText: { color: '#374151' },
});
