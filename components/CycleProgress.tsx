import { View, Text, StyleSheet } from 'react-native';
import { CycleStatus } from '../utils/cycle';
import { colors, spacing, fontSize, fontWeight } from '../theme';

interface CycleProgressProps {
  count: number;
  max?: number;
  status?: CycleStatus;
}

const STATUS_MESSAGES: Record<string, string> = {
  in_progress: '좋은 시작이에요! 계속 기록해보세요',
  early_analysis: '분석이 가능해요, 더 모으면 정확도가 올라가요',
  ready: '충분한 기록! 아이디어를 만들어보세요',
};

export default function CycleProgress({ count, max = 7, status }: CycleProgressProps) {
  const message = status ? STATUS_MESSAGES[status] : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {Array.from({ length: max }, (_, i) => (
          <View
            key={i}
            style={[styles.dot, i < count ? styles.dotFilled : styles.dotEmpty]}
          />
        ))}
        {count > max && (
          <View style={styles.extraBadge}>
            <Text style={styles.extraText}>+{count - max}</Text>
          </View>
        )}
        <Text style={styles.countText}>{count}/{max}</Text>
      </View>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 16, height: 16, borderRadius: 8 },
  dotFilled: { backgroundColor: colors.primary },
  dotEmpty: { backgroundColor: colors.borderLight, borderWidth: 1, borderColor: colors.border },
  extraBadge: { backgroundColor: colors.primaryBg, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  extraText: { fontSize: 10, fontWeight: fontWeight.bold, color: colors.primary },
  countText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginLeft: spacing.xs },
  message: { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: spacing.sm },
});
