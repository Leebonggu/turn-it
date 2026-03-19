# turn-it — 불만 기록 & 사업 아이디어 추천 앱

매일 불만을 기록하고 7개 모이면 AI가 사업 아이디어를 생성해주는 모바일 앱.

## 명령어

```bash
pnpm install          # 의존성 설치
pnpm start            # Expo 개발 서버
npx jest              # 테스트 전체 실행
npx jest --watch      # 테스트 감시 모드
```

## 기술 스택

- **앱**: React Native + Expo (SDK 55), Expo Router (파일 기반 라우팅)
- **인증**: Firebase Auth (Google 로그인)
- **DB**: Firestore
- **상태 관리**: Zustand
- **AI**: Gemini Flash (클라이언트 직접 호출)
- **알림**: Expo Notifications (로컬)
- **테스트**: Jest + @testing-library/react-native

## 프로젝트 구조

```
app/              Expo Router 화면 (라우팅)
components/       재사용 컴포넌트 (ui/ = 기본 UI)
hooks/            커스텀 훅 (useAuth, useCycle, useNotification)
services/         외부 서비스 (firebase, auth, firestore, ai)
stores/           Zustand 스토어 (authStore, cycleStore)
theme/            디자인 시스템 토큰 (colors, spacing, typography, radius, shadows)
constants/        상수 (questions, tags)
types/            TypeScript 타입
utils/            유틸리티 함수 (cycle, date, aiParser)
```

## 코딩 컨벤션

- TypeScript strict mode
- `StyleSheet.create` 사용, 인라인 스타일 지양
- 모든 스타일 값은 `theme/`의 디자인 토큰 사용 (`colors.primary`, `spacing.lg` 등)
- 함수형 컴포넌트 + hooks
- 네이밍: PascalCase (컴포넌트), camelCase (함수/변수), UPPER_SNAKE_CASE (상수)
- Firestore 쿼리는 `services/firestore.ts`에 집중
- 코드 작성 시 항상 테스트 코드도 함께 작성

## 커밋 메시지

- 한글 사용, 형식: `[타입] 설명`
- 타입: `기능`, `수정`, `리팩토링`, `스타일`, `설정`, `문서`
- 예: `[기능] 오늘의 질문 화면 구현`

## 사이클 로직

기록 **개수** 기반 (날짜 아님):
- 0개 + 사이클 없음 → `not_started`
- 1~2개 → `in_progress`
- 3~6개 → `early_analysis` (조기 분석 가능, 경고 표시)
- 7개 이상 → `ready` (아이디어 생성 권장)

## 참고 문서

- MVP 스펙: `docs/mvp-design.md`
- 구현 플랜: `docs/plan.md`
- 데이터 모델: `types/index.ts`
- 보안 규칙: `firestore.rules`
