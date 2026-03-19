import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useCycle } from '../../hooks/useCycle';
import { useToast } from '../../hooks/useToast';
import { QUESTIONS } from '../../constants/questions';
import { getQuestionForCycle } from '../../utils/cycle';
import QuestionCard from '../../components/QuestionCard';
import CycleProgress from '../../components/CycleProgress';
import HomeSkeleton from '../../components/HomeSkeleton';
import Button from '../../components/ui/Button';
import { colors, spacing, fontSize, fontWeight, lineHeight } from '../../theme';

export default function HomeScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { userData, currentComplaints, cycleStatus, todayRecorded, isLoading, startCycle, resetCurrentCycle, refresh } = useCycle();
  const [refreshing, setRefreshing] = useState(false);

  const questionIndex = getQuestionForCycle(currentComplaints.length, QUESTIONS.length);
  const question = QUESTIONS[questionIndex];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleRecord = () => {
    router.push({ pathname: '/record', params: { questionId: question.id } });
  };

  const handleAnalyze = () => {
    router.push({ pathname: '/(tabs)/ideas', params: { analyze: 'true' } });
  };

  const handleStartCycle = async () => {
    await startCycle();
    showToast('새 사이클이 시작되었어요!', 'success');
  };

  const handleResetCycle = async () => {
    await resetCurrentCycle();
    showToast('새 사이클이 시작되었어요!', 'success');
  };

  if (isLoading && !refreshing) {
    return <HomeSkeleton />;
  }

  if (cycleStatus === 'not_started') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centered}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Text style={styles.emptyTitle}>새로운 사이클을 시작해보세요</Text>
        <Text style={styles.emptySubtitle}>매일 불편함을 기록하고{'\n'}AI가 사업 아이디어를 만들어드려요</Text>
        <Button title="사이클 시작하기" onPress={handleStartCycle} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Text style={styles.sectionTitle}>오늘의 질문</Text>
      <QuestionCard question={question} />

      {todayRecorded ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>오늘 기록 완료!</Text>
        </View>
      ) : (
        <Button title="기록하기" onPress={handleRecord} style={{ marginTop: spacing.lg }} />
      )}

      <Text style={[styles.sectionTitle, { marginTop: spacing['3xl'] }]}>사이클 진행률</Text>
      <CycleProgress count={currentComplaints.length} />

      {cycleStatus === 'early_analysis' && (
        <View style={{ marginTop: spacing['2xl'] }}>
          <Text style={styles.warningText}>
            아직 기록이 부족해요. 더 기록하면 더 좋은 아이디어가 나올 수 있어요
          </Text>
          <Button title="조기 분석하기" onPress={handleAnalyze} variant="outline" />
        </View>
      )}

      {cycleStatus === 'ready' && (
        <View style={{ marginTop: spacing['2xl'] }}>
          <Text style={styles.readyText}>기록이 충분해요! 아이디어를 만들어볼까요?</Text>
          <Button title="아이디어 생성하기" onPress={handleAnalyze} />
          <Button
            title="새로운 사이클 시작하기"
            variant="outline"
            onPress={handleResetCycle}
            style={{ marginTop: spacing.md }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, marginBottom: spacing.sm, textAlign: 'center' },
  emptySubtitle: { fontSize: fontSize.md, color: colors.textTertiary, textAlign: 'center', marginBottom: spacing['3xl'], lineHeight: lineHeight.normal },
  doneBox: {
    marginTop: spacing.lg, padding: spacing.lg, backgroundColor: colors.successBg, borderRadius: 12, alignItems: 'center',
  },
  doneText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.success },
  warningText: { fontSize: fontSize.base, color: colors.warning, marginBottom: spacing.md, lineHeight: lineHeight.tight },
  readyText: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.primary, marginBottom: spacing.md },
});
