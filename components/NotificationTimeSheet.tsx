import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet from './ui/BottomSheet';
import Button from './ui/Button';

interface NotificationTimeSheetProps {
  visible: boolean;
  currentTime: string;
  onSave: (time: string) => void;
  onClose: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

export default function NotificationTimeSheet({
  visible, currentTime, onSave, onClose,
}: NotificationTimeSheetProps) {
  const [selected, setSelected] = useState(currentTime);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="알림 시간 설정">
      <Text style={styles.desc}>매일 이 시간에 기록 알림을 보내드려요</Text>
      <View style={styles.grid}>
        {HOURS.filter((_, i) => i >= 7 && i <= 23).map((hour) => (
          <Button
            key={hour}
            title={hour}
            variant={selected === hour ? 'primary' : 'outline'}
            onPress={() => setSelected(hour)}
            style={styles.hourBtn}
          />
        ))}
      </View>
      <Button
        title="확인"
        onPress={() => onSave(selected)}
        style={{ marginTop: 20 }}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hourBtn: { paddingVertical: 10, paddingHorizontal: 14 },
});
