import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Idea } from '../types';
import { colors, spacing, fontSize, fontWeight, radius, lineHeight } from '../theme';

interface IdeaCardProps {
  idea: Idea;
  onPress: () => void;
}

const STATUS_LABEL = {
  interested: '관심있음',
  pending: '보류',
  discarded: '폐기',
} as const;

const STATUS_COLOR = {
  interested: colors.success,
  pending: colors.warning,
  discarded: colors.textMuted,
} as const;

export default function IdeaCard({ idea, onPress }: IdeaCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} accessibilityRole="button">
      <View style={styles.header}>
        <Text style={styles.title}>{idea.title}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[idea.status] + '20' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLOR[idea.status] }]}>
            {STATUS_LABEL[idea.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.solution} numberOfLines={2}>{idea.solution}</Text>
      <Text style={styles.target}>{idea.targetCustomer}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, flex: 1 },
  badge: { paddingVertical: spacing.xs, paddingHorizontal: 10, borderRadius: radius.md, marginLeft: spacing.sm },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  solution: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: lineHeight.tight, marginBottom: spacing.sm },
  target: { fontSize: fontSize.xs, color: colors.textMuted },
});
