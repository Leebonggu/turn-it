import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getIdea, updateIdeaStatus, getComplaintsByCycle } from '../../services/firestore';
import { useAuthStore } from '../../stores/authStore';
import { Idea, Complaint } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ComplaintItem from '../../components/ComplaintItem';

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { firebaseUser } = useAuthStore();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [relatedComplaints, setRelatedComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id || !firebaseUser) return;
    setLoading(true);
    const ideaData = await getIdea(id);
    setIdea(ideaData);

    if (ideaData) {
      const cycleComplaints = await getComplaintsByCycle(firebaseUser.uid, ideaData.cycleId);
      setRelatedComplaints(
        cycleComplaints.filter((c) => ideaData.basedOnComplaintIds.includes(c.id!))
      );
    }
    setLoading(false);
  };

  const handleStatusChange = async (status: Idea['status']) => {
    if (!id) return;
    await updateIdeaStatus(id, status);
    setIdea((prev) => prev ? { ...prev, status } : null);
  };

  if (loading || !idea) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{idea.title}</Text>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.label}>타겟 고객</Text>
        <Text style={styles.body}>{idea.targetCustomer}</Text>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.label}>해결 방안</Text>
        <Text style={styles.body}>{idea.solution}</Text>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.label}>시장 가능성</Text>
        <Text style={styles.body}>{idea.marketPotential}</Text>
      </Card>

      <Text style={[styles.label, { marginTop: 8, marginBottom: 12 }]}>기반 불만</Text>
      {relatedComplaints.map((c) => (
        <ComplaintItem key={c.id} complaint={c} />
      ))}

      <View style={styles.actions}>
        <Button
          title="관심있음"
          variant={idea.status === 'interested' ? 'primary' : 'outline'}
          onPress={() => handleStatusChange('interested')}
          style={{ flex: 1 }}
        />
        <Button
          title="보류"
          variant={idea.status === 'pending' ? 'primary' : 'outline'}
          onPress={() => handleStatusChange('pending')}
          style={{ flex: 1 }}
        />
        <Button
          title="폐기"
          variant={idea.status === 'discarded' ? 'primary' : 'outline'}
          onPress={() => handleStatusChange('discarded')}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  body: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 24 },
});
