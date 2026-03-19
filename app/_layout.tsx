import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { useCycle } from '../hooks/useCycle';
import { updateUser } from '../services/firestore';
import NotificationTimeSheet from '../components/NotificationTimeSheet';

export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { scheduleDaily } = useNotification();
  const { userData } = useCycle();
  const [showTimeSheet, setShowTimeSheet] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  useEffect(() => {
    if (user && userData && !userData.notificationTimeSet) {
      setShowTimeSheet(true);
    }
  }, [user, userData]);

  useEffect(() => {
    if (userData?.notificationTime && userData.notificationTimeSet) {
      const [h, m] = userData.notificationTime.split(':').map(Number);
      scheduleDaily(h, m);
    }
  }, [userData?.notificationTime]);

  const handleSaveTime = async (time: string) => {
    if (!user) return;
    await updateUser(user.uid, { notificationTime: time, notificationTimeSet: true });
    const [h, m] = time.split(':').map(Number);
    await scheduleDaily(h, m);
    setShowTimeSheet(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Slot />
      <NotificationTimeSheet
        visible={showTimeSheet}
        currentTime="21:00"
        onSave={handleSaveTime}
        onClose={() => handleSaveTime('21:00')}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
