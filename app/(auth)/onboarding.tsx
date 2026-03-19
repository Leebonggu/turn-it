import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions, ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../components/ui/Button';
import { colors, spacing, fontSize, fontWeight, lineHeight } from '../../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: '매일 하나의 질문',
    description: '매일 다른 질문으로\n일상 속 불편함을 발견해요',
    icon: '💬',
  },
  {
    id: '2',
    title: '7개 모이면 분석',
    description: '기록이 쌓이면 AI가\n사업 아이디어로 바꿔드려요',
    icon: '🧠',
  },
  {
    id: '3',
    title: '아이디어 관리',
    description: '관심있는 아이디어를 저장하고\n새로운 사이클을 시작하세요',
    icon: '💡',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>

        <Button
          title={currentIndex === SLIDES.length - 1 ? '시작하기' : '다음'}
          onPress={handleNext}
        />

        {currentIndex < SLIDES.length - 1 && (
          <Button title="건너뛰기" variant="outline" onPress={handleSkip} style={{ marginTop: spacing.sm }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  icon: { fontSize: 64, marginBottom: spacing['3xl'] },
  title: {
    fontSize: fontSize['3xl'], fontWeight: fontWeight.bold,
    color: colors.text, marginBottom: spacing.md, textAlign: 'center',
  },
  description: {
    fontSize: fontSize.lg, color: colors.textTertiary,
    textAlign: 'center', lineHeight: lineHeight.relaxed,
  },
  footer: { padding: spacing['2xl'], paddingBottom: spacing['4xl'] },
  dots: {
    flexDirection: 'row', justifyContent: 'center',
    gap: spacing.sm, marginBottom: spacing['2xl'],
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  dotActive: { backgroundColor: colors.primary, width: 24 },
});
