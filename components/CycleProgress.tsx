import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, radius } from '../theme';

interface CycleProgressProps {
  count: number;
  max?: number;
}

export default function CycleProgress({ count, max = 7 }: CycleProgressProps) {
  const progress = Math.min(count / max, 1);

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.text}>{Math.min(count, max)}/{max}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  barBackground: {
    flex: 1, height: 8, backgroundColor: colors.borderLight, borderRadius: radius.sm, overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.sm },
  text: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textSecondary, minWidth: 30 },
});
