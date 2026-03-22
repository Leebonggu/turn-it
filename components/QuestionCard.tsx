import { useState } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Card from './ui/Card';
import { Question } from '../types';
import { colors, spacing, fontSize, fontWeight, lineHeight } from '../theme';

interface QuestionCardProps {
  question: Question;
  collapsible?: boolean;
}

export default function QuestionCard({ question, collapsible = false }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (collapsible) {
    return (
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Card style={styles.cardMuted}>
          <Text style={styles.categoryMuted}>
            {expanded ? '▾' : '▸'} {question.category}
          </Text>
          {expanded && <Text style={styles.textMuted}>{question.text}</Text>}
          {!expanded && (
            <Text style={styles.textMutedCollapsed} numberOfLines={1}>
              {question.text}
            </Text>
          )}
        </Card>
      </Pressable>
    );
  }

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
  cardMuted: { backgroundColor: colors.surfaceMuted },
  categoryMuted: { fontSize: fontSize.xs, color: colors.textTertiary, marginBottom: spacing.xs },
  textMuted: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: lineHeight.normal },
  textMutedCollapsed: { fontSize: fontSize.sm, color: colors.textTertiary },
});
