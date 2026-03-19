import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { getAllComplaints } from '../../services/firestore';
import { Complaint } from '../../types';
import ComplaintItem from '../../components/ComplaintItem';

export default function ComplaintsScreen() {
  const { firebaseUser } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    const data = await getAllComplaints(firebaseUser.uid);
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
      renderItem={({ item }) => <ComplaintItem complaint={item} />}
      ListEmptyComponent={<Text style={styles.empty}>아직 기록이 없어요</Text>}
      onRefresh={load}
      refreshing={loading}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 16, color: '#9CA3AF' },
});
