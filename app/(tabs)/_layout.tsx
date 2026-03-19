import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="complaints"
        options={{
          title: '기록',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: '아이디어',
          tabBarIcon: ({ color }) => <Text style={{ color }}>💡</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => <Text style={{ color }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
