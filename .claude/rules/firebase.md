---
paths:
  - "services/**/*.ts"
  - "firestore.rules"
  - "firestore.indexes.json"
---

# Firebase 규칙

- Firestore CRUD는 모두 `services/firestore.ts`에 집중
- 인증 관련은 `services/auth.ts`에 집중
- Firebase 초기화는 `services/firebase.ts` 단일 진입점
- 모든 Firestore 쿼리에 `userId` 필터 포함 (보안 규칙과 일치)
- `serverTimestamp()` 사용하여 createdAt 생성
- 보안 규칙 변경 시 `firestore.rules` 파일 업데이트
- 새 복합 쿼리 추가 시 `firestore.indexes.json`에 인덱스 추가

## 배포 절차

Firebase 관련 파일을 수정한 경우 반드시 배포까지 완료해야 한다.

### `firestore.rules` 변경 시
```bash
npx firebase-tools deploy --only firestore:rules
```

### `firestore.indexes.json` 변경 시
```bash
npx firebase-tools deploy --only firestore:indexes
```

### 둘 다 변경 시
```bash
npx firebase-tools deploy --only firestore
```

### 주의사항
- 배포 전 `npx firebase-tools projects:list`로 로그인 상태 확인
- 로그인 만료 시 `npx firebase-tools login` 실행 (인터랙티브 — 사용자에게 직접 실행 요청)
- 프로젝트 ID: `turn-it-fa181` (`.firebaserc`에 설정됨)
- 배포 후 Firebase 콘솔에서 반영 여부 확인 가능
