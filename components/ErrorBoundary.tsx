import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './ui/Button';
import { colors, spacing, fontSize, fontWeight, lineHeight } from '../theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>문제가 발생했어요</Text>
          <Text style={styles.message}>
            앱에 예기치 않은 오류가 발생했습니다.{'\n'}다시 시도해주세요.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{this.state.error.message}</Text>
            </View>
          )}
          <Button title="다시 시도" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: spacing['2xl'], backgroundColor: colors.bg,
  },
  title: {
    fontSize: fontSize['2xl'], fontWeight: fontWeight.bold,
    color: colors.text, marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.md, color: colors.textTertiary,
    textAlign: 'center', lineHeight: lineHeight.normal, marginBottom: spacing['3xl'],
  },
  errorBox: {
    backgroundColor: colors.errorBg, borderRadius: 12,
    padding: spacing.lg, marginBottom: spacing['2xl'], width: '100%',
  },
  errorText: {
    fontSize: fontSize.sm, color: colors.error, fontFamily: 'monospace',
  },
});
