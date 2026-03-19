import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tag } from '../types';
import { TAGS } from '../constants/tags';

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
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tagSelected: { backgroundColor: '#4F46E5' },
  tagText: { fontSize: 14, color: '#374151' },
  tagTextSelected: { color: '#fff' },
});
