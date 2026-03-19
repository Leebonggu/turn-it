import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithGoogle } from '../../services/auth';
import Button from '../../components/ui/Button';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      setIsSigningIn(true);
      setError(null);
      signInWithGoogle(id_token)
        .catch((e) => setError(e.message))
        .finally(() => setIsSigningIn(false));
    } else if (response?.type === 'error') {
      setError('Google 인증에 실패했습니다. 다시 시도해주세요.');
    }
  }, [response]);

  const handlePress = () => {
    setError(null);
    promptAsync();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>불만기록</Text>
        <Text style={styles.subtitle}>일상의 불편함을 사업 아이디어로</Text>
      </View>

      <View style={styles.buttons}>
        {isSigningIn ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>로그인 중...</Text>
          </View>
        ) : (
          <Button
            title="Google로 시작하기"
            onPress={handlePress}
            disabled={!request}
          />
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="다시 시도"
              variant="outline"
              onPress={handlePress}
              disabled={!request}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing['2xl'], backgroundColor: colors.surface },
  header: { alignItems: 'center', marginBottom: spacing['4xl'] },
  title: { fontSize: fontSize['4xl'], fontWeight: fontWeight.bold, marginBottom: spacing.sm },
  subtitle: { fontSize: fontSize.lg, color: colors.textTertiary },
  buttons: { gap: spacing.md },
  loadingBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  loadingText: { fontSize: fontSize.lg, color: colors.textTertiary },
  errorBox: { backgroundColor: colors.errorBg, borderRadius: 12, padding: spacing.lg, gap: spacing.md },
  errorText: { fontSize: fontSize.base, color: colors.error, textAlign: 'center' },
});
