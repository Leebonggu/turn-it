import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useCycleStore } from '../../stores/cycleStore';
import { useToast } from '../../hooks/useToast';
import { updateUser } from '../../services/firestore';
import { signOut } from '../../services/auth';
import Button from '../../components/ui/Button';
import NotificationTimeSheet from '../../components/NotificationTimeSheet';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const { userData } = useCycleStore();
  const { showToast } = useToast();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSaveTime = async (time: string) => {
    if (!firebaseUser) return;
    try {
      await updateUser(firebaseUser.uid, { notificationTime: time, notificationTimeSet: true });
      setShowTimePicker(false);
      showToast('알림 시간이 변경되었어요.', 'success');
    } catch (e) {
      showToast('저장에 실패했어요. 다시 시도해주세요.', 'error');
    }
  };

  const handleSignOut = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>알림 시간</Text>
        <Button
          title={userData?.notificationTime ?? '21:00'}
          variant="outline"
          onPress={() => setShowTimePicker(true)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>사이클</Text>
        <Button
          title="사이클 히스토리"
          variant="outline"
          onPress={() => router.push('/cycle-history')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>계정</Text>
        <Text style={styles.email}>{firebaseUser?.email}</Text>
        <Button title="로그아웃" variant="outline" onPress={handleSignOut} />
      </View>

      <NotificationTimeSheet
        visible={showTimePicker}
        currentTime={userData?.notificationTime ?? '21:00'}
        onSave={handleSaveTime}
        onClose={() => setShowTimePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  section: { marginBottom: spacing['3xl'] },
  label: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.md },
  email: { fontSize: fontSize.base, color: colors.textTertiary, marginBottom: spacing.md },
});
