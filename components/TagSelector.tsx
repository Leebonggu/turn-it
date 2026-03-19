import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tag } from '../types';
import { TAGS } from '../constants/tags';
import { colors, spacing, fontSize, radius } from '../theme';

interface TagSelectorProps {
  selected: Tag[];
  onToggle: (tag: Tag) => void;
}

export default function TagSelector({ selected, onToggle }: TagSelectorProps) {
  return (
    <View style={styles.container}>
      {TAGS.map((tag) => (
        <TouchableOpacity
          key={tag}
          style={[styles.tag, selected.includes(tag) && styles.tagSelected]}
          onPress={() => onToggle(tag)}
          accessibilityRole="button"
          accessibilityState={{ selected: selected.includes(tag) }}
        >
          <Text style={[styles.tagText, selected.includes(tag) && styles.tagTextSelected]}>
            {tag}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
  },
  tagSelected: { backgroundColor: colors.primary },
  tagText: { fontSize: fontSize.base, color: colors.textSecondary },
  tagTextSelected: { color: colors.textInverse },
});
