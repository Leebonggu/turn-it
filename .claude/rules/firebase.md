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
