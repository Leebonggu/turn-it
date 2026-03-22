import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { getAllComplaints, getUserCycles } from '../../services/firestore';
import { Complaint, Cycle } from '../../types';
import ComplaintItem from '../../components/ComplaintItem';
import { colors, spacing, fontSize } from '../../theme';

export default function ComplaintsScreen() {
  const { firebaseUser } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [cycleMap, setCycleMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    const [data, result] = await Promise.all([
      getAllComplaints(firebaseUser.uid),
      getUserCycles(firebaseUser.uid),
    ]);
    const map: Record<string, string> = {};
    result.cycles.forEach((c) => { if (c.id) map[c.id] = c.name; });
    setCycleMap(map);
    setComplaints(data);
    setLoading(false);
  }, [firebaseUser]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={complaints.length === 0 ? styles.centered : styles.list}
      data={complaints}
      keyExtractor={(item) => item.id!}
      renderItem={({ item }) => (
        <ComplaintItem complaint={item} cycleName={cycleMap[item.cycleId]} />
      )}
      ListEmptyComponent={<Text style={styles.empty}>아직 기록이 없어요</Text>}
      onRefresh={load}
      refreshing={loading}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.xl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: fontSize.lg, color: colors.textMuted },
});
