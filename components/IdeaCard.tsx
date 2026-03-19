import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Idea } from '../types';

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
  interested: '#059669',
  pending: '#D97706',
  discarded: '#9CA3AF',
} as const;

export default function IdeaCard({ idea, onPress }: IdeaCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
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
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#1F2937', flex: 1 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, marginLeft: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  solution: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 8 },
  target: { fontSize: 12, color: '#9CA3AF' },
});
