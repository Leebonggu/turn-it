import { View, StyleSheet } from 'react-native';
import Skeleton from './ui/Skeleton';
import { colors, spacing, radius } from '../theme';

export default function HomeSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton width={100} height={14} style={{ marginBottom: spacing.md }} />
      <Skeleton height={120} borderRadius={radius.lg} style={{ marginBottom: spacing.lg }} />
      <Skeleton height={48} borderRadius={radius.md} style={{ marginBottom: spacing['3xl'] }} />
      <Skeleton width={100} height={14} style={{ marginBottom: spacing.md }} />
      <View style={styles.progressRow}>
        <Skeleton height={8} borderRadius={radius.sm} style={{ flex: 1 }} />
        <Skeleton width={30} height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
