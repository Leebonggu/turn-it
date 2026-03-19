# 불만 기록 & 사업 아이디어 추천 앱 — MVP 구현 플랜

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 매일 불만을 기록하고 7개 모이면 AI가 사업 아이디어를 생성해주는 모바일 앱 MVP

**Architecture:** Expo (React Native) + Firebase Auth/Firestore + Zustand + Expo Notifications (로컬) + Gemini Flash API (클라이언트 직접 호출)

**Tech Stack:** TypeScript, Expo SDK 51+, Expo Router, Firebase JS SDK, Zustand, Expo Notifications, Google Gemini API

**스펙 문서:** `docs/mvp-design.md`

**작업 시간:** 평일 30분~1시간, 주말 몰아서 | 목표: 4주 내 완성

### 스펙 대비 변경사항

- `User` 모델에 `currentCycleId: string | null` 추가 — 현재 사이클 참조를 위해 필요. 스펙의 `cycleStartedAt`만으로는 cycleId 역추적이 불안정.
- `User` 모델에 `notificationTimeSet: boolean` 추가 — 스펙의 "초기 알림 시간 설정" 요구사항 구현용.
- 사이클 로직은 **기록 개수 기반**(3개/7개)으로 통일. 스펙 상단의 "7일 사이클"은 마케팅 표현이고, 스펙 상세 섹션의 "3개 미만/3~6개/7개 이상"이 실제 구현 기준.
- complaints 복합 인덱스는 `createdAt ASC` 사용 (스펙 테이블은 DESC로 기재되어 있으나, AI 프롬프트와 getTodayComplaint 모두 ASC 정렬이 필요하므로 ASC로 변경).
- MVP에서는 Google 로그인만 구현. Apple 로그인은 App Store 제출 전에 추가.

---

## 파일 구조

```
/
├── app/
│   ├── _layout.tsx                 # 루트 레이아웃 (AuthProvider 감싸기)
│   ├── (auth)/
│   │   ├── _layout.tsx             # 인증 레이아웃
│   │   └── login.tsx               # 로그인 화면
│   ├── (tabs)/
│   │   ├── _layout.tsx             # 탭 레이아웃
│   │   ├── index.tsx               # 홈 (오늘의 질문 + 사이클 현황)
│   │   ├── complaints.tsx          # 불만 목록
│   │   ├── ideas.tsx               # 아이디어 목록
│   │   └── settings.tsx            # 설정
│   ├── record.tsx                  # 기록 입력 화면
│   └── idea/
│       └── [id].tsx                # 아이디어 상세
├── components/
│   ├── ui/
│   │   ├── Button.tsx              # 공통 버튼
│   │   ├── Card.tsx                # 공통 카드
│   │   ├── Toast.tsx               # 토스트 메시지
│   │   └── BottomSheet.tsx         # 바텀시트 (알림 시간 설정용)
│   ├── QuestionCard.tsx            # 오늘의 질문 카드
│   ├── ComplaintItem.tsx           # 불만 목록 아이템
│   ├── IdeaCard.tsx                # 아이디어 카드
│   ├── TagSelector.tsx             # 태그 선택 컴포넌트
│   ├── CycleProgress.tsx           # 사이클 진행률 (n/7)
│   └── NotificationTimeSheet.tsx   # 알림 시간 설정 바텀시트
├── hooks/
│   ├── useAuth.ts                  # 인증 상태 훅
│   ├── useCycle.ts                 # 사이클 로직 훅
│   └── useNotification.ts         # 로컬 알림 훅
├── services/
│   ├── firebase.ts                 # Firebase 초기화
│   ├── auth.ts                     # 인증 함수 (Google/Apple 로그인)
│   ├── firestore.ts                # Firestore CRUD
│   └── ai.ts                       # Gemini API 호출 + 응답 파싱
├── stores/
│   ├── authStore.ts                # 인증 상태 (Zustand)
│   └── cycleStore.ts               # 사이클 상태 (Zustand)
├── constants/
│   ├── questions.ts                # 질문 풀 (10개)
│   └── tags.ts                     # 태그 목록
├── types/
│   └── index.ts                    # 공통 타입 정의
├── utils/
│   ├── cycle.ts                    # 사이클 계산 유틸
│   ├── date.ts                     # 날짜 유틸
│   └── aiParser.ts                 # AI 응답 JSON 파싱
├── firestore.rules                 # Firestore 보안 규칙
├── firestore.indexes.json          # Firestore 복합 인덱스
├── app.config.ts                   # Expo 설정
└── .env                            # 환경 변수 (EXPO_PUBLIC_AI_API_KEY 등)
```

---

## Chunk 1: 프로젝트 초기 세팅 + 인증 (Week 1)

### Task 1: Expo 프로젝트 생성 및 의존성 설치

**Files:**
- Create: 프로젝트 전체 (Expo 스캐폴딩)
- Create: `app.config.ts`
- Create: `.env`

- [x] **Step 1: Expo 프로젝트 생성**

```bash
npx create-expo-app@latest . --template blank-typescript
```

- [x] **Step 2: 핵심 의존성 설치**

```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
```

- [x] **Step 3: Firebase 의존성 설치**

```bash
npm install firebase
```

- [x] **Step 4: 추가 의존성 설치**

```bash
npm install zustand expo-notifications expo-device
npx expo install @react-native-async-storage/async-storage
```

- [x] **Step 5: .env 파일 생성**

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_AI_API_KEY=
```

- [x] **Step 6: app.config.ts 설정**

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '불만기록',
  slug: 'complaint-idea',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'complaint-idea',
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.complaint.idea',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#ffffff',
    },
    package: 'com.complaint.idea',
  },
  plugins: [
    'expo-router',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#4F46E5',
      },
    ],
  ],
});
```

- [x] **Step 7: Jest 설정**

```bash
npm install --save-dev jest @types/jest ts-jest jest-expo
```

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
};
```

- [x] **Step 8: 앱 실행 확인**

```bash
npx expo start
```
Expected: Expo 개발 서버 정상 실행

- [x] **Step 9: 커밋**

```bash
git init
git add -A
git commit -m "[설정] Expo 프로젝트 초기 세팅, 의존성 및 Jest 설정"
```

---

### Task 2: 타입 정의 및 상수

**Files:**
- Create: `types/index.ts`
- Create: `constants/tags.ts`
- Create: `constants/questions.ts`

- [x] **Step 1: 공통 타입 정의**

```typescript
// types/index.ts
import { Timestamp } from 'firebase/firestore';

export type Tag = '업무' | '이동' | '쇼핑' | '음식' | '앱/서비스' | '사람관계' | '건강' | '기타';

export interface User {
  email: string;
  displayName: string;
  notificationTime: string; // "21:00"
  notificationTimeSet: boolean;
  cycleStartedAt: Timestamp | null;
  currentCycleId: string | null;
  createdAt: Timestamp;
}

export interface Complaint {
  id?: string;
  userId: string;
  questionId: string;
  content: string; // 최대 200자
  tags: Tag[];
  cycleId: string;
  createdAt: Timestamp;
}

export interface Idea {
  id?: string;
  userId: string;
  cycleId: string;
  title: string;
  basedOnComplaintIds: string[];
  targetCustomer: string;
  solution: string;
  marketPotential: string;
  status: 'interested' | 'pending' | 'discarded';
  createdAt: Timestamp;
}

export interface Question {
  id: string;
  text: string;
  category: Tag;
}
```

- [x] **Step 2: 태그 상수**

```typescript
// constants/tags.ts
import { Tag } from '../types';

export const TAGS: Tag[] = [
  '업무', '이동', '쇼핑', '음식',
  '앱/서비스', '사람관계', '건강', '기타',
];
```

- [x] **Step 3: 질문 풀 (10개)**

```typescript
// constants/questions.ts
import { Question } from '../types';

export const QUESTIONS: Question[] = [
  { id: 'q1', text: '오늘 가장 짜증났던 순간은 언제였나요?', category: '기타' },
  { id: 'q2', text: '오늘 "이건 왜 이렇게밖에 안 되지?"라고 느낀 것은?', category: '앱/서비스' },
  { id: 'q3', text: '오늘 이동하면서 불편했던 점이 있나요?', category: '이동' },
  { id: 'q4', text: '오늘 뭔가를 사려다가 포기한 적 있나요? 왜?', category: '쇼핑' },
  { id: 'q5', text: '오늘 음식과 관련해서 아쉬웠던 점은?', category: '음식' },
  { id: 'q6', text: '오늘 업무 중 가장 비효율적이라고 느낀 것은?', category: '업무' },
  { id: 'q7', text: '오늘 누군가와의 소통에서 불편했던 점은?', category: '사람관계' },
  { id: 'q8', text: '오늘 건강이나 컨디션 때문에 못 한 것이 있나요?', category: '건강' },
  { id: 'q9', text: '오늘 사용한 앱이나 서비스 중 개선하고 싶은 것은?', category: '앱/서비스' },
  { id: 'q10', text: '"누가 이것 좀 만들어줬으면" 하고 바란 적 있나요?', category: '기타' },
];
```

- [x] **Step 4: 커밋**

```bash
git add types/ constants/
git commit -m "[기능] 타입 정의 및 질문/태그 상수 추가"
```

---

### Task 3: Firebase 프로젝트 생성 + 초기화

> **이 태스크는 수동 작업(Firebase 콘솔) + 코드 작업이 섞여 있음**
> `services/firebase.ts`는 이미 생성됨 — `.env`에 값만 채우면 됨

**Files:**
- Modify: `.env` (Firebase config 값 채우기)
- 이미 존재: `services/firebase.ts`

---

#### Part A: Firebase 프로젝트 생성 (콘솔 수동 작업)

- [x] **Step 1: Firebase 프로젝트 만들기**

1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `turn-it` 입력
4. Google 애널리틱스: MVP에서는 **비활성화** (나중에 켜도 됨) → "프로젝트 만들기" 클릭
5. 프로젝트 생성 완료까지 대기 (30초~1분)

- [x] **Step 2: 웹 앱 등록 (Firebase config 값 획득)**

> Expo는 JS SDK를 사용하므로 **웹 앱**으로 등록한다.

1. 프로젝트 대시보드 → 톱니바퀴(⚙️) → "프로젝트 설정"
2. "내 앱" 섹션 → **웹 아이콘(`</>`)** 클릭
3. 앱 닉네임: `turn-it-web` 입력
4. "Firebase Hosting 설정" 체크 해제
5. "앱 등록" 클릭
6. `firebaseConfig` 객체가 표시됨 — 아래 값들을 `.env`에 복사:

```
EXPO_PUBLIC_FIREBASE_API_KEY=여기에_apiKey_값
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=여기에_authDomain_값
EXPO_PUBLIC_FIREBASE_PROJECT_ID=여기에_projectId_값
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=여기에_storageBucket_값
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=여기에_messagingSenderId_값
EXPO_PUBLIC_FIREBASE_APP_ID=여기에_appId_값
```

7. "콘솔로 이동" 클릭

---

#### Part B: Firebase Authentication 활성화

- [x] **Step 3: Authentication 서비스 켜기**

1. Firebase 콘솔 좌측 메뉴 → "빌드" → "Authentication" 클릭
2. "시작하기" 클릭
3. "로그인 방법" 탭으로 이동

- [x] **Step 4: Google 로그인 제공업체 활성화**

1. "새 제공업체 추가" → "Google" 선택
2. "사용 설정" 토글 ON
3. 프로젝트 공개용 이름: `turn-it` (사용자에게 보이는 이름)
4. 프로젝트 지원 이메일: 본인 이메일 선택
5. "저장" 클릭

---

#### Part C: Google OAuth 클라이언트 ID 획득

- [x] **Step 5: 웹 클라이언트 ID 확인**

> Google 로그인 활성화하면 자동으로 OAuth 클라이언트가 생성된다.

1. Firebase 콘솔 → "Authentication" → "로그인 방법" → "Google" 클릭
2. "웹 SDK 구성" 섹션 펼치기
3. **"웹 클라이언트 ID"** 값 복사 → `.env`에 입력:

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=여기에_웹_클라이언트_ID
```

- [ ] **Step 6: iOS 클라이언트 ID 생성 (iOS 테스트 시 필요)**

> Expo Go에서는 웹 클라이언트 ID만으로 동작하지만, EAS 빌드(standalone)에서는 iOS 클라이언트 ID가 필요하다.
> **당장은 스킵해도 됨** — Expo Go 테스트 단계에서는 웹 클라이언트 ID만 있으면 OK.

1. https://console.cloud.google.com/apis/credentials 접속
2. 상단에서 Firebase 프로젝트(`turn-it`) 선택
3. "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
4. 애플리케이션 유형: **iOS**
5. 이름: `turn-it-ios`
6. 번들 ID: `com.turnit.app` (app.json의 `ios.bundleIdentifier`와 동일해야 함)
7. "만들기" 클릭 → 클라이언트 ID 복사 → `.env`에 입력:

```
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=여기에_iOS_클라이언트_ID
```

---

#### Part D: Firestore 데이터베이스 생성

- [x] **Step 7: Firestore 생성**

1. Firebase 콘솔 좌측 메뉴 → "빌드" → "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 위치 선택: **asia-northeast3 (서울)** ← 한국 서비스이므로 서울 리전 선택
4. 보안 규칙: **"테스트 모드에서 시작"** 선택 (30일간 모든 읽기/쓰기 허용)
   - MVP 개발 중에는 테스트 모드로 충분
   - 나중에 Task에서 `firestore.rules` 배포할 예정
5. "만들기" 클릭

---

#### Part E: `.env` 최종 확인 + 코드 검증

- [x] **Step 8: `.env` 파일 값 채우기 확인**

모든 값이 채워졌는지 체크:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...        ← 필수
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=turn-it-xxxxx.firebaseapp.com  ← 필수
EXPO_PUBLIC_FIREBASE_PROJECT_ID=turn-it-xxxxx  ← 필수
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=turn-it-xxxxx.firebasestorage.app  ← 필수
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789  ← 필수
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123  ← 필수
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-xxx.apps.googleusercontent.com  ← 필수
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=               ← 선택 (EAS 빌드 전까지)
EXPO_PUBLIC_AI_API_KEY=                         ← 나중에 (Gemini API 태스크에서)
```

- [x] **Step 9: `services/firebase.ts` 확인**

> 이미 생성되어 있음 — import 경로만 재확인

```typescript
// services/firebase.ts — 이미 존재하는 파일. 변경 불필요.
// getReactNativePersistence import 경로가 'firebase/auth/react-native'인지 확인
import { getReactNativePersistence } from 'firebase/auth/react-native';
// ↑ Firebase JS SDK v12에서는 이 경로가 맞음
// 만약 에러 나면 'firebase/auth'에서 직접 import 시도
```

- [x] **Step 10: 앱 실행해서 Firebase 연결 확인**

```bash
npx expo start
```

- 앱이 크래시 없이 뜨면 Firebase 초기화 성공
- 콘솔에 `Firebase: No Firebase App` 에러가 없으면 OK
- 이 단계에서는 로그인 기능은 아직 없음 — 크래시만 안 나면 통과

- [x] **Step 11: 커밋**

> `.env`는 gitignore 대상이므로 커밋에 포함되지 않음.
> `services/firebase.ts`는 이미 커밋됨 — 변경사항이 있을 때만 커밋.

```bash
# .env가 .gitignore에 있는지 확인
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
git add .gitignore
git commit -m "[설정] .gitignore에 .env 추가"
```

---

### Task 4: 인증 서비스 + 스토어

**Files:**
- Create: `services/auth.ts`
- Create: `stores/authStore.ts`
- Create: `hooks/useAuth.ts`

- [x] **Step 1: 인증 서비스**

```typescript
// services/auth.ts
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  await ensureUserDocument(result.user);
  return result.user;
}

// Apple 로그인은 App Store 제출 전에 추가 (MVP 개발 중에는 Google만)
// export async function signInWithApple(identityToken: string, nonce: string) { ... }

async function ensureUserDocument(firebaseUser: FirebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    const newUser: Omit<User, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName ?? '',
      notificationTime: '21:00',
      notificationTimeSet: false,
      cycleStartedAt: null,
      currentCycleId: null,
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, newUser);
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
}
```

- [x] **Step 2: 인증 스토어**

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  isLoading: true,
  setUser: (user) => set({ firebaseUser: user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

- [x] **Step 3: 인증 훅**

```typescript
// hooks/useAuth.ts
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { subscribeToAuth } from '../services/auth';

export function useAuth() {
  const { firebaseUser, isLoading, setUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuth(setUser);
    return unsubscribe;
  }, [setUser]);

  return { user: firebaseUser, isLoading };
}
```

- [x] **Step 4: 커밋**

```bash
git add services/auth.ts stores/authStore.ts hooks/useAuth.ts
git commit -m "[기능] Firebase 인증 서비스, 스토어, 훅 구현"
```

---

### Task 5: 루트 레이아웃 + 인증 라우팅

**Files:**
- Create: `app/_layout.tsx`
- Create: `app/(auth)/_layout.tsx`
- Create: `app/(auth)/login.tsx`
- Create: `app/(tabs)/_layout.tsx`

- [x] **Step 1: 루트 레이아웃**

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

- [x] **Step 2: 인증 레이아웃**

```typescript
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [x] **Step 3: 인증 관련 추가 의존성 설치**

```bash
npx expo install expo-auth-session expo-crypto expo-web-browser
```

- [x] **Step 4: 로그인 화면 — Google 로그인**

```typescript
// app/(auth)/login.tsx
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { signInWithGoogle } from '../../services/auth';
import Button from '../../components/ui/Button';

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
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
  buttons: { gap: 12 },
});
```

- [x] **Step 5: 탭 레이아웃 (플레이스홀더)**

```typescript
// app/(tabs)/_layout.tsx
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
```

- [x] **Step 6: 탭 화면 플레이스홀더 생성**

```typescript
// app/(tabs)/index.tsx
import { View, Text, StyleSheet } from 'react-native';
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>홈 화면</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
```

동일한 패턴으로 `complaints.tsx`, `ideas.tsx`, `settings.tsx` 생성.

- [x] **Step 7: UI Button 컴포넌트 생성**

```typescript
// components/ui/Button.tsx
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'dark' | 'outline';
  style?: ViewStyle;
}

export default function Button({ title, onPress, disabled, variant = 'primary', style }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'dark' && styles.dark,
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[
        styles.text,
        variant === 'outline' && styles.outlineText,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primary: { backgroundColor: '#4F46E5' },
  dark: { backgroundColor: '#1C1C1E' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#D1D5DB' },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
  outlineText: { color: '#374151' },
});
```

- [ ] **Step 8: 앱 실행 확인**

```bash
npx expo start
```
Expected: 로그인 화면 표시. 로그인 후 탭 화면 이동.

- [x] **Step 9: 커밋**

```bash
git add app/ components/
git commit -m "[기능] 인증 라우팅 및 로그인 화면 구현"
```

---

## Chunk 2: 데이터 레이어 + 핵심 로직 (Week 2 전반)

### Task 6: 유틸리티 함수

**Files:**
- Create: `utils/date.ts`
- Create: `utils/cycle.ts`

- [x] **Step 1: 날짜 유틸**

```typescript
// utils/date.ts

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}
```

- [x] **Step 2: 사이클 유틸에 대한 테스트 작성**

```typescript
// utils/__tests__/cycle.test.ts
import { getQuestionForCycle, getCycleStatus } from '../cycle';

describe('getQuestionForCycle', () => {
  it('returns question at index = recordCount % poolSize', () => {
    expect(getQuestionForCycle(0, 10)).toBe(0);
    expect(getQuestionForCycle(3, 10)).toBe(3);
    expect(getQuestionForCycle(10, 10)).toBe(0);
    expect(getQuestionForCycle(12, 10)).toBe(2);
  });
});

describe('getCycleStatus', () => {
  it('returns "not_started" when count is 0 and no cycle', () => {
    expect(getCycleStatus(0, false)).toBe('not_started');
  });
  it('returns "in_progress" when count < 3', () => {
    expect(getCycleStatus(1, true)).toBe('in_progress');
    expect(getCycleStatus(2, true)).toBe('in_progress');
  });
  it('returns "early_analysis" when count is 3-6', () => {
    expect(getCycleStatus(3, true)).toBe('early_analysis');
    expect(getCycleStatus(6, true)).toBe('early_analysis');
  });
  it('returns "ready" when count >= 7', () => {
    expect(getCycleStatus(7, true)).toBe('ready');
    expect(getCycleStatus(10, true)).toBe('ready');
  });
});
```

- [x] **Step 3: 테스트 실행 — 실패 확인**

```bash
npx jest utils/__tests__/cycle.test.ts
```
Expected: FAIL (모듈 없음)

- [x] **Step 4: 사이클 유틸 구현**

```typescript
// utils/cycle.ts

export type CycleStatus = 'not_started' | 'in_progress' | 'early_analysis' | 'ready';

export function getQuestionForCycle(recordCount: number, poolSize: number): number {
  return recordCount % poolSize;
}

export function getCycleStatus(recordCount: number, hasCycle: boolean): CycleStatus {
  if (!hasCycle || recordCount === 0) return 'not_started';
  if (recordCount < 3) return 'in_progress';
  if (recordCount < 7) return 'early_analysis';
  return 'ready';
}

export function generateCycleId(userId: string): string {
  return `${userId}_${Date.now()}`;
}
```

- [x] **Step 5: 테스트 실행 — 통과 확인**

```bash
npx jest utils/__tests__/cycle.test.ts
```
Expected: PASS

- [x] **Step 6: 커밋**

```bash
git add utils/
git commit -m "[기능] 날짜/사이클 유틸리티 함수 및 테스트"
```

---

### Task 7: Firestore 서비스

**Files:**
- Create: `services/firestore.ts`
- Create: `firestore.rules`
- Create: `firestore.indexes.json`

- [x] **Step 1: Firestore CRUD 서비스**

```typescript
// services/firestore.ts
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  query, where, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Complaint, Idea, Tag } from '../types';

// === Users ===
export async function getUser(userId: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function updateUser(userId: string, data: Partial<User>) {
  await updateDoc(doc(db, 'users', userId), data);
}

// === Complaints ===
export async function addComplaint(data: Omit<Complaint, 'id' | 'createdAt'>) {
  return addDoc(collection(db, 'complaints'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getComplaintsByCycle(userId: string, cycleId: string): Promise<Complaint[]> {
  const q = query(
    collection(db, 'complaints'),
    where('userId', '==', userId),
    where('cycleId', '==', cycleId),
    orderBy('createdAt', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Complaint));
}

export async function getAllComplaints(userId: string): Promise<Complaint[]> {
  const q = query(
    collection(db, 'complaints'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Complaint));
}

export async function getTodayComplaint(userId: string, cycleId: string): Promise<Complaint | null> {
  const complaints = await getComplaintsByCycle(userId, cycleId);
  const today = new Date().toDateString();
  return complaints.find((c) => c.createdAt?.toDate?.().toDateString() === today) ?? null;
}

// === Ideas ===
export async function addIdeas(ideas: Omit<Idea, 'id' | 'createdAt'>[]) {
  const promises = ideas.map((idea) =>
    addDoc(collection(db, 'ideas'), {
      ...idea,
      createdAt: serverTimestamp(),
    })
  );
  return Promise.all(promises);
}

export async function getIdeasByCycle(userId: string, cycleId: string): Promise<Idea[]> {
  const q = query(
    collection(db, 'ideas'),
    where('userId', '==', userId),
    where('cycleId', '==', cycleId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Idea));
}

export async function getAllIdeas(userId: string): Promise<Idea[]> {
  const q = query(
    collection(db, 'ideas'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Idea));
}

export async function getIdea(ideaId: string): Promise<Idea | null> {
  const snap = await getDoc(doc(db, 'ideas', ideaId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Idea) : null;
}

export async function updateIdeaStatus(ideaId: string, status: Idea['status']) {
  await updateDoc(doc(db, 'ideas', ideaId), { status });
}

// === Cycle ===
export async function startNewCycle(userId: string): Promise<string> {
  const cycleId = `${userId}_${Date.now()}`;
  await updateUser(userId, {
    cycleStartedAt: Timestamp.now(),
    currentCycleId: cycleId,
  } as Partial<User>);
  return cycleId;
}

export async function resetCycle(userId: string): Promise<string> {
  return startNewCycle(userId);
}
```

- [x] **Step 2: Firestore 보안 규칙**

```
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /complaints/{complaintId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /ideas/{ideaId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

> **Note:** Firestore `list` 규칙에서 `resource.data`를 사용하면 쿼리에 `where('userId', '==', uid)` 필터가 반드시 포함되어야 Firestore가 규칙을 평가할 수 있음. 모든 쿼리에 userId 필터를 포함하고 있으므로 `read`(=`get`+`list`) 통합 규칙으로 충분.

- [x] **Step 3: Firestore 인덱스**

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "complaints",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "cycleId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "complaints",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "ideas",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "cycleId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "ideas",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

- [x] **Step 4: 커밋**

```bash
git add services/firestore.ts firestore.rules firestore.indexes.json
git commit -m "[기능] Firestore 서비스, 보안 규칙, 인덱스 설정"
```

---

### Task 8: 사이클 스토어 + 훅

**Files:**
- Create: `stores/cycleStore.ts`
- Create: `hooks/useCycle.ts`

- [ ] **Step 1: 사이클 스토어**

```typescript
// stores/cycleStore.ts
import { create } from 'zustand';
import { Complaint, User } from '../types';
import { CycleStatus } from '../utils/cycle';

interface CycleState {
  userData: User | null;
  currentComplaints: Complaint[];
  cycleStatus: CycleStatus;
  todayRecorded: boolean;
  isLoading: boolean;
  setUserData: (data: User | null) => void;
  setCurrentComplaints: (complaints: Complaint[]) => void;
  setCycleStatus: (status: CycleStatus) => void;
  setTodayRecorded: (recorded: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useCycleStore = create<CycleState>((set) => ({
  userData: null,
  currentComplaints: [],
  cycleStatus: 'not_started',
  todayRecorded: false,
  isLoading: true,
  setUserData: (data) => set({ userData: data }),
  setCurrentComplaints: (complaints) => set({ currentComplaints: complaints }),
  setCycleStatus: (status) => set({ cycleStatus: status }),
  setTodayRecorded: (recorded) => set({ todayRecorded: recorded }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

- [ ] **Step 2: 사이클 훅**

```typescript
// hooks/useCycle.ts
import { useEffect, useCallback } from 'react';
import { useCycleStore } from '../stores/cycleStore';
import { useAuthStore } from '../stores/authStore';
import {
  getUser, getComplaintsByCycle, getTodayComplaint, startNewCycle,
} from '../services/firestore';
import { getCycleStatus } from '../utils/cycle';

export function useCycle() {
  const { firebaseUser } = useAuthStore();
  const {
    userData, currentComplaints, cycleStatus, todayRecorded, isLoading,
    setUserData, setCurrentComplaints, setCycleStatus, setTodayRecorded, setLoading,
  } = useCycleStore();

  const refresh = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const user = await getUser(firebaseUser.uid);
      setUserData(user);

      if (user?.currentCycleId) {
        const complaints = await getComplaintsByCycle(firebaseUser.uid, user.currentCycleId);
        setCurrentComplaints(complaints);
        setCycleStatus(getCycleStatus(complaints.length, true));

        const today = await getTodayComplaint(firebaseUser.uid, user.currentCycleId);
        setTodayRecorded(!!today);
      } else {
        setCurrentComplaints([]);
        setCycleStatus('not_started');
        setTodayRecorded(false);
      }
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startCycle = useCallback(async () => {
    if (!firebaseUser) return;
    await startNewCycle(firebaseUser.uid);
    await refresh();
  }, [firebaseUser, refresh]);

  return {
    userData, currentComplaints, cycleStatus, todayRecorded, isLoading,
    refresh, startCycle,
  };
}
```

- [ ] **Step 3: 커밋**

```bash
git add stores/cycleStore.ts hooks/useCycle.ts
git commit -m "[기능] 사이클 상태 관리 스토어 및 훅 구현"
```

---

## Chunk 3: 핵심 화면 구현 (Week 2 후반 ~ Week 3 전반)

### Task 9: 공통 UI 컴포넌트

**Files:**
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Toast.tsx`
- Create: `components/TagSelector.tsx`
- Create: `components/CycleProgress.tsx`
- Create: `components/QuestionCard.tsx`

- [ ] **Step 1: Card 컴포넌트**

```typescript
// components/ui/Card.tsx
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
```

- [ ] **Step 2: TagSelector 컴포넌트**

```typescript
// components/TagSelector.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tag } from '../types';
import { TAGS } from '../constants/tags';

interface TagSelectorProps {
  selected: Tag[];
  onToggle: (tag: Tag) => void;
}

export default function TagSelector({ selected, onToggle }: TagSelectorProps) {
  return (
    <View style={styles.container}>
      {TAGS.map((tag) => (
        <TouchableOpacity
          key={tag}
          style={[styles.tag, selected.includes(tag) && styles.tagSelected]}
          onPress={() => onToggle(tag)}
        >
          <Text style={[styles.tagText, selected.includes(tag) && styles.tagTextSelected]}>
            {tag}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tagSelected: { backgroundColor: '#4F46E5' },
  tagText: { fontSize: 14, color: '#374151' },
  tagTextSelected: { color: '#fff' },
});
```

- [ ] **Step 3: CycleProgress 컴포넌트**

```typescript
// components/CycleProgress.tsx
import { View, Text, StyleSheet } from 'react-native';

interface CycleProgressProps {
  count: number;
  max?: number;
}

export default function CycleProgress({ count, max = 7 }: CycleProgressProps) {
  const progress = Math.min(count / max, 1);

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.text}>{Math.min(count, max)}/{max}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barBackground: {
    flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 4 },
  text: { fontSize: 14, fontWeight: '600', color: '#374151', minWidth: 30 },
});
```

- [ ] **Step 4: QuestionCard 컴포넌트**

```typescript
// components/QuestionCard.tsx
import { Text, StyleSheet } from 'react-native';
import Card from './ui/Card';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.category}>{question.category}</Text>
      <Text style={styles.text}>{question.text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#4F46E5' },
  category: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  text: { fontSize: 18, fontWeight: '600', color: '#fff', lineHeight: 26 },
});
```

- [ ] **Step 5: 커밋**

```bash
git add components/
git commit -m "[기능] 공통 UI 컴포넌트 구현 (Card, TagSelector, CycleProgress, QuestionCard)"
```

---

### Task 10: 홈 화면

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: 홈 화면 구현**

```typescript
// app/(tabs)/index.tsx
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCycle } from '../../hooks/useCycle';
import { QUESTIONS } from '../../constants/questions';
import { getQuestionForCycle } from '../../utils/cycle';
import QuestionCard from '../../components/QuestionCard';
import CycleProgress from '../../components/CycleProgress';
import Button from '../../components/ui/Button';

export default function HomeScreen() {
  const router = useRouter();
  const { userData, currentComplaints, cycleStatus, todayRecorded, startCycle, refresh } = useCycle();

  const questionIndex = getQuestionForCycle(currentComplaints.length, QUESTIONS.length);
  const question = QUESTIONS[questionIndex];

  const handleRecord = () => {
    router.push({ pathname: '/record', params: { questionId: question.id } });
  };

  const handleAnalyze = () => {
    router.push({ pathname: '/(tabs)/ideas', params: { analyze: 'true' } });
  };

  if (cycleStatus === 'not_started') {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>새로운 사이클을 시작해보세요</Text>
          <Text style={styles.emptySubtitle}>매일 불편함을 기록하고{'\n'}AI가 사업 아이디어를 만들어드려요</Text>
          <Button title="사이클 시작하기" onPress={startCycle} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>오늘의 질문</Text>
      <QuestionCard question={question} />

      {todayRecorded ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>오늘 기록 완료!</Text>
        </View>
      ) : (
        <Button title="기록하기" onPress={handleRecord} style={{ marginTop: 16 }} />
      )}

      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>사이클 진행률</Text>
      <CycleProgress count={currentComplaints.length} />

      {cycleStatus === 'early_analysis' && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.warningText}>
            아직 기록이 부족해요. 더 기록하면 더 좋은 아이디어가 나올 수 있어요
          </Text>
          <Button title="조기 분석하기" onPress={handleAnalyze} variant="outline" />
        </View>
      )}

      {cycleStatus === 'ready' && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.readyText}>기록이 충분해요! 아이디어를 만들어볼까요?</Text>
          <Button title="아이디어 생성하기" onPress={handleAnalyze} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  doneBox: {
    marginTop: 16, padding: 16, backgroundColor: '#ECFDF5', borderRadius: 12, alignItems: 'center',
  },
  doneText: { fontSize: 16, fontWeight: '600', color: '#059669' },
  warningText: { fontSize: 14, color: '#D97706', marginBottom: 12, lineHeight: 20 },
  readyText: { fontSize: 16, fontWeight: '600', color: '#4F46E5', marginBottom: 12 },
});
```

- [ ] **Step 2: 커밋**

```bash
git add app/(tabs)/index.tsx
git commit -m "[기능] 홈 화면 구현 (질문 카드, 사이클 진행률, 분석 버튼)"
```

---

### Task 11: 기록 입력 화면

**Files:**
- Create: `app/record.tsx`

- [ ] **Step 1: 기록 입력 화면 구현**

```typescript
// app/record.tsx
import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useCycleStore } from '../stores/cycleStore';
import { addComplaint, startNewCycle } from '../services/firestore';
import { QUESTIONS } from '../constants/questions';
import { Tag } from '../types';
import TagSelector from '../components/TagSelector';
import QuestionCard from '../components/QuestionCard';
import Button from '../components/ui/Button';

const MAX_LENGTH = 200;

export default function RecordScreen() {
  const router = useRouter();
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const { firebaseUser } = useAuthStore();
  const { userData } = useCycleStore();

  const question = QUESTIONS.find((q) => q.id === questionId) ?? QUESTIONS[0];

  const [content, setContent] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleTag = (tag: Tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('내용을 입력해주세요');
      return;
    }
    if (!firebaseUser) return;

    setIsSaving(true);
    try {
      let cycleId = userData?.currentCycleId;
      if (!cycleId) {
        cycleId = await startNewCycle(firebaseUser.uid);
      }

      await addComplaint({
        userId: firebaseUser.uid,
        questionId: question.id,
        content: content.trim(),
        tags,
        cycleId,
      });

      router.back();
    } catch (e: any) {
      Alert.alert('저장 실패', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <QuestionCard question={question} />

        <Text style={styles.label}>오늘의 불편함을 적어주세요</Text>
        <TextInput
          style={styles.input}
          multiline
          maxLength={MAX_LENGTH}
          placeholder="어떤 점이 불편하셨나요?"
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{content.length}/{MAX_LENGTH}</Text>

        <Text style={styles.label}>태그 선택</Text>
        <TagSelector selected={tags} onToggle={toggleTag} />

        <Button
          title="저장하기"
          onPress={handleSave}
          disabled={!content.trim() || isSaving}
          style={{ marginTop: 32 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 24, marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    fontSize: 16, minHeight: 120, borderWidth: 1, borderColor: '#E5E7EB',
  },
  charCount: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },
});
```

- [ ] **Step 2: 커밋**

```bash
git add app/record.tsx
git commit -m "[기능] 불만 기록 입력 화면 구현"
```

---

### Task 12: 불만 목록 화면

**Files:**
- Modify: `app/(tabs)/complaints.tsx`
- Create: `components/ComplaintItem.tsx`

- [ ] **Step 1: ComplaintItem 컴포넌트**

```typescript
// components/ComplaintItem.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Complaint } from '../types';
import { QUESTIONS } from '../constants/questions';
import { formatDate } from '../utils/date';

interface ComplaintItemProps {
  complaint: Complaint;
}

export default function ComplaintItem({ complaint }: ComplaintItemProps) {
  const question = QUESTIONS.find((q) => q.id === complaint.questionId);
  const date = complaint.createdAt?.toDate?.() ? formatDate(complaint.createdAt.toDate()) : '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{date}</Text>
        {question && <Text style={styles.question}>{question.text}</Text>}
      </View>
      <Text style={styles.content}>{complaint.content}</Text>
      {complaint.tags.length > 0 && (
        <View style={styles.tags}>
          {complaint.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  header: { marginBottom: 8 },
  date: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  question: { fontSize: 13, color: '#6B7280', fontStyle: 'italic' },
  content: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { backgroundColor: '#F3F4F6', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  tagText: { fontSize: 12, color: '#6B7280' },
});
```

- [ ] **Step 2: 불만 목록 화면**

```typescript
// app/(tabs)/complaints.tsx
import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { getAllComplaints } from '../../services/firestore';
import { Complaint } from '../../types';
import ComplaintItem from '../../components/ComplaintItem';

export default function ComplaintsScreen() {
  const { firebaseUser } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    const data = await getAllComplaints(firebaseUser.uid);
    setComplaints(data);
    setLoading(false);
  }, [firebaseUser]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={complaints.length === 0 ? styles.centered : styles.list}
      data={complaints}
      keyExtractor={(item) => item.id!}
      renderItem={({ item }) => <ComplaintItem complaint={item} />}
      ListEmptyComponent={<Text style={styles.empty}>아직 기록이 없어요</Text>}
      onRefresh={load}
      refreshing={loading}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 16, color: '#9CA3AF' },
});
```

- [ ] **Step 3: 커밋**

```bash
git add components/ComplaintItem.tsx app/(tabs)/complaints.tsx
git commit -m "[기능] 불만 목록 화면 구현"
```

---

### Task 13: 설정 화면

**Files:**
- Modify: `app/(tabs)/settings.tsx`
- Create: `components/NotificationTimeSheet.tsx`
- Create: `components/ui/BottomSheet.tsx`

- [ ] **Step 1: 간단한 BottomSheet 컴포넌트**

```typescript
// components/ui/BottomSheet.tsx
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { ReactNode } from 'react';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
});
```

- [ ] **Step 2: 알림 시간 설정 바텀시트**

```typescript
// components/NotificationTimeSheet.tsx
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
```

- [ ] **Step 3: 설정 화면**

```typescript
// app/(tabs)/settings.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useCycleStore } from '../../stores/cycleStore';
import { updateUser } from '../../services/firestore';
import { signOut } from '../../services/auth';
import Button from '../../components/ui/Button';
import NotificationTimeSheet from '../../components/NotificationTimeSheet';

export default function SettingsScreen() {
  const { firebaseUser } = useAuthStore();
  const { userData } = useCycleStore();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSaveTime = async (time: string) => {
    if (!firebaseUser) return;
    await updateUser(firebaseUser.uid, { notificationTime: time, notificationTimeSet: true });
    setShowTimePicker(false);
  };

  const handleSignOut = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>알림 시간</Text>
        <Button
          title={userData?.notificationTime ?? '21:00'}
          variant="outline"
          onPress={() => setShowTimePicker(true)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>계정</Text>
        <Text style={styles.email}>{firebaseUser?.email}</Text>
        <Button title="로그아웃" variant="outline" onPress={handleSignOut} />
      </View>

      <NotificationTimeSheet
        visible={showTimePicker}
        currentTime={userData?.notificationTime ?? '21:00'}
        onSave={handleSaveTime}
        onClose={() => setShowTimePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  section: { marginBottom: 32 },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  email: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
});
```

- [ ] **Step 4: 커밋**

```bash
git add components/ui/BottomSheet.tsx components/NotificationTimeSheet.tsx app/(tabs)/settings.tsx
git commit -m "[기능] 설정 화면 및 알림 시간 설정 바텀시트 구현"
```

---

## Chunk 4: AI 연동 + 아이디어 화면 + 알림 (Week 3 후반 ~ Week 4)

### Task 14: AI 서비스 (Gemini Flash)

**Files:**
- Create: `services/ai.ts`
- Create: `utils/aiParser.ts`
- Create: `utils/__tests__/aiParser.test.ts`

- [ ] **Step 1: AI 응답 파서 테스트 작성**

```typescript
// utils/__tests__/aiParser.test.ts
import { parseAiResponse } from '../aiParser';

describe('parseAiResponse', () => {
  it('parses valid JSON array', () => {
    const raw = JSON.stringify([
      { title: 'T', targetCustomer: 'C', solution: 'S', marketPotential: 'M', basedOnComplaintIndexes: [0] },
    ]);
    const result = parseAiResponse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('T');
  });

  it('extracts JSON from markdown code block', () => {
    const raw = '```json\n[{"title":"T","targetCustomer":"C","solution":"S","marketPotential":"M","basedOnComplaintIndexes":[0]}]\n```';
    const result = parseAiResponse(raw);
    expect(result).toHaveLength(1);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseAiResponse('not json')).toThrow();
  });

  it('throws on wrong structure', () => {
    expect(() => parseAiResponse('[{"wrong": "field"}]')).toThrow();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
npx jest utils/__tests__/aiParser.test.ts
```
Expected: FAIL

- [ ] **Step 3: AI 응답 파서 구현**

```typescript
// utils/aiParser.ts

interface RawIdea {
  title: string;
  targetCustomer: string;
  solution: string;
  marketPotential: string;
  basedOnComplaintIndexes: number[];
}

export function parseAiResponse(raw: string): RawIdea[] {
  // 코드블록 제거
  let cleaned = raw.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error('응답이 배열이 아닙니다');
  }

  for (const item of parsed) {
    if (!item.title || !item.targetCustomer || !item.solution || !item.marketPotential) {
      throw new Error('필수 필드가 누락되었습니다');
    }
    if (!Array.isArray(item.basedOnComplaintIndexes)) {
      throw new Error('basedOnComplaintIndexes가 배열이 아닙니다');
    }
  }

  return parsed;
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
npx jest utils/__tests__/aiParser.test.ts
```
Expected: PASS

- [ ] **Step 5: AI 서비스 구현**

```typescript
// services/ai.ts
import { Complaint, Idea } from '../types';
import { parseAiResponse } from '../utils/aiParser';
import { addIdeas } from './firestore';

const API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function buildPrompt(complaints: Complaint[]): string {
  const list = complaints
    .map((c, i) => `${i + 1}. [${c.tags.join(', ')}] ${c.content}`)
    .join('\n');

  return `당신은 사업 아이디어 전문가입니다.
아래는 사용자가 일상에서 느낀 불편함 목록입니다.

[불만 목록]
${list}

위 불편함들을 분석하여, 이를 해결할 수 있는 사업 아이디어 3개를 JSON 형식으로 제안해주세요.

응답 형식:
[
  {
    "title": "아이디어 제목",
    "targetCustomer": "타겟 고객",
    "solution": "해결 방안 (2-3문장)",
    "marketPotential": "시장 가능성 (1-2문장)",
    "basedOnComplaintIndexes": [0, 2]
  }
]

반드시 위 JSON 형식으로만 응답하세요.`;
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    throw new Error(`AI API 오류: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function generateIdeas(
  userId: string,
  cycleId: string,
  complaints: Complaint[],
): Promise<void> {
  const prompt = buildPrompt(complaints);

  let rawResponse: string;
  let ideas: ReturnType<typeof parseAiResponse>;

  // 최대 2회 시도 (1회 + 1회 재시도)
  for (let attempt = 0; attempt < 2; attempt++) {
    rawResponse = await callGemini(prompt);
    try {
      ideas = parseAiResponse(rawResponse);
      break;
    } catch (e) {
      if (attempt === 1) throw new Error('AI 응답을 해석할 수 없습니다. 다시 시도해주세요.');
    }
  }

  const ideaDocs = ideas!.map((idea) => ({
    userId,
    cycleId,
    title: idea.title,
    targetCustomer: idea.targetCustomer,
    solution: idea.solution,
    marketPotential: idea.marketPotential,
    basedOnComplaintIds: idea.basedOnComplaintIndexes
      .filter((i) => i < complaints.length)
      .map((i) => complaints[i].id!),
    status: 'pending' as const,
  }));

  await addIdeas(ideaDocs);
}
```

- [ ] **Step 6: 커밋**

```bash
git add utils/aiParser.ts utils/__tests__/aiParser.test.ts services/ai.ts
git commit -m "[기능] AI 서비스 및 응답 파서 구현 (Gemini Flash)"
```

---

### Task 15: 아이디어 목록 + 상세 화면

**Files:**
- Modify: `app/(tabs)/ideas.tsx`
- Create: `components/IdeaCard.tsx`
- Create: `app/idea/[id].tsx`

- [ ] **Step 1: IdeaCard 컴포넌트**

```typescript
// components/IdeaCard.tsx
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Idea } from '../types';

interface IdeaCardProps {
  idea: Idea;
  onPress: () => void;
}

const STATUS_LABEL = {
  interested: '관심있음',
  pending: '보류',
  discarded: '폐기',
} as const;

const STATUS_COLOR = {
  interested: '#059669',
  pending: '#D97706',
  discarded: '#9CA3AF',
} as const;

export default function IdeaCard({ idea, onPress }: IdeaCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{idea.title}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[idea.status] + '20' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLOR[idea.status] }]}>
            {STATUS_LABEL[idea.status]}
          </Text>
        </View>
      </View>
      <Text style={styles.solution} numberOfLines={2}>{idea.solution}</Text>
      <Text style={styles.target}>{idea.targetCustomer}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#1F2937', flex: 1 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, marginLeft: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  solution: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 8 },
  target: { fontSize: 12, color: '#9CA3AF' },
});
```

- [ ] **Step 2: 아이디어 목록 화면**

```typescript
// app/(tabs)/ideas.tsx
import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useCycleStore } from '../../stores/cycleStore';
import { getAllIdeas } from '../../services/firestore';
import { generateIdeas } from '../../services/ai';
import { Idea } from '../../types';
import IdeaCard from '../../components/IdeaCard';

export default function IdeasScreen() {
  const router = useRouter();
  const { analyze } = useLocalSearchParams<{ analyze?: string }>();
  const { firebaseUser } = useAuthStore();
  const { userData, currentComplaints } = useCycleStore();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    const data = await getAllIdeas(firebaseUser.uid);
    setIdeas(data);
    setLoading(false);
  }, [firebaseUser]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (analyze === 'true' && firebaseUser && userData?.currentCycleId && currentComplaints.length >= 3) {
      handleGenerate();
    }
  }, [analyze]);

  const handleGenerate = async () => {
    if (!firebaseUser || !userData?.currentCycleId) return;
    setGenerating(true);
    try {
      await generateIdeas(firebaseUser.uid, userData.currentCycleId, currentComplaints);
      await load();
    } catch (e: any) {
      Alert.alert('생성 실패', e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading || generating) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        {generating && <Text style={styles.genText}>아이디어 생성 중...</Text>}
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={ideas.length === 0 ? styles.centered : styles.list}
      data={ideas}
      keyExtractor={(item) => item.id!}
      renderItem={({ item }) => (
        <IdeaCard idea={item} onPress={() => router.push(`/idea/${item.id}`)} />
      )}
      ListEmptyComponent={<Text style={styles.empty}>아직 생성된 아이디어가 없어요</Text>}
      onRefresh={load}
      refreshing={loading}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 16, color: '#9CA3AF' },
  genText: { marginTop: 12, fontSize: 14, color: '#6B7280' },
});
```

- [ ] **Step 3: 아이디어 상세 화면**

```typescript
// app/idea/[id].tsx
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getIdea, updateIdeaStatus, getComplaintsByCycle } from '../../services/firestore';
import { useAuthStore } from '../../stores/authStore';
import { Idea, Complaint } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ComplaintItem from '../../components/ComplaintItem';

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { firebaseUser } = useAuthStore();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [relatedComplaints, setRelatedComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id || !firebaseUser) return;
    setLoading(true);
    const ideaData = await getIdea(id);
    setIdea(ideaData);

    if (ideaData) {
      const cycleComplaints = await getComplaintsByCycle(firebaseUser.uid, ideaData.cycleId);
      setRelatedComplaints(
        cycleComplaints.filter((c) => ideaData.basedOnComplaintIds.includes(c.id!))
      );
    }
    setLoading(false);
  };

  const handleStatusChange = async (status: Idea['status']) => {
    if (!id) return;
    await updateIdeaStatus(id, status);
    setIdea((prev) => prev ? { ...prev, status } : null);
  };

  if (loading || !idea) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{idea.title}</Text>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.label}>타겟 고객</Text>
        <Text style={styles.body}>{idea.targetCustomer}</Text>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.label}>해결 방안</Text>
        <Text style={styles.body}>{idea.solution}</Text>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.label}>시장 가능성</Text>
        <Text style={styles.body}>{idea.marketPotential}</Text>
      </Card>

      <Text style={[styles.label, { marginTop: 8, marginBottom: 12 }]}>기반 불만</Text>
      {relatedComplaints.map((c) => (
        <ComplaintItem key={c.id} complaint={c} />
      ))}

      <View style={styles.actions}>
        <Button
          title="관심있음"
          variant={idea.status === 'interested' ? 'primary' : 'outline'}
          onPress={() => handleStatusChange('interested')}
          style={{ flex: 1 }}
        />
        <Button
          title="보류"
          variant={idea.status === 'pending' ? 'primary' : 'outline'}
          onPress={() => handleStatusChange('pending')}
          style={{ flex: 1 }}
        />
        <Button
          title="폐기"
          variant={idea.status === 'discarded' ? 'primary' : 'outline'}
          onPress={() => handleStatusChange('discarded')}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  body: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 24 },
});
```

- [ ] **Step 4: 커밋**

```bash
git add components/IdeaCard.tsx app/(tabs)/ideas.tsx app/idea/
git commit -m "[기능] 아이디어 목록 및 상세 화면 구현"
```

---

### Task 16: 로컬 알림

**Files:**
- Create: `hooks/useNotification.ts`
- Modify: `app/_layout.tsx` (알림 초기화 추가)

- [ ] **Step 1: 알림 훅**

```typescript
// hooks/useNotification.ts
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotification() {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const scheduleDaily = async (hour: number, minute: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '오늘의 불편함을 기록해보세요',
        body: '매일 기록하면 AI가 사업 아이디어를 만들어드려요',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  };

  const cancelAll = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return { scheduleDaily, cancelAll };
}

async function registerForPushNotifications() {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}
```

- [ ] **Step 2: 루트 레이아웃 전체 교체 (알림 + 첫 로그인 바텀시트 통합)**

`app/_layout.tsx`를 아래 전체 코드로 교체:

```typescript
// app/_layout.tsx
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

  // 인증 라우팅
  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  // 첫 로그인 시 알림 시간 설정 바텀시트
  useEffect(() => {
    if (user && userData && !userData.notificationTimeSet) {
      setShowTimeSheet(true);
    }
  }, [user, userData]);

  // 알림 스케줄 등록
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
```

- [ ] **Step 3: 커밋**

```bash
git add hooks/useNotification.ts app/_layout.tsx
git commit -m "[기능] 로컬 알림 및 첫 로그인 알림 시간 설정"
```

---

### Task 17: 사이클 리셋 + 마무리

**Files:**
- Modify: `app/(tabs)/index.tsx` (사이클 리셋 버튼)
- Modify: `hooks/useCycle.ts` (리셋 함수)

- [ ] **Step 1: useCycle에 리셋 함수 추가**

```typescript
// hooks/useCycle.ts 에 추가
const resetCurrentCycle = useCallback(async () => {
  if (!firebaseUser) return;
  await resetCycle(firebaseUser.uid);
  await refresh();
}, [firebaseUser, refresh]);

// return에 resetCurrentCycle 추가
```

- [ ] **Step 2: 홈 화면에 리셋 버튼 추가**

아이디어 생성 완료 후(ideas가 있고 cycleStatus가 ready일 때) "새로운 사이클 시작하기" 버튼 표시.

```typescript
// app/(tabs)/index.tsx 의 cycleStatus === 'ready' 블록 뒤에 추가
{cycleStatus === 'ready' && (
  <Button
    title="새로운 사이클 시작하기"
    variant="outline"
    onPress={resetCurrentCycle}
    style={{ marginTop: 12 }}
  />
)}
```

- [ ] **Step 3: 커밋**

```bash
git add hooks/useCycle.ts app/(tabs)/index.tsx
git commit -m "[기능] 사이클 리셋 기능 구현"
```

---

### Task 18: Firebase 프로젝트 설정 + 통합 테스트

**Files:** 없음 (환경 설정)

- [ ] **Step 1: Firebase 콘솔에서 프로젝트 생성**

1. https://console.firebase.google.com 에서 프로젝트 생성
2. Authentication > Google / Apple 로그인 활성화
3. Firestore Database 생성 (test mode → 보안 규칙 배포)
4. 앱 등록 (iOS / Android)

- [ ] **Step 2: .env 파일에 Firebase 설정값 입력**

Firebase 콘솔 > 프로젝트 설정 > 앱에서 config 값 복사.

- [ ] **Step 3: Gemini API 키 발급**

https://aistudio.google.com/apikey 에서 API 키 발급 → `.env`에 입력.

- [ ] **Step 4: Firestore 인덱스 배포**

```bash
npx firebase-tools deploy --only firestore:indexes
```

- [ ] **Step 5: Firestore 보안 규칙 배포**

```bash
npx firebase-tools deploy --only firestore:rules
```

- [ ] **Step 6: 전체 앱 실행 + 수동 테스트**

```bash
npx expo start
```

테스트 체크리스트:
- [ ] Google 로그인 성공
- [ ] 첫 로그인 시 알림 시간 설정 바텀시트 표시
- [ ] 사이클 시작 → 오늘의 질문 표시
- [ ] 불만 기록 저장 (텍스트 + 태그)
- [ ] 기록 후 "오늘 기록 완료" 표시
- [ ] 불만 목록에서 기록 확인
- [ ] 3개 기록 후 조기 분석 버튼 활성화
- [ ] AI 아이디어 생성 성공
- [ ] 아이디어 상세 → 상태 변경 (관심/보류/폐기)
- [ ] 사이클 리셋 → 새 사이클 시작
- [ ] 설정에서 알림 시간 변경
- [ ] 로그아웃 → 로그인 화면 이동

- [ ] **Step 7: 최종 커밋**

```bash
git add -A
git commit -m "[설정] Firebase 환경 설정 및 통합 테스트 완료"
```

---

## 주간 스케줄 요약

| 주차 | Task | 예상 시간 | 내용 |
|------|------|-----------|------|
| **Week 1** | 1~5 | 4~5시간 | 프로젝트 세팅 + 인증 + 라우팅 |
| **Week 2 전반** | 6~8 | 2~3시간 | 유틸리티 + Firestore + 사이클 로직 |
| **Week 2 후반** | 9~11 | 3~4시간 | UI 컴포넌트 + 홈 + 기록 입력 |
| **Week 3 전반** | 12~13 | 2~3시간 | 불만 목록 + 설정 화면 |
| **Week 3 후반** | 14~15 | 3~4시간 | AI 연동 + 아이디어 화면 |
| **Week 4** | 16~18 | 3~4시간 | 로컬 알림 + 리셋 + 통합 테스트 |

**총 예상 시간: ~20시간** (평일 1시간 × 12일 + 주말 2회 × 4시간)

---

## v2 보완사항 (구현 중 발견)

> MVP 구현 중 발견한 개선사항/리팩토링 목록. MVP 완성 후 진행.

- [ ] **jest 설정 정리**: jest 30 + react-native 0.83 ESM 호환 문제로 jest 29로 다운그레이드함. jest-expo가 jest 30을 공식 지원하면 업그레이드 필요.
- [ ] **@testing-library/jest-native deprecated**: `@testing-library/react-native` v12.4+의 내장 Jest matchers로 마이그레이션 필요.
- [ ] **Button 컴포넌트 접근성**: `accessibilityRole="button"`, `accessibilityState={{ disabled }}` 추가.
- [ ] **로그인 화면 UX**: 로딩 상태 표시, 에러 재시도 UI, Apple 로그인 추가.
- [ ] **탭 아이콘**: 이모지 대신 `@expo/vector-icons` 사용으로 교체.
