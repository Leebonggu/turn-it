import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithGoogle, signInWithEmail } from '../../services/auth';
import Button from '../../components/ui/Button';
import { colors, spacing, fontSize, fontWeight, radius } from '../../theme';

export default function LoginScreen() {
  const router = useRouter();
  const [request, response, promptAsync] = Platform.OS !== 'web'
    ? Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      })
    : [null, null, null];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      setIsSigningIn(true);
      setError(null);
      signInWithGoogle(id_token)
        .catch((e: Error) => setError(e.message))
        .finally(() => setIsSigningIn(false));
    } else if (response?.type === 'error') {
      setError('Google 인증에 실패했습니다. 다시 시도해주세요.');
    }
  }, [response]);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (e: any) {
      const code = e.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (code === 'auth/invalid-email') {
        setError('올바른 이메일 형식을 입력해주세요.');
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    if (Platform.OS === 'web') {
      setIsSigningIn(true);
      try {
        await signInWithGoogle();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsSigningIn(false);
      }
    } else {
      promptAsync?.();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>불만기록</Text>
        <Text style={styles.subtitle}>일상의 불편함을 사업 아이디어로</Text>
      </View>

      <View style={styles.form}>
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
          placeholder="비밀번호"
          placeholderTextColor={colors.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isSigningIn ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>로그인 중...</Text>
          </View>
        ) : (
          <>
            <Button title="로그인" onPress={handleEmailLogin} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title="Google로 시작하기"
              variant="outline"
              onPress={handleGoogleLogin}
              disabled={Platform.OS !== 'web' && !request}
            />
          </>
        )}

        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.linkText}>
            계정이 없으신가요? <Text style={styles.linkBold}>회원가입</Text>
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
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: fontSize.sm, color: colors.textTertiary },
  linkText: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  linkBold: { color: colors.primary, fontWeight: fontWeight.semibold },
});
