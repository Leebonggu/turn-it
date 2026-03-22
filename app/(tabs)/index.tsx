import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Modal, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCycle } from '../../hooks/useCycle';
import { useToast } from '../../hooks/useToast';
import { useAuthStore } from '../../stores/authStore';
import { getUserCycles, getComplaintsByCycle, completeCycle, updateUser } from '../../services/firestore';
import { generateIdeas } from '../../services/ai';
import { QUESTIONS } from '../../constants/questions';
import { getQuestionForCycle } from '../../utils/cycle';
import { Cycle } from '../../types';
import CycleHeader from '../../components/CycleHeader';
import QuestionCard from '../../components/QuestionCard';
import CycleProgress from '../../components/CycleProgress';
import ComplaintItem from '../../components/ComplaintItem';
import HomeSkeleton from '../../components/HomeSkeleton';
import Button from '../../components/ui/Button';
import { colors, spacing, fontSize, fontWeight, lineHeight, radius } from '../../theme';

export default function HomeScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { firebaseUser } = useAuthStore();
  const { userData, currentCycle, currentComplaints, cycleStatus, isLoading, startCycle, endCycle, refresh } = useCycle();
  const [refreshing, setRefreshing] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [pastCycles, setPastCycles] = useState<(Cycle & { complaintCount: number })[]>([]);
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [generating, setGenerating] = useState(false);

  const questionIndex = getQuestionForCycle(currentComplaints.length, QUESTIONS.length);
  const question = QUESTIONS[questionIndex];

  useEffect(() => {
    if (cycleStatus === 'not_started' && firebaseUser) {
      loadPastCycles();
    }
  }, [cycleStatus, firebaseUser]);

  const loadPastCycles = async () => {
    if (!firebaseUser) return;
    setLoadingCycles(true);
    try {
      const { cycles } = await getUserCycles(firebaseUser.uid);
      const completed = cycles.filter((c) => c.status === 'completed').slice(0, 5);
      const withCounts = await Promise.all(
        completed.map(async (c) => {
          const complaints = await getComplaintsByCycle(firebaseUser.uid, c.id!);
          return { ...c, complaintCount: complaints.length };
        })
      );
      setPastCycles(withCounts);
    } finally {
      setLoadingCycles(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    if (cycleStatus === 'not_started') await loadPastCycles();
    setRefreshing(false);
  };

  const handleRecord = () => {
    router.push({ pathname: '/record', params: { questionId: question.id } });
  };

  const handleAnalyze = async () => {
    if (!firebaseUser || !userData?.currentCycleId) return;
    const cycleId = userData.currentCycleId;
    setGenerating(true);
    try {
      await generateIdeas(firebaseUser.uid, cycleId, currentComplaints);
      await completeCycle(cycleId);
      await updateUser(firebaseUser.uid, { currentCycleId: null, cycleStartedAt: null });
      showToast('아이디어가 생성되었어요!', 'success');
      router.push({ pathname: '/cycle-detail', params: { cycleId } });
      await refresh();
    } catch (e: any) {
      showToast(e.message || '아이디어 생성에 실패했어요.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmName = async () => {
    const name = cycleName.trim() || '새 사이클';
    setShowNameModal(false);
    await startCycle(name);
    showToast('새 사이클이 시작되었어요!', 'success');
  };

  const handleEndCycle = async () => {
    setShowEndModal(false);
    await endCycle();
    showToast('사이클이 종료되었어요.', 'success');
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const d = timestamp.toDate();
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  };

  if (isLoading && !refreshing) {
    return <HomeSkeleton />;
  }

  // === 사이클 이름 입력 모달 ===
  function renderNameModal() {
    return (
      <Modal visible={showNameModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowNameModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>사이클 이름</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="예: 출퇴근 불만, 직장 스트레스"
              placeholderTextColor={colors.textTertiary}
              value={cycleName}
              onChangeText={setCycleName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button title="취소" variant="outline" onPress={() => setShowNameModal(false)} style={{ flex: 1 }} />
              <Button title="시작하기" onPress={handleConfirmName} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  // === 사이클 종료 확인 모달 ===
  function renderEndModal() {
    return (
      <Modal visible={showEndModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowEndModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>사이클 종료</Text>
            <Text style={styles.endModalText}>정말 사이클을 종료할까요?{'\n'}종료 후에도 기록과 아이디어는 보존됩니다.</Text>
            <View style={styles.modalButtons}>
              <Button title="취소" variant="outline" onPress={() => setShowEndModal(false)} style={{ flex: 1 }} />
              <Button title="종료하기" onPress={handleEndCycle} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  // === 사이클 미시작 상태 ===
  if (cycleStatus === 'not_started') {
    return (
      <>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.notStartedContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <View style={styles.startSection}>
            <Text style={styles.emptyTitle}>새로운 사이클을 시작해보세요</Text>
            <Text style={styles.emptySubtitle}>매일 불편함을 기록하고{'\n'}AI가 사업 아이디어를 만들어드려요</Text>
            <Button title="사이클 시작하기" onPress={() => { setCycleName(''); setShowNameModal(true); }} />
          </View>

          {pastCycles.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>이전 사이클</Text>
              {loadingCycles ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                pastCycles.map((cycle) => (
                  <Pressable key={cycle.id} style={styles.historyCard} onPress={() => router.push({ pathname: '/cycle-detail', params: { cycleId: cycle.id! } })}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyName}>{cycle.name}</Text>
                      <View style={styles.badgeCompleted}>
                        <Text style={styles.badgeTextCompleted}>완료</Text>
                      </View>
                    </View>
                    <Text style={styles.historyDate}>
                      {formatDate(cycle.createdAt)}{cycle.completedAt ? ` ~ ${formatDate(cycle.completedAt)}` : ''}
                    </Text>
                    <Text style={styles.historyStats}>기록 {cycle.complaintCount}개</Text>
                  </Pressable>
                ))
              )}
              {pastCycles.length >= 5 && (
                <Pressable onPress={() => router.push('/cycle-history')} style={styles.moreButton}>
                  <Text style={styles.moreButtonText}>더보기</Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
        {renderNameModal()}
      </>
    );
  }

  // === 사이클 진행 중 (대시보드) ===
  const allComplaints = [...currentComplaints].reverse();

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* 1. 사이클 헤더 */}
        <CycleHeader
          cycleName={currentCycle?.name ?? '사이클'}
          status={cycleStatus}
          recordCount={currentComplaints.length}
          startDate={currentCycle?.createdAt ?? null}
        />

        {/* 2. 진행률 도트 */}
        <CycleProgress count={currentComplaints.length} status={cycleStatus} />

        {/* 3. 액션 버튼 */}
        <View style={styles.actionSection}>
          {generating ? (
            <View style={styles.generatingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.generatingText}>아이디어 생성 중...</Text>
            </View>
          ) : cycleStatus === 'ready' ? (
            <>
              <Button title="아이디어 생성하기" onPress={handleAnalyze} />
              <Button title="기록 더 하기" variant="outline" onPress={handleRecord} style={{ marginTop: spacing.sm }} />
            </>
          ) : cycleStatus === 'early_analysis' ? (
            <>
              <Button title="기록하기" onPress={handleRecord} />
              <Button title="조기 분석하기" variant="outline" onPress={handleAnalyze} style={{ marginTop: spacing.sm }} />
            </>
          ) : (
            <Button title="기록하기" onPress={handleRecord} />
          )}
        </View>

        {/* 4. 오늘의 영감 */}
        <Text style={styles.sectionTitle}>오늘의 영감</Text>
        <QuestionCard question={question} collapsible />

        {/* 5. 기록 목록 */}
        {allComplaints.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>기록 ({allComplaints.length}개)</Text>
            {allComplaints.map((c) => (
              <ComplaintItem key={c.id} complaint={c} />
            ))}
          </View>
        )}

        {/* 6. 사이클 종료 */}
        <Pressable onPress={() => setShowEndModal(true)} style={styles.endCycleButton}>
          <Text style={styles.endCycleText}>사이클 종료</Text>
        </Pressable>
      </ScrollView>
      {renderNameModal()}
      {renderEndModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl },
  notStartedContent: { padding: spacing.xl },
  startSection: { alignItems: 'center', paddingVertical: spacing['4xl'] },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, marginBottom: spacing.sm, textAlign: 'center' },
  emptySubtitle: { fontSize: fontSize.md, color: colors.textTertiary, textAlign: 'center', marginBottom: spacing['3xl'], lineHeight: lineHeight.normal },
  actionSection: { marginBottom: spacing.xl },
  generatingBox: { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  generatingText: { fontSize: fontSize.base, color: colors.textTertiary },
  recentSection: { marginTop: spacing.md },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAllText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  endCycleButton: { alignItems: 'center', paddingVertical: spacing.xl, marginTop: spacing.lg },
  endCycleText: { fontSize: fontSize.sm, color: colors.textTertiary },
  endModalText: { fontSize: fontSize.base, color: colors.textSecondary, lineHeight: lineHeight.normal, marginBottom: spacing.lg },
  historySection: { marginTop: spacing.xl },
  historyCard: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  historyName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.text },
  historyDate: { fontSize: fontSize.sm, color: colors.textTertiary, marginBottom: spacing.xs },
  historyStats: { fontSize: fontSize.sm, color: colors.textSecondary },
  badgeCompleted: { backgroundColor: colors.successBg, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeTextCompleted: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.success },
  moreButton: { alignItems: 'center', padding: spacing.md },
  moreButtonText: { fontSize: fontSize.base, color: colors.primary, fontWeight: fontWeight.semibold },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, width: '100%', maxWidth: 400,
  },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.lg },
  modalInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md,
    fontSize: fontSize.base, color: colors.text, marginBottom: spacing.lg,
  },
  modalButtons: { flexDirection: 'row', gap: spacing.md },
});
