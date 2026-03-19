import { View, Text, StyleSheet } from 'react-native';

interface CycleProgressProps {
  count: number;
  max?: number;
}

export default function CycleProgress({ count, max = 7 }: CycleProgressProps) {
  const progress = Math.min(count / max, 1);

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.text}>{Math.min(count, max)}/{max}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barBackground: {
    flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 4 },
  text: { fontSize: 14, fontWeight: '600', color: '#374151', minWidth: 30 },
});
