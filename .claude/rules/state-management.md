---
paths:
  - "stores/**/*.ts"
  - "hooks/**/*.ts"
---

# 상태 관리 규칙

## Zustand 스토어

- 스토어 파일은 `stores/` 디렉토리
- 스토어 훅 네이밍: `use[Name]Store` (예: `useAuthStore`, `useCycleStore`)
- 스토어는 순수 상태 + setter만 포함. 비즈니스 로직은 hooks에 위치

## 커스텀 훅

- 훅 파일은 `hooks/` 디렉토리
- 훅 네이밍: `use[Name]` (예: `useAuth`, `useCycle`, `useNotification`)
- 훅에서 스토어 + 서비스를 조합하여 비즈니스 로직 구성
- `useCallback`으로 함수 메모이제이션, `useEffect`로 부수효과 관리
