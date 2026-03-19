import { View, Text, StyleSheet } from 'react-native';

export default function IdeasScreen() {
  return (
    <View style={styles.container}>
      <Text>아이디어 목록</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
