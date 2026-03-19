import { View, Text, StyleSheet } from 'react-native';
import { Complaint } from '../types';
import { QUESTIONS } from '../constants/questions';
import { formatDate } from '../utils/date';

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
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  header: { marginBottom: 8 },
  date: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  question: { fontSize: 13, color: '#6B7280', fontStyle: 'italic' },
  content: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { backgroundColor: '#F3F4F6', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  tagText: { fontSize: 12, color: '#6B7280' },
});
