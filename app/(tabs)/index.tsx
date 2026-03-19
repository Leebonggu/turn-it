import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCycle } from '../../hooks/useCycle';
import { QUESTIONS } from '../../constants/questions';
import { getQuestionForCycle } from '../../utils/cycle';
import QuestionCard from '../../components/QuestionCard';
import CycleProgress from '../../components/CycleProgress';
import Button from '../../components/ui/Button';

export default function HomeScreen() {
  const router = useRouter();
  const { userData, currentComplaints, cycleStatus, todayRecorded, startCycle, resetCurrentCycle, refresh } = useCycle();

  const questionIndex = getQuestionForCycle(currentComplaints.length, QUESTIONS.length);
  const question = QUESTIONS[questionIndex];

  const handleRecord = () => {
    router.push({ pathname: '/record', params: { questionId: question.id } });
  };

  const handleAnalyze = () => {
    router.push({ pathname: '/(tabs)/ideas', params: { analyze: 'true' } });
  };

  if (cycleStatus === 'not_started') {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>새로운 사이클을 시작해보세요</Text>
          <Text style={styles.emptySubtitle}>매일 불편함을 기록하고{'\n'}AI가 사업 아이디어를 만들어드려요</Text>
          <Button title="사이클 시작하기" onPress={startCycle} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>오늘의 질문</Text>
      <QuestionCard question={question} />

      {todayRecorded ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>오늘 기록 완료!</Text>
        </View>
      ) : (
        <Button title="기록하기" onPress={handleRecord} style={{ marginTop: 16 }} />
      )}

      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>사이클 진행률</Text>
      <CycleProgress count={currentComplaints.length} />

      {cycleStatus === 'early_analysis' && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.warningText}>
            아직 기록이 부족해요. 더 기록하면 더 좋은 아이디어가 나올 수 있어요
          </Text>
          <Button title="조기 분석하기" onPress={handleAnalyze} variant="outline" />
        </View>
      )}

      {cycleStatus === 'ready' && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.readyText}>기록이 충분해요! 아이디어를 만들어볼까요?</Text>
          <Button title="아이디어 생성하기" onPress={handleAnalyze} />
          <Button
            title="새로운 사이클 시작하기"
            variant="outline"
            onPress={resetCurrentCycle}
            style={{ marginTop: 12 }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  doneBox: {
    marginTop: 16, padding: 16, backgroundColor: '#ECFDF5', borderRadius: 12, alignItems: 'center',
  },
  doneText: { fontSize: 16, fontWeight: '600', color: '#059669' },
  warningText: { fontSize: 14, color: '#D97706', marginBottom: 12, lineHeight: 20 },
  readyText: { fontSize: 16, fontWeight: '600', color: '#4F46E5', marginBottom: 12 },
});
