import { View, Text, StyleSheet } from 'react-native';
import { Complaint } from '../types';
import { QUESTIONS } from '../constants/questions';
import { formatDate } from '../utils/date';
import { colors, spacing, fontSize, radius, lineHeight } from '../theme';

interface ComplaintItemProps {
  complaint: Complaint;
}

export default function ComplaintItem({ complaint }: ComplaintItemProps) {
  const question = QUESTIONS.find((q) => q.id === complaint.questionId);
  const date = complaint.createdAt?.toDate?.() ? formatDate(complaint.createdAt.toDate()) : '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{date}</Text>
        {question && <Text style={styles.question}>{question.text}</Text>}
      </View>
      <Text style={styles.content}>{complaint.content}</Text>
      {complaint.tags.length > 0 && (
        <View style={styles.tags}>
          {complaint.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.borderSubtle,
  },
  header: { marginBottom: spacing.sm },
  date: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: spacing.xs },
  question: { fontSize: fontSize.sm, color: colors.textTertiary, fontStyle: 'italic' },
  content: { fontSize: fontSize.md, color: colors.text, lineHeight: lineHeight.normal },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { backgroundColor: colors.surfaceMuted, paddingVertical: spacing.xs, paddingHorizontal: 10, borderRadius: radius.md },
  tagText: { fontSize: fontSize.xs, color: colors.textTertiary },
});
