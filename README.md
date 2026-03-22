# Turn-it

일상의 불편함을 사업 아이디어로 바꿔주는 모바일 앱.

## 어떤 서비스인가요?

매일 느끼는 불편함, 짜증, 아쉬움을 기록하세요. 기록이 쌓이면 AI가 분석해서 그 불편함을 해결할 수 있는 사업 아이디어를 제안해드립니다.

### 핵심 플로우

1. **사이클 시작** — 주제를 정하고 기록을 시작해요 (예: "출퇴근 불만", "직장 스트레스")
2. **불만 기록** — 일상에서 불편한 점을 자유롭게 적고 태그를 달아요 (최대 200자)
3. **아이디어 생성** — 기록이 7개 이상 쌓이면 AI가 3개의 사업 아이디어를 만들어요
4. **아이디어 관리** — 생성된 아이디어를 평가하고, 관심 있는 아이디어를 추려요

### 사이클 시스템

불만 기록은 **사이클** 단위로 관리됩니다.

| 기록 수 | 상태 | 할 수 있는 것 |
|--------|------|-------------|
| 0~2개 | 진행 중 | 기록하기 |
| 3~6개 | 분석 가능 | 조기 분석 (정확도 낮음) |
| 7개 이상 | 준비 완료 | 아이디어 생성 (권장) |

아이디어가 생성되면 사이클이 자동 종료되고, 새로운 사이클을 시작할 수 있어요. 이전 사이클의 기록과 아이디어는 언제든 다시 볼 수 있습니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 앱 | React Native + Expo (SDK 54) |
| 라우팅 | Expo Router (파일 기반) |
| 인증 | Firebase Auth (이메일/비밀번호, Google SSO) |
| DB | Cloud Firestore |
| 상태 관리 | Zustand |
| AI | Gemini Flash (클라이언트 직접 호출) |
| 알림 | Expo Notifications (로컬) |
| 테스트 | Jest + @testing-library/react-native |

## 시작하기

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm start

# 웹으로 실행
pnpm web

# 테스트
npx jest
```

### 환경 변수

`.env` 파일을 루트에 생성하세요:

```
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

### Firebase 설정

```bash
# Firestore 보안 규칙 배포
npx firebase-tools deploy --only firestore:rules

# Firestore 인덱스 배포
npx firebase-tools deploy --only firestore:indexes
```

## 프로젝트 구조

```
app/              Expo Router 화면 (라우팅)
  (auth)/         인증 화면 (로그인, 회원가입)
  (tabs)/         메인 탭 (홈, 기록, 아이디어, 설정)
components/       재사용 컴포넌트
hooks/            커스텀 훅
services/         외부 서비스 (Firebase, AI)
stores/           Zustand 스토어
theme/            디자인 시스템 토큰
constants/        상수 (질문, 태그)
types/            TypeScript 타입
utils/            유틸리티 함수
docs/             기획 문서 및 플랜
```
