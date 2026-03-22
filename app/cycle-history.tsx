import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { getUserCycles, getAllComplaints, getAllIdeas } from '../services/firestore';
import { Cycle } from '../types';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { colors, spacing, fontSize, fontWeight, radius } from '../theme';

interface CycleWithStats extends Cycle {
  complaintsFetched: number;
  ideasCount: number;
}

export default function CycleHistoryScreen() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [cycles, setCycles] = useState<CycleWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [complaintCounts, setComplaintCounts] = useState<Record<string, number>>({});
  const [ideaCounts, setIdeaCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    if (!firebaseUser) return;
    setIsLoading(true);
    try {
      const [result, allComplaints, allIdeas] = await Promise.all([
        getUserCycles(firebaseUser.uid),
        getAllComplaints(firebaseUser.uid),
        getAllIdeas(firebaseUser.uid),
      ]);

      const cCounts: Record<string, number> = {};
      allComplaints.forEach((c) => { cCounts[c.cycleId] = (cCounts[c.cycleId] || 0) + 1; });
      const iCounts: Record<string, number> = {};
      allIdeas.forEach((i) => { iCounts[i.cycleId] = (iCounts[i.cycleId] || 0) + 1; });
      setComplaintCounts(cCounts);
      setIdeaCounts(iCounts);

      const withStats = result.cycles.map((cycle) => ({
        ...cycle,
        complaintsFetched: cCounts[cycle.id!] || 0,
        ideasCount: iCounts[cycle.id!] || 0,
      }));
      setCycles(withStats);
      setLastDoc(result.lastDoc);
      setHasMore(result.cycles.length === 20);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (!firebaseUser || !hasMore || isLoadingMore || !lastDoc) return;
    setIsLoadingMore(true);
    try {
      const result = await getUserCycles(firebaseUser.uid, lastDoc);
      const withStats = result.cycles.map((cycle) => ({
        ...cycle,
        complaintsFetched: complaintCounts[cycle.id!] || 0,
        ideasCount: ideaCounts[cycle.id!] || 0,
      }));
      setCycles((prev) => [...prev, ...withStats]);
      setLastDoc(result.lastDoc);
      setHasMore(result.cycles.length === 20);
    } finally {
      setIsLoadingMore(false);
    }
  }, [firebaseUser, hasMore, isLoadingMore, lastDoc, complaintCounts, ideaCounts]);

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const d = timestamp.toDate();
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  };

  const renderCycle = ({ item }: { item: CycleWithStats }) => (
    <Pressable style={styles.card} onPress={() => router.push({ pathname: '/cycle-detail', params: { cycleId: item.id! } })}>
      <View style={styles.cardHeader}>
        <Text style={styles.cycleName}>{item.name}</Text>
        <View style={[styles.badge, item.status === 'active' ? styles.badgeActive : styles.badgeCompleted]}>
          <Text style={[styles.badgeText, item.status === 'active' ? styles.badgeTextActive : styles.badgeTextCompleted]}>
            {item.status === 'active' ? '진행중' : '완료'}
          </Text>
        </View>
      </View>
      <Text style={styles.dateText}>
        {formatDate(item.createdAt)}
        {item.completedAt ? ` ~ ${formatDate(item.completedAt)}` : ' ~ 진행중'}
      </Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{item.complaintsFetched}</Text>
          <Text style={styles.statLabel}>기록</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{item.ideasCount}</Text>
          <Text style={styles.statLabel}>아이디어</Text>
        </View>
      </View>
    </Pressable>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (cycles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>아직 사이클이 없어요</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={cycles}
      keyExtractor={(item) => item.id!}
      renderItem={renderCycle}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.xl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: fontSize.lg, color: colors.textTertiary },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cycleName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, flex: 1 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeActive: { backgroundColor: colors.primaryBg },
  badgeCompleted: { backgroundColor: colors.successBg },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  badgeTextActive: { color: colors.primary },
  badgeTextCompleted: { color: colors.success },
  dateText: { fontSize: fontSize.sm, color: colors.textTertiary, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.xl },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textTertiary },
  footer: { padding: spacing.lg, alignItems: 'center' },
});
