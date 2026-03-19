---
paths:
  - "app/**/*.tsx"
---

# Expo Router 규칙

- 파일 기반 라우팅: `app/` 디렉토리 구조 = URL 구조
- 레이아웃: `_layout.tsx` (각 디렉토리의 레이아웃 래퍼)
- 그룹: `(auth)/`, `(tabs)/` — URL에 반영되지 않는 논리적 그룹
- 동적 경로: `[id].tsx` 형식
- 화면 간 이동: `useRouter()`, `router.push()`, `router.replace()`
- 파라미터 전달: `useLocalSearchParams()`
- 인증 가드: `app/_layout.tsx`에서 `useAuth()` + `useSegments()`로 처리
- 새 화면 추가 시 `app/` 아래 적절한 위치에 파일 생성
