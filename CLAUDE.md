# 불만 기록 & 사업 아이디어 추천 앱

> "불만 없는 사람도, 일주일간 기록하면 사업 아이디어를 얻는다."

## 프로젝트 개요

매일 하나의 질문으로 일상의 불편함을 기록하게 하고, 7일 후 AI가 사업 아이디어로 전환해주는 모바일 앱.

### 핵심 루프

1. 푸시 알림 → 오늘의 질문 → 불만 기록 (텍스트 + 태그)
2. 3일 경과 → 조기 분석 가능 / 7일 경과 → 자동 알림
3. AI 아이디어 카드 3개 생성 → 관심있음/보류/폐기 관리
4. 사이클 리셋 → 반복

## 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 앱 | React Native + Expo | Expo SDK 51+ |
| 인증 | Firebase Auth | Google / Apple 로그인 |
| DB | Firestore | |
| 푸시 | FCM + Expo Push | |
| 스케줄러 | Firebase Cloud Functions | 매일 배치 |
| AI (무료) | 미확정 (DeepSeek V3.2 / Gemini 3 Flash 검토 중) | Cloud Functions 경유 |
| AI (유료) | 미확정 (Claude Sonnet 4.6 / GPT-5 Mini 검토 중) | Cloud Functions 경유 |
| 배포 | Expo EAS | |
| 결제 | RevenueCat (검토 중) | |

## 프로젝트 구조

```
/
├── app/                    # Expo Router 파일 기반 라우팅
│   ├── (auth)/             # 인증 관련 화면
│   │   ├── login.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/             # 메인 탭 화면
│   │   ├── index.tsx       # 홈 (오늘의 질문 + 현황)
│   │   ├── complaints.tsx  # 불만 목록
│   │   ├── ideas.tsx       # 아이디어 목록
│   │   └── settings.tsx    # 설정
│   ├── record.tsx          # 기록 입력 화면
│   ├── idea/[id].tsx       # 아이디어 상세
│   └── _layout.tsx
├── components/             # 재사용 컴포넌트
│   ├── ui/                 # 기본 UI 컴포넌트
│   ├── QuestionCard.tsx
│   ├── ComplaintItem.tsx
│   ├── IdeaCard.tsx
│   └── TagSelector.tsx
├── hooks/                  # 커스텀 훅
├── services/               # 외부 서비스 연동
│   ├── firebase.ts         # Firebase 초기화
│   ├── auth.ts             # 인증
│   ├── firestore.ts        # DB 쿼리
│   └── ai.ts               # AI API 호출
├── stores/                 # 상태 관리 (zustand)
├── constants/              # 상수 (질문 풀, 태그 목록 등)
├── types/                  # TypeScript 타입 정의
├── utils/                  # 유틸리티 함수
├── functions/              # Firebase Cloud Functions
│   ├── src/
│   │   ├── push.ts         # 푸시 알림 스케줄러
│   │   └── ai.ts           # AI 아이디어 생성 API
│   └── package.json
└── assets/                 # 이미지, 폰트 등
```

## 데이터 모델 (Firestore)

```typescript
// users/{userId}
interface User {
  email: string;
  displayName: string;
  notificationTime: string; // "21:00"
  cycleStartedAt: Timestamp;
  createdAt: Timestamp;
}

// complaints/{complaintId}
interface Complaint {
  userId: string;
  questionId: string;
  content: string; // 최대 200자
  tags: Tag[];
  cycleId: string;
  createdAt: Timestamp;
}

// ideas/{ideaId}
interface Idea {
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

type Tag = '업무' | '이동' | '쇼핑' | '음식' | '앱/서비스' | '사람관계' | '건강' | '기타';
```

## 코딩 컨벤션

### 일반
- 언어: TypeScript (strict mode)
- 패키지 매니저: pnpm
- 포맷팅: Prettier (기본 설정)
- 린팅: ESLint (Expo 기본 설정)

### React Native / Expo
- 라우팅: Expo Router (파일 기반)
- 스타일링: StyleSheet.create 사용 (인라인 스타일 지양)
- 상태 관리: Zustand
- 컴포넌트: 함수형 컴포넌트 + React hooks
- 네이밍: PascalCase (컴포넌트), camelCase (함수/변수), UPPER_SNAKE_CASE (상수)

### Firebase
- Firestore 쿼리는 `services/firestore.ts`에 집중
- Cloud Functions는 `functions/` 디렉토리에서 관리
- 보안 규칙은 `firestore.rules`에 정의

### 커밋 메시지
- 한글 커밋 메시지 사용
- 형식: `[타입] 설명`
- 타입: `기능`, `수정`, `리팩토링`, `스타일`, `설정`, `문서`
- 예: `[기능] 오늘의 질문 화면 구현`

## 화면 목록

| 화면 | 경로 | 설명 |
|------|------|------|
| 스플래시 | - | 앱 로고 |
| 로그인 | `(auth)/login` | Google / Apple 소셜 로그인 |
| 온보딩 | `(auth)/onboarding` | 서비스 소개 3장 + 알림 시간 설정 |
| 홈 | `(tabs)/index` | 오늘의 질문 + 누적 현황 + 조기 분석 버튼 |
| 기록 입력 | `record` | 질문 + 텍스트/태그 입력 |
| 불만 목록 | `(tabs)/complaints` | 기록된 불만 히스토리 |
| 아이디어 목록 | `(tabs)/ideas` | 생성된 아이디어 카드 목록 |
| 아이디어 상세 | `idea/[id]` | 아이디어 + 기반 불만 연결 |
| 설정 | `(tabs)/settings` | 알림 시간, 계정 관리 |

## 사이클 로직

- 사이클 시작: 첫 기록 시 or "새로운 사이클 시작하기" 버튼
- 3일 미만: 조기 분석 버튼 비활성화
- 3~6일: 조기 분석 가능 (경고 문구 표시)
- 7일 경과: 자동 알림 + 분석 버튼 강조
- 아이디어 생성 후: 사이클 리셋 가능 (기존 데이터는 히스토리에 보관)

## 주요 참고사항

- MVP 단계: 소셜 기능, 상세 분석, 결제/구독, 위젯은 Out of Scope
- AI 모델 미확정: 무료/유료 각각 후보 모델 테스트 필요
- 앱 이름/브랜딩 미정
- 질문 풀 30개 필요 (현재 5개만 작성됨)
