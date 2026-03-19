import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getIdea, updateIdeaStatus, getComplaintsByCycle } from '../../services/firestore';
import { useAuthStore } from '../../stores/authStore';
import { Idea, Complaint } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ComplaintItem from '../../components/ComplaintItem';
import { colors, spacing, fontSize, fontWeight, lineHeight } from '../../theme';

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

      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.label}>타겟 고객</Text>
        <Text style={styles.body}>{idea.targetCustomer}</Text>
      </Card>

      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.label}>해결 방안</Text>
        <Text style={styles.body}>{idea.solution}</Text>
      </Card>

      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={styles.label}>시장 가능성</Text>
        <Text style={styles.body}>{idea.marketPotential}</Text>
      </Card>

      <Text style={[styles.label, { marginTop: spacing.sm, marginBottom: spacing.md }]}>기반 불만</Text>
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
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xl },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textTertiary, marginBottom: 6 },
  body: { fontSize: fontSize.md, color: colors.text, lineHeight: lineHeight.normal },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing['2xl'] },
});
