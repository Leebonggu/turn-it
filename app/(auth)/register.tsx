import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { signUpWithEmail } from '../../services/auth';
import Button from '../../components/ui/Button';
import { colors, spacing, fontSize, fontWeight, radius } from '../../theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setError(null);
    setIsSigningUp(true);
    try {
      await signUpWithEmail(email.trim(), password, displayName.trim() || undefined);
    } catch (e: any) {
      const code = e.code;
      if (code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else if (code === 'auth/invalid-email') {
        setError('올바른 이메일 형식을 입력해주세요.');
      } else if (code === 'auth/weak-password') {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>불만을 아이디어로 바꿔보세요</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="닉네임 (선택)"
          placeholderTextColor={colors.textTertiary}
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor={colors.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 (6자 이상)"
          placeholderTextColor={colors.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          placeholderTextColor={colors.textTertiary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isSigningUp ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>회원가입 중...</Text>
          </View>
        ) : (
          <Button title="회원가입" onPress={handleSignUp} />
        )}

        <Pressable onPress={() => router.back()}>
          <Text style={styles.linkText}>
            이미 계정이 있으신가요? <Text style={styles.linkBold}>로그인</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing['2xl'], backgroundColor: colors.surface },
  header: { alignItems: 'center', marginBottom: spacing['4xl'] },
  title: { fontSize: fontSize['4xl'], fontWeight: fontWeight.bold, marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.lg, color: colors.textTertiary },
  form: { gap: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  loadingBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  loadingText: { fontSize: fontSize.lg, color: colors.textTertiary },
  errorBox: { backgroundColor: colors.errorBg, borderRadius: radius.md, padding: spacing.md },
  errorText: { fontSize: fontSize.sm, color: colors.error, textAlign: 'center' },
  linkText: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  linkBold: { color: colors.primary, fontWeight: fontWeight.semibold },
});
