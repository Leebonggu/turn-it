import { View, Text, StyleSheet } from 'react-native';

export default function ComplaintsScreen() {
  return (
    <View style={styles.container}>
      <Text>불만 목록</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
