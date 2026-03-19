import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { signInWithGoogle } from '../../services/auth';
import Button from '../../components/ui/Button';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      signInWithGoogle(id_token).catch((e) => Alert.alert('로그인 실패', e.message));
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>불만기록</Text>
        <Text style={styles.subtitle}>일상의 불편함을 사업 아이디어로</Text>
      </View>
      <View style={styles.buttons}>
        <Button
          title="Google로 시작하기"
          onPress={() => promptAsync()}
          disabled={!request}
        />
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
});
