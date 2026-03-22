import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { getCycle, getComplaintsByCycle, getIdeasByCycle } from '../services/firestore';
import { Cycle, Complaint, Idea } from '../types';
import ComplaintItem from '../components/ComplaintItem';
import IdeaCard from '../components/IdeaCard';
import Button from '../components/ui/Button';
import { colors, spacing, fontSize, fontWeight, radius } from '../theme';

export default function CycleDetailScreen() {
  const { cycleId } = useLocalSearchParams<{ cycleId: string }>();
  const { firebaseUser } = useAuthStore();
  const router = useRouter();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [cycleId]);

  const loadData = async () => {
    if (!firebaseUser || !cycleId) return;
    setIsLoading(true);
    try {
      const [cycleData, complaintsData, ideasData] = await Promise.all([
        getCycle(cycleId),
        getComplaintsByCycle(firebaseUser.uid, cycleId),
        getIdeasByCycle(firebaseUser.uid, cycleId),
      ]);
      setCycle(cycleData);
      setComplaints(complaintsData);
      setIdeas(ideasData);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const d = timestamp.toDate();
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  };

  const handleAnalyze = () => {
    router.push({ pathname: '/(tabs)/ideas', params: { analyze: 'true' } });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!cycle) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>사이클을 찾을 수 없어요</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.cycleName}>{cycle.name}</Text>
          <View style={[styles.badge, cycle.status === 'active' ? styles.badgeActive : styles.badgeCompleted]}>
            <Text style={[styles.badgeText, cycle.status === 'active' ? styles.badgeTextActive : styles.badgeTextCompleted]}>
              {cycle.status === 'active' ? '진행중' : '완료'}
            </Text>
          </View>
        </View>
        <Text style={styles.dateText}>
          {formatDate(cycle.createdAt)}
          {cycle.completedAt ? ` ~ ${formatDate(cycle.completedAt)}` : ' ~ 진행중'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{complaints.length}</Text>
          <Text style={styles.statLabel}>불만 기록</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{ideas.length}</Text>
          <Text style={styles.statLabel}>아이디어</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>불만 기록</Text>
      {complaints.length > 0 ? (
        complaints.map((c) => (
          <ComplaintItem key={c.id} complaint={c} />
        ))
      ) : (
        <Text style={styles.emptyText}>기록이 없어요</Text>
      )}

      <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>아이디어</Text>
      {ideas.length > 0 ? (
        ideas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))
      ) : complaints.length >= 3 ? (
        <View style={styles.generateBox}>
          <Text style={styles.generateText}>기록이 충분해요! 아이디어를 만들어볼까요?</Text>
          <Button title="아이디어 생성하기" onPress={handleAnalyze} />
        </View>
      ) : (
        <Text style={styles.emptyText}>기록을 더 쌓으면 아이디어를 생성할 수 있어요</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cycleName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, flex: 1 },
  dateText: { fontSize: fontSize.sm, color: colors.textTertiary },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeActive: { backgroundColor: colors.primaryBg },
  badgeCompleted: { backgroundColor: colors.successBg },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  badgeTextActive: { color: colors.primary },
  badgeTextCompleted: { color: colors.success },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statNumber: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: spacing.xs },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.md },
  emptyText: { fontSize: fontSize.base, color: colors.textTertiary, textAlign: 'center', padding: spacing.lg },
  generateBox: { alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  generateText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.primary, textAlign: 'center' },
});
