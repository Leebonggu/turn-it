import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useCycleStore } from '../stores/cycleStore';
import { addComplaint, startNewCycle } from '../services/firestore';
import { QUESTIONS } from '../constants/questions';
import { Tag } from '../types';
import TagSelector from '../components/TagSelector';
import QuestionCard from '../components/QuestionCard';
import Button from '../components/ui/Button';

const MAX_LENGTH = 200;

export default function RecordScreen() {
  const router = useRouter();
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const { firebaseUser } = useAuthStore();
  const { userData } = useCycleStore();

  const question = QUESTIONS.find((q) => q.id === questionId) ?? QUESTIONS[0];

  const [content, setContent] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleTag = (tag: Tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('내용을 입력해주세요');
      return;
    }
    if (!firebaseUser) return;

    setIsSaving(true);
    try {
      let cycleId = userData?.currentCycleId;
      if (!cycleId) {
        cycleId = await startNewCycle(firebaseUser.uid);
      }

      await addComplaint({
        userId: firebaseUser.uid,
        questionId: question.id,
        content: content.trim(),
        tags,
        cycleId,
      });

      router.back();
    } catch (e: any) {
      Alert.alert('저장 실패', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <QuestionCard question={question} />

        <Text style={styles.label}>오늘의 불편함을 적어주세요</Text>
        <TextInput
          style={styles.input}
          multiline
          maxLength={MAX_LENGTH}
          placeholder="어떤 점이 불편하셨나요?"
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{content.length}/{MAX_LENGTH}</Text>

        <Text style={styles.label}>태그 선택</Text>
        <TagSelector selected={tags} onToggle={toggleTag} />

        <Button
          title="저장하기"
          onPress={handleSave}
          disabled={!content.trim() || isSaving}
          style={{ marginTop: 32 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 24, marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    fontSize: 16, minHeight: 120, borderWidth: 1, borderColor: '#E5E7EB',
  },
  charCount: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },
});
