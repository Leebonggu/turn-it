import { Text, StyleSheet } from 'react-native';
import Card from './ui/Card';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.category}>{question.category}</Text>
      <Text style={styles.text}>{question.text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#4F46E5' },
  category: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  text: { fontSize: 18, fontWeight: '600', color: '#fff', lineHeight: 26 },
});
