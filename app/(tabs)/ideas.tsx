import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useCycleStore } from '../../stores/cycleStore';
import { getAllIdeas } from '../../services/firestore';
import { generateIdeas } from '../../services/ai';
import { Idea } from '../../types';
import IdeaCard from '../../components/IdeaCard';
import { colors, spacing, fontSize } from '../../theme';

export default function IdeasScreen() {
  const router = useRouter();
  const { analyze } = useLocalSearchParams<{ analyze?: string }>();
  const { firebaseUser } = useAuthStore();
  const { userData, currentComplaints } = useCycleStore();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    const data = await getAllIdeas(firebaseUser.uid);
    setIdeas(data);
    setLoading(false);
  }, [firebaseUser]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (analyze === 'true' && firebaseUser && userData?.currentCycleId && currentComplaints.length >= 3) {
      handleGenerate();
    }
  }, [analyze]);

  const handleGenerate = async () => {
    if (!firebaseUser || !userData?.currentCycleId) return;
    setGenerating(true);
    try {
      await generateIdeas(firebaseUser.uid, userData.currentCycleId, currentComplaints);
      await load();
    } catch (e: any) {
      Alert.alert('생성 실패', e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading || generating) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        {generating && <Text style={styles.genText}>아이디어 생성 중...</Text>}
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={ideas.length === 0 ? styles.centered : styles.list}
      data={ideas}
      keyExtractor={(item) => item.id!}
      renderItem={({ item }) => (
        <IdeaCard idea={item} onPress={() => router.push(`/idea/${item.id}`)} />
      )}
      ListEmptyComponent={<Text style={styles.empty}>아직 생성된 아이디어가 없어요</Text>}
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
  genText: { marginTop: spacing.md, fontSize: fontSize.base, color: colors.textTertiary },
});
