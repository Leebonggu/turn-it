import { View, Text, StyleSheet } from 'react-native';
import { Timestamp } from 'firebase/firestore';
import { CycleStatus } from '../utils/cycle';
import { colors, spacing, fontSize, fontWeight, radius } from '../theme';

interface CycleHeaderProps {
  cycleName: string;
  status: CycleStatus;
  recordCount: number;
  startDate: Timestamp | null;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  in_progress: { label: '진행 중', bg: colors.primaryBg, text: colors.primary },
  early_analysis: { label: '분석 가능', bg: colors.warningBg, text: colors.warning },
  ready: { label: '준비 완료', bg: colors.successBg, text: colors.success },
};

export default function CycleHeader({ cycleName, status, recordCount, startDate }: CycleHeaderProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.in_progress;

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp?.toDate) return '';
    const d = timestamp.toDate();
    return `${d.getMonth() + 1}.${d.getDate()}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>{cycleName}</Text>
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
          <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        {startDate ? `시작: ${formatDate(startDate)}` : ''} · 기록 {recordCount}개
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  name: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.text, flex: 1 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  meta: { fontSize: fontSize.sm, color: colors.textTertiary },
});
