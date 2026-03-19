import { Text, StyleSheet } from 'react-native';
import Card from './ui/Card';
import { Question } from '../types';
import { colors, spacing, fontSize, fontWeight, lineHeight } from '../theme';

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
  card: { backgroundColor: colors.primary },
  category: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.sm },
  text: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.textInverse, lineHeight: lineHeight.relaxed },
});
