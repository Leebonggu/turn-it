# 불만 기록 & 사업 아이디어 추천 앱 — MVP 설계

## 목표

1개월 내에 핵심 루프가 동작하는 앱을 완성한다.
핵심 루프: 로컬 알림 → 불만 기록 → 7일 사이클 → AI 아이디어 생성

## 대상 사용자

- 일상의 불편함을 사업 기회로 전환하고 싶은 사람
- MVP 단계에서는 본인(개발자) + 소수 테스터

## 범위

### 포함 (MVP)

| 기능 | 설명 |
|------|------|
| 소셜 로그인 | Firebase Auth — Google / Apple |
| 오늘의 질문 | 질문 풀에서 사이클 day에 맞는 질문 표시 |
| 불만 기록 | 텍스트(200자) + 태그 선택, Firestore 저장 |
| 사이클 관리 | 첫 기록 시 시작, 3일/7일 분기, 리셋 |
| AI 아이디어 생성 | 구조화된 프롬프트 + 무료 모델(Gemini Flash) → 아이디어 카드 3개 |
| 아이디어 관리 | 관심/보류/폐기 상태 변경 |
| 로컬 알림 | Expo Notifications로 매일 설정 시간에 알림 |
| 기록 히스토리 | 과거 불만 목록 조회 |
| 설정 | 알림 시간 변경, 로그아웃 |

### 제외 (MVP 이후)

- 온보딩 화면 (3장 소개)
- Cloud Functions / FCM 서버 푸시
- 결제/구독 (RevenueCat)
- 소셜 기능
- 위젯
- 상세 분석
- 과거 사이클 히스토리 라벨링 (Cycle 1, Cycle 2 등)

## 아키텍처

```
┌─────────────────────────────────┐
│  Expo (React Native)            │
│  ├─ Expo Router (파일 기반)      │
│  ├─ Zustand (상태 관리)          │
│  └─ Expo Notifications (로컬)   │
└──────────┬──────────────────────┘
           │
     ┌─────▼─────┐
     │ Firebase   │
     │ ├─ Auth    │
     │ └─ Firestore│
     └─────┬─────┘
           │
     ┌─────▼─────┐
     │ AI API     │
     │ (클라이언트│
     │  직접 호출) │
     └───────────┘
```

### AI 호출 방식 (MVP)

Cloud Functions 없이 클라이언트에서 직접 AI API 호출.
API 키는 Expo env 변수(`EXPO_PUBLIC_AI_API_KEY`)로 관리.

**보안 주의:** 클라이언트 번들에 포함되므로 앱 디컴파일 시 노출 가능.
MVP(소수 테스터)에서는 허용하되, 퍼블릭 출시 전 반드시 Cloud Functions 프록시로 전환할 것.

## 데이터 모델

CLAUDE.md에 정의된 Firestore 모델 기반.

### 컬렉션

- `users/{userId}` — 알림 시간, 사이클 시작일
- `complaints/{complaintId}` — 불만 기록 (userId, questionId, content, tags, cycleId)
- `ideas/{ideaId}` — AI 생성 아이디어 (userId, cycleId, title, solution 등)

### 사이클 ID 생성

`{userId}_{cycleStartTimestamp}` 형식. 사이클 리셋 시 새 ID 부여.
`User.cycleStartedAt`은 현재 사이클만 추적. 과거 사이클 정보는 complaints/ideas의 cycleId로 역추적.

### 질문 풀과 questionId

질문은 로컬 상수 배열(`constants/questions.ts`)로 관리.
`questionId`는 배열의 string ID (예: `"q1"`, `"q2"`). Firestore 문서 ID가 아님.

### 필요한 Firestore 복합 인덱스

- `complaints`: `userId` ASC + `cycleId` ASC + `createdAt` DESC
- `ideas`: `userId` ASC + `cycleId` ASC + `createdAt` DESC

### Firestore 보안 규칙 (MVP)

```
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

> Note: `read` = `get` + `list`. Firestore list 규칙에서 `resource.data`를 사용하면 쿼리에 반드시 해당 필드 필터가 포함되어야 함. 모든 쿼리에 `where('userId', '==', uid)`를 포함하므로 통합 규칙으로 충분.

## 질문 선택 로직

- 질문 풀: 최소 10개 (`constants/questions.ts`)
- 선택 방식: `현재 사이클 기록 개수 % 질문 풀 길이` → 인덱스 (첫 기록=q[0], 두번째=q[1], ...)
- 하루에 기록은 **1회만** 가능. 이미 오늘 기록했으면 홈에서 "오늘 기록 완료" 표시, 기록 버튼 비활성화
- 다음 사이클에서 같은 질문이 나올 수 있음 (MVP에서는 허용)

## 사이클 로직

CLAUDE.md 기준, **기록 개수 기반**으로 운영:

- **사이클 시작**: 첫 기록 시 자동 시작 또는 "새로운 사이클 시작하기" 버튼
- **3개 미만**: 분석 버튼 비활성화
- **3~6개**: 조기 분석 가능 (경고 문구: "아직 기록이 부족해요. 더 기록하면 더 좋은 아이디어가 나올 수 있어요")
- **7개 이상**: 분석 버튼 강조, 로컬 알림으로 분석 유도
- **분석 후**: 사이클 리셋 가능 (기존 데이터는 히스토리에 보관)

홈 화면 진행률 표시: `n/7` (n = 현재 사이클 기록 개수, 최대 7).
분석 버튼 활성화 조건: 현재 사이클 기록 3개 이상.

### "오늘" 판단 기준

디바이스 로컬 타임존 기준. MVP는 한국(KST) 사용자 대상이므로 별도 타임존 필드 없이 `new Date().toDateString()`으로 판단.

## 초기 알림 시간 설정

온보딩이 없으므로, **첫 로그인 시 알림 시간 설정 바텀시트**를 표시.
기본값: 21:00. 사용자가 변경하거나 확인하면 닫힘.
이후 설정 화면에서 변경 가능.

**트리거 조건:** Firestore `users/{userId}.notificationTimeSet: boolean` 필드로 관리.
- `notificationTimeSet`이 `false`이거나 없으면 홈 화면 진입 시 바텀시트 표시
- 확인/변경 완료 시 `true`로 업데이트
- 닫기(dismiss) 시에도 기본값(21:00) 저장 + `true`로 업데이트 (다시 안 뜸)

## AI 프롬프트 & 응답 구조

### 프롬프트 템플릿

```
당신은 사업 아이디어 전문가입니다.
아래는 사용자가 일상에서 느낀 불편함 목록입니다.

[불만 목록]
{{complaints를 createdAt ASC 순서로 번호 매겨서 나열}}

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

반드시 위 JSON 형식으로만 응답하세요.
```

### 응답 파싱

1. AI 응답에서 JSON 배열 추출 (코드블록 제거 등 정규화)
2. 각 아이디어를 `Idea` 모델로 변환, `basedOnComplaintIndexes` → 실제 `complaintId` 매핑
   - 프롬프트에 전달한 complaints 배열은 `createdAt ASC` 정렬 보장. 같은 순서로 인덱스 매핑.
3. Firestore에 저장, status 기본값 `'pending'`

### 실패 처리

JSON 파싱 실패 시 최대 1회 재시도. 그래도 실패하면 에러 메시지 표시.

## 화면 구성

| 화면 | 경로 | 핵심 요소 |
|------|------|-----------|
| 로그인 | `(auth)/login` | Google/Apple 버튼 |
| 홈 | `(tabs)/index` | 오늘의 질문 카드, 사이클 진행률(n/7), 분석 버튼(상태별 활성화), 오늘 기록 완료 표시 |
| 기록 입력 | `record` | 질문 표시, 텍스트 입력(200자), 태그 선택, 저장 |
| 불만 목록 | `(tabs)/complaints` | 날짜별 기록 리스트 |
| 아이디어 목록 | `(tabs)/ideas` | 아이디어 카드 리스트 |
| 아이디어 상세 | `idea/[id]` | 아이디어 내용 + 기반 불만 + 상태 변경 |
| 설정 | `(tabs)/settings` | 알림 시간 변경, 로그아웃 |

## 에러 처리

- 네트워크 오류: 토스트 메시지로 알림, 재시도 유도
- AI 응답 실패: "아이디어 생성에 실패했습니다. 다시 시도해주세요" + 재시도 버튼
- AI JSON 파싱 실패: 1회 자동 재시도 후 에러 표시
- 인증 만료: 자동 갱신, 실패 시 로그인 화면으로 이동

## 테스트 전략

- 수동 테스트 중심 (MVP 단계)
- 핵심 로직(사이클 계산, 질문 선택, AI 응답 파싱)만 유닛 테스트
